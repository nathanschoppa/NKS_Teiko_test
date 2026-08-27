'''
AUTHOR: Nathaniel Schoppa
DATE: August 26 2026
 
Generates static output files for the Teiko pipeline.
Called by `make pipeline` after load_data.py.
 
Outputs:
    outputs/sample_data.csv             — Part 1: raw cell data
    outputs/proportions_boxplot.png     — Part 2: cell type proportions by response
    outputs/pairwise_results.csv        — Part 2: pairwise t-test results
    outputs/cell_analytics_summary.csv  — Part 3: pivot table summary
'''
from pathlib import Path
import pandas as pd
import plotly.express as px
from analysis import pairwise_test, fetch_tables
import logging
 
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)
 
# ── Config ─────────────────────────────────────────────────────────────────────
DB_PATH    = Path('teiko.db')
OUTPUT_DIR = Path('outputs')
OUTPUT_DIR.mkdir(exist_ok=True)
 
# ── Default filter settings (matching dashboard defaults) ──────────────────────
PART2_FACTOR  = 'response'
PART2_FILTERS = {
    'treatment':  ['miraclib'],
    'sample_type': ['PBMC'],
    'condition':  ['melanoma'],
}
 
PART3_COLUMNS = ['project', 'subject', 'condition', 'age', 'sex',
                 'treatment', 'response', 'sample_type',
                 'time_from_treatment_start']
PART3_FILTERS = {
    'treatment':                 ['miraclib'],
    'sample_type':               ['PBMC'],
    'condition':                 ['melanoma'],
    'time_from_treatment_start': [0],
}
 
# ── Load data from database ────────────────────────────────────────────────────
cell_data, analysis_data, col_list = fetch_tables(DB_PATH)
 
# ── Helper ─────────────────────────────────────────────────────────────────────
def _apply_filters(df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    '''Apply a dict of {column: [values]} filters to a DataFrame.'''
    filtered = df.copy()
    for col, vals in filters.items():
        filtered = filtered[filtered[col].isin(vals)]
    return filtered
 
 
# ── Part 1: raw sample data ────────────────────────────────────────────────────
def save_sample_data():
    logger.info('Part 1 — saving sample data...')
    out = OUTPUT_DIR / 'sample_data.csv'
    cell_data.to_csv(out, index=False)
    logger.info(f'Saved {len(cell_data)} rows to {out}')
 
 
# ── Part 2: boxplot + pairwise test ───────────────────────────────────────────
def generate_response_barchart(filtered: pd.DataFrame,
                                factor: str | None):
    return px.box(
        filtered,
        x='population',
        y='proportion',
        color=factor,
        points='outliers',
        title=f'Cell Type Proportions by {factor.title() if factor else ""}',
    )
 
def save_part2(analysis_data: pd.DataFrame):
    logger.info('Part 2 — generating boxplot and pairwise results...')
 
    # Apply filters
    filtered = analysis_data.copy()
    filtered = filtered[~filtered['response'].isna()]
    filtered = _apply_filters(filtered, PART2_FILTERS)
 
    # Boxplot
    fig = generate_response_barchart(filtered, PART2_FACTOR)
    plot_out = OUTPUT_DIR / 'proportions_boxplot.png'
    fig.write_image(plot_out)
    logger.info(f'Saved plot to {plot_out}')
 
    # Pairwise test
    _df = pairwise_test(filtered, PART2_FACTOR)
    if not _df.empty:
        csv_out = OUTPUT_DIR / 'pairwise_results.csv'
        _df.to_csv(csv_out, index=False)
        logger.info(f'Saved {len(_df)} rows to {csv_out}')
    else:
        logger.warning('Part 2 — pairwise test returned no results')
 
 
# ── Part 3: cell analytics pivot table ────────────────────────────────────────
def save_part3(analysis_data: pd.DataFrame):
    logger.info('Part 3 — generating cell analytics summary...')
 
    # Apply filters
    filtered = _apply_filters(analysis_data, PART3_FILTERS)
 
    if filtered.empty:
        logger.warning('Part 3 — no data after filtering, skipping')
        return
 
    _cell_types = filtered['population'].dropna().unique().tolist()
    _col_list   = [c for c in PART3_COLUMNS if c in filtered.columns]
 
    # Pivot table — matching filter_cell_table logic exactly
    pivot = pd.pivot_table(
        filtered,
        index=_col_list,
        columns='population',
        values='count',
        aggfunc='mean',
        margins=True,
    ).reset_index()
 
    pivot.columns.name = None
 
    # Move margin row to top
    pivot = pd.concat(
        [pivot.iloc[[-1]], pivot.iloc[:-1]]
    ).reset_index(drop=True)
 
    # Convert All column to total_count
    pivot['All'] = pivot['All'] * int(len(_cell_types))
    pivot = pivot.rename(columns={'All': 'total_count'})
 
    # Round
    _cell_types_full = _cell_types + ['total_count']
    pivot[_cell_types_full] = pivot[_cell_types_full].round(3)
 
    out = OUTPUT_DIR / 'cell_analytics_summary.csv'
    pivot.to_csv(out, index=False)
    logger.info(f'Saved {len(pivot)} rows to {out}')
 
 
# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    logger.info('Loading analysis data from database...')
    logger.info(f'Loaded {len(analysis_data)} rows')
 
    save_sample_data(DB_PATH)
    save_part2(analysis_data)
    save_part3(analysis_data)
 
    logger.info(f'All outputs saved to {OUTPUT_DIR}/')