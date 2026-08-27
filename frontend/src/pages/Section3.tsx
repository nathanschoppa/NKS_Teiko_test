{/* 
  AUTHOR: Nathaniel Schoppa 
  DATE: August 26 2026
  
  This is Section 3. It contains CSS for the title and text, dropdowns to control
  the columns used to pivot cell counts and filter the data, preset filter buttons, and
  a graphical representation of value counts.
  */}
  
import { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Switch } from '@mui/material'
import { fetchTable2, fetchOptions, type OptionsResponse, type Table2Response } from '../api/index'
import GroupedMultiSelect from '../components/GroupedMultiSelect'
import VirtualizedMultiSelect from '../components/VirtualizedMultiSelect'
import Table2 from '../components/Table2'
import ValueCounts from '../components/ValueCounts'
import  * as Style  from '../styles/common'

// ── Filter presets, defined once ─────────────────────────────────────────────────
const PRESET_1 = {
    treatment: ['miraclib'],
    sample_type: ['PBMC'],
    condition: ['melanoma'],
    time_from_treatment_start: [0]
}
const PRESET_2 = {
    condition: ['melanoma'],
    response: ['yes'],
    time_from_treatment_start: [0],
    sex: ['M']
}

const Section3 = () => {
     // ── State ──────────────────────────────────────────────────────────────────
    const [result, setResult] = useState<Table2Response | null>(null)
    const [options, setOptions] = useState<OptionsResponse | null>(null)
    const [columns, setColumns] = useState<string[]>([])
    const [showProportions, setShowProportions] = useState<boolean>(false)
    const [filters, setFilters] = useState<Record<string, (string | number)[]>>({})

    // ── Fetch options once on load ─────────────────────────────────────────────
    useEffect(() => {
        fetchOptions().then(opts => {
            setOptions(opts)
            setColumns(opts.columns)
        })
    }, [])

    // ── Fetch pivoted table, toggle proportions, and fetch value counts whenever updated
    useEffect(() => {
        fetchTable2( {columns, filters, show_proportions: showProportions}).then(setResult)
    }, [columns, filters, showProportions])

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box style = {Style.sectionCard}>
            <p style={Style.sectionLabel}>Section 3</p>
            <h2 style={Style.sectionTitle}>Cell Count Data</h2>
            <p style={Style.sectionText}>
                This section contains further information about samples, including sample
                metadata and wide format cell counts or proportions. By default, the table
                displays sample-level counts and metadata. Use the 'Pivot over Columns...' 
                dropdown (left) to select factors to pivot over. Us the 'Narrow Down
                Conditions' dropdown (right) to filter the dataset. Note that some combinations
                will result in an empty dataset. Press the 'Toggle Proportions' button to
                switch the dataset between cell counts (or averaged cell counts) and
                cell proportions (or averaged cell proportions). At any time, press the blue 
                'Export' button to download the current selection as a csv file. Use the 
                arrows at the bottom of the table to look through the full dataset. 
                <br /><br />
                Below the table, there are 'Set Filter' buttons. Press to set a preset of
                factors and filters. The first filter corresponds to your inital questions
                (and is the app default). The second can be used to find the average number
                of B cells for Melanoma male responders at time=0.
                <br /><br />
                Finally, at the bottom, the is a breakdown of unique factor values in the
                current selection. Note that it will not display unique subject nor sample
                ids.
            </p>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <VirtualizedMultiSelect
                    label='Pivot over Columns...'
                    options={options?.columns ?? []}
                    value={columns}
                    onChange={setColumns}
                    width={300}
                />
                <GroupedMultiSelect
                    label='Narrow Down Conditions...'
                    options={options?.filters ?? {}}
                    value={filters}
                    onChange={setFilters}
                    width={350}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={showProportions}
                            onChange={e => setShowProportions(e.target.checked)}
                        />
                    }
                    label='Show Proportions'
                />
            </Box>
            <Table2 data={result?.table ?? []}/>
            <Box sx={{ mt: 4, mb: 4 }}>
                <h3 style={Style.subsectionTitle}>Preset Filters</h3>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button style={Style.ButtonStyle} variant='outlined' size='small' onClick={() => setFilters(PRESET_1)}>
                        Preset 1
                    </Button>
                    <span style={{ ...Style.subsectionText, alignSelf: 'center' }}>Melanoma / miraclib / PBMC / T0</span>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button style={Style.ButtonStyle} variant='outlined' size='small' onClick={() => setFilters(PRESET_2)}>
                        Preset 2
                    </Button>
                    <span style={{ ...Style.subsectionText, alignSelf: 'center' }}>Melanoma / Responders / Male / T0</span>
                </Box>
            </Box>
            <Box sx={{ mt: 4 }}>
                <ValueCounts data={result?.value_counts ?? {}} columns={columns}/>
            </Box>
        </Box>
    )
}

export default Section3