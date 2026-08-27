{/* 
  AUTHOR: Nathaniel Schoppa 
  DATE: August 26 2026
  
  This is Section 2. It contains CSS for the title and text, dropdowns to control
  the boxplot factor and filters, the boxplot, and a table of multiple t-test results
  */}
  
import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { fetchBoxplot, fetchOptions, type OptionsResponse, type BoxplotResponse } from '../api/index'
import GroupedMultiSelect from '../components/GroupedMultiSelect'
import VirtualizedSingleSelect from '../components/VirtualizedSingleSelect'
import BoxplotChart from '../components/boxplot'
import PairwiseTable from '../components/ttest_table'
import  * as Style  from '../styles/common'

const Section2 = () => {
    // ── State ──────────────────────────────────────────────────────────────────
    const [options, setOptions] = useState<OptionsResponse | null>(null)
    const [filters, setFilters] = useState<Record<string, (string | number)[]>>({
        treatment: ['miraclib'],
        sample_type: ['PBMC'],
        condition: ['melanoma'],
        time_from_treatment_start: [0]
    })
    const factorOptions = (options?.columns ?? []).filter(
        col => !['subject', 'sample'].includes(col)
    )
    const [factor, setFactor] = useState<string | null>('response')
    const [result, setResult] = useState<BoxplotResponse | null>(null)
    
    // ── Fetch options once on load ─────────────────────────────────────────────
    useEffect(() => {
        fetchOptions().then(setOptions)
    }, [])

    // ── Redo and fetch plot, t-test filters or factor change ───────────────────
    useEffect(() => {
        fetchBoxplot({ factor, filters }).then(setResult)
    }, [factor, filters])

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div style = {Style.sectionCard}>
            <p style={Style.sectionLabel}>Section 2</p>
            <h2 style={Style.sectionTitle}>Visualizations</h2>
            <p style={Style.sectionText}>
                This section contains boxplots comparing cell type proportions. Use the 'Choose Factor-By
                Column' dropdown (left) to choose a factor to compare over. Use the 'Narrow Down Conditions'
                dropdown (right) to select filters for the data. Note that some combinations of filters will
                result in only one level or no data selected; simply clear filters to resume. *If* chosen factors
                and filters have more than one level, a multiple t-test is performed per cell type (table 
                below). The table reports p-values, Holms adjusted p-values, and Benjamini-Hochberg False
                Discover Rate. Rows with Holms adjusted p-values less than 0.05 are highlighted in red. Note that 
                the table will be empty if there are not enough levels to compare over.
            </p>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {/* Factor selector — single select */}
                <VirtualizedSingleSelect
                    label="Split by..."
                    options={factorOptions ?? []}
                    value={factor ? [factor] : []}
                    onChange={selected => setFactor(selected[0] ?? null)}
                    width={250}
                />

                {/* Metadata filters */}
                <GroupedMultiSelect
                    label="Narrow Down Conditions..."
                    options={options?.filters ?? {}}
                    value={filters}
                    onChange={setFilters}
                    width={350}
                />
            </Box>

            {/* Boxplot */}
            <BoxplotChart data={result?.plot_data ?? []} factor={factor} />

            {/* T-test table */}
            <PairwiseTable data={result?.ttest ?? []} factor={factor} />
        </div>
    )
}

export default Section2