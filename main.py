'''
AUTHOR: Nathaniel Schoppa
DATE: August 26 2026
 
FastAPI backend for React app. Most analytical functions are stored in
`analysis.py`, although this contains a function for applying filters
(in the format {column: []}) and handles pivot logic.
'''

import pandas as pd
from analysis import pairwise_test, fetch_tables
from models import Table1Request, BoxplotRequest, Table2Request
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware


# ── Load data ──────────────────────────────────────────────────────────
DB_PATH = r'teiko.db'
cell_data, analysis_data, col_list = fetch_tables(DB_PATH)

# ── Initialize FastAPI ──────────────────────────────────────────────────────────

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

# ── Helper Functions ────────────────────────────────────────────────────────────
def apply_filters(df: pd.DataFrame, filters: dict[str, list]) -> pd.DataFrame:
    '''Apply a filters dict to a dataframe.'''
    for col, vals in filters.items():
        if col in df.columns:
            df = df[df[col].isin(vals)]
    return df

# ── Filters Throughout ──────────────────────────────────────────────────────────
@app.post('/api/options')
def get_options():
    '''
    Defines the range of values for filter dropdowns, visualization
    '''
    return {
        'samples':     cell_data['sample'].unique().tolist(),
        'populations': cell_data['population'].unique().tolist(),
        'columns':     list(col_list),
        'filters': {
            col: analysis_data[col].dropna().unique().tolist()
            for col in col_list
            if col not in ['subject', 'sample']
        }
    }

# ── Section 1 Information ──────────────────────────────────────────────────────────

@app.post('/api/table1')
def get_cells(req: Table1Request):
    filtered = cell_data.copy()
    ##CellsRequest has 
    # samples: list of sample ids to visualize; if empty, do not filter
    # populations: list of cell_types to vlsialize; if empty, do not filter
    
    ## filtering
    if req.samples:
        filtered = filtered[filtered['sample'].isin(req.samples)]
    if req.populations:
        filtered = filtered[filtered['population'].isin(req.populations)]
    ## Sorting
    if req.sort_by == 'proportion':
        #show high proportions first
        filtered = filtered.sort_values(by=req.sort_by, ascending=False)
    else:
        #otherwise fine
        filtered = filtered.sort_values(by=req.sort_by)

    return filtered.to_dict(orient='records')

# ── Section 2 Information ──────────────────────────────────────────────────────────

@app.post('/api/boxplot')
def get_boxplot(req: BoxplotRequest):
    filtered = analysis_data.copy()
    ##BoxplotRequest has
    # factor: column to split sample by; default response
    # filters: dictionary of metadata column: list of selected values

    # if req.factor == 'response':
    #     #response is default only column to have Null values
    #     filtered = filtered[~filtered['response'].isna()]

    ## Apply filters
    if req.filters:
        filtered = apply_filters(filtered, req.filters)

    ## Subset dataframe to get data necessary for the boxplot
    plot_data = (
        filtered[['population', 'proportion', req.factor]].to_dict(orient='records')
        if req.factor else []
    )
    ## Run pairwise t-tests
    ttest_data = (
        pairwise_test(filtered, req.factor).to_dict(orient='records')
        if req.factor else []
    )

    return {'plot_data': plot_data, 'ttest': ttest_data}

# ── Section 3 Information ──────────────────────────────────────────────────────────

@app.post('/api/table2')
def get_analytics(req: Table2Request):
    filtered = analysis_data.copy()
    ##Table2Request has
    # columns: list of columns to aggregate over. If all present, than will show full wide data
    # filters: dictionary of metadata column:list of selected values
    # show_proportions: whether to show raw cell counts or proportions

    ## Apply filters
    if req.filters:
        filtered = apply_filters(filtered, req.filters)
    if filtered.empty: #in case illegal combination of filters
        return {'table': [], 'columns': [], 'value_counts': {}}

    ## Determine included columns, cell types
    # note that we iterate through col_list to enforce a standard column order
    _col_list = [c for c in col_list if c in req.columns] or []
    cell_types = filtered['population'].dropna().unique().tolist()

    ## Pivot to wide data
    pivoted = pd.pivot_table(
        filtered,
        index=_col_list,
        columns='population',
        values='count',
        aggfunc='mean',
        margins=True
    ).reset_index()

    ## Move summary row to top (easy viewing) and create a total count column
    pivoted = pd.concat([pivoted.iloc[[-1]], pivoted.iloc[:-1]]).reset_index(drop=True)
    #when pivoted, 'All' is the average cell count. Multiply by numer of cell types
    #to get the total cell count
    pivoted['All'] = pivoted['All'] * len(cell_types)
    pivoted = pivoted.rename(columns={'All': 'total_count'})

    cell_types_full = cell_types + ['total_count']

    ## If requested, convert to proportions
    if req.show_proportions:
        pivoted[cell_types_full] = pivoted[cell_types_full].div(pivoted['total_count'], axis=0)

    pivoted[cell_types_full] = pivoted[cell_types_full].round(3)

    ## Determine value counts fo each row, excluding subject and sample (unique; not meaningful information)
    value_counts = {
        col: filtered[col].value_counts(dropna=False).to_dict()
        if col not in ['subject', 'sample']
        else len(filtered[col].unique())
        for col in col_list
    }

    return {
        'table':        pivoted.to_dict(orient='records'),
        'columns':      list(pivoted.columns),
        'value_counts': value_counts
    }