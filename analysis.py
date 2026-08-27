'''
AUTHOR: Nathaniel Schoppa
DATE: August 26 2026
 
Contains all the analysis and data loading functions required for main.py
 
Outputs:
    outputs/sample_data.csv             — Part 1: raw cell data
    outputs/proportions_boxplot.png     — Part 2: cell type proportions by response
    outputs/pairwise_results.csv        — Part 2: pairwise t-test results
    outputs/cell_analytics_summary.csv  — Part 3: pivot table summary
'''

import pandas as pd
from teiko_database import _db_connection
from scipy.stats import ttest_ind
import statsmodels.stats.multitest as multitest
from itertools import combinations

def pairwise_test(filtered:pd.DataFrame, factor:str) -> pd.DataFrame | None:
    '''
    Completes a pairwise t-test for cell types accross a chosen factor

    If successful, returns dataframe. Else, empty dataframe
    '''
    #redundant
    if not factor:
        return pd.DataFrame()
    rows = []
    levels = filtered[factor].dropna().unique()
    #check if enough levels to do a t-test. If not, return empty dataframe
    if len(levels) < 2:
        return pd.DataFrame()

    cell_types = filtered['population'].dropna().unique()

    #do the actual test. Compute as rows and then build dataframe
    for _type in cell_types:
        for pair in list(combinations(levels,2)):
            _x1 = filtered['proportion'][(filtered['population'] == _type)&(filtered[factor] == pair[0])]
            _x2 = filtered['proportion'][(filtered['population'] == _type)&(filtered[factor] == pair[1])]
            
            if len(_x1) == 0 or len(_x2) == 0:
                continue
            
            rows.append({
                'cell_type':_type,
                'comparison': f'{pair[0]} - {pair[1]}',
                'p-value':ttest_ind(_x1,_x2).pvalue
            })

    #load test data as a dataframe
    _df = pd.DataFrame(data=rows)
    #do p-adjustment with Holms and BH FDR methods
    _, _df['p-adj'], _, _ = multitest.multipletests(_df['p-value'],method='holm')
    _, _df['FDR BH'], _, _ = multitest.multipletests(_df['p-value'],method='fdr_bh')
    _df['p-value'] = _df['p-value'].map(lambda x: float(f'{x:.3g}'))
    _df['p-adj']   = _df['p-adj'].map(lambda x: float(f'{x:.3g}'))
    _df['FDR BH']  = _df['FDR BH'].map(lambda x: float(f'{x:.3g}'))
    return _df

def compute_value_counts(df:pd.DataFrame, columns:list[str])->dict[dict]:
    '''Computes value counts for the filtered dataframe, Skips subject and sample (too many)'''
    if not df.empty:
        if df['project'].iloc[0]:
            df = df.iloc[1:]
    value_counts = dict()
    for col in columns:
        #subject/sample (1:1) have too many values, so instead just
        #return the total count
        if col in ['subject','sample']:
            # counts = len(df[col])
            pass
        else:
            counts = df[col].value_counts().to_dict()
            value_counts[col] = counts
    return value_counts

def fetch_tables(db_path):
    with _db_connection(db_path) as conn:
        #cell count information from CELL_COUNT
        cell_data = pd.read_sql('''SELECT sample as sample,
                                    cell_type as population,
                                    SUM(cell_count) OVER (PARTITION BY sample) AS total_count, 
                                    cell_count as count,
                                    ROUND(CAST(cell_count AS FLOAT) / SUM(cell_count) OVER (PARTITION BY sample), 4) AS proportion
                                FROM CELL_COUNT 
                                ORDER BY sample''',conn)
        #non-identifying subject and sample information
        sample_data = pd.read_sql('''SELECT sub.project as project,
                                        sub.subject as subject,
                                        sam.sample as sample,
                                        sub.condition as condition,
                                        sub.treatment as treatment,
                                        sub.response as response,
                                        sub.sex as sex,
                                        sam.sample_type as sample_type,
                                        sam.time_from_treatment_start as time_from_treatment_start
                                    FROM subject sub
                                    JOIN sample sam 
                                    ON sub.subject = sam.subject
                                ''',conn)

    #filled NaN value with 'Na'. Note: isna still catches these, but is a valid input
    sample_data['response'] = sample_data['response'].fillna('NA')

    ###Data used for statistical analysis, Section 2
    analysis_data = pd.merge(sample_data,cell_data,on='sample')

    return cell_data, analysis_data, sample_data.columns