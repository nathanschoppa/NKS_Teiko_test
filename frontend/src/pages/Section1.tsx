{/* 
  AUTHOR: Nathaniel Schoppa 
  DATE: August 26 2026
  
  This is Section 1. It contains CSS for the title and text, dropdowns to control
  the sample and cell type filter, and the cell count table
  */}

import { useState, useEffect } from 'react'
import { fetchTable1, fetchOptions, type Table1Row, type OptionsResponse } from '../api/index'
import Table1 from '../components/Table1'
import VirtualizedMultiSelect from '../components/VirtualizedMultiSelect'
import  * as Style  from '../styles/common'

const Section1 = () => {
    // ── State ──────────────────────────────────────────────────────────────────
    const [data, setData] = useState<Table1Row[]>([])
    const [options, setOptions] = useState<OptionsResponse | null>(null)
    const [selectedSamples, setSelectedSamples] = useState<string[]>([])
    const [selectedPopulations, setSelectedPopulations] = useState<string[]>([])

    // ── Fetch options once on load ─────────────────────────────────────────────
    useEffect(() => {
        fetchOptions().then(setOptions)
    }, [])

    // ── Fetch table data whenever filters change ───────────────────────────────
    useEffect(() => {
        fetchTable1({
            // sort_by: sortBy,
            samples: selectedSamples,
            populations: selectedPopulations
        }).then(setData)
    }, [selectedSamples, selectedPopulations])

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div style={Style.sectionCard}>
            <p style={Style.sectionLabel}>Section 1</p>
            <h2 style={Style.sectionTitle}>Data Overview: Cell Counts</h2>
            <p style={Style.sectionText}>
                This section contains a live-access record of cell count information, drawn from
                the database. To use, select any column's sort arrow to sort the dataset.
                Select any samples or cell types from 'Filter by Sample' and 'Filter by Cell Type'
                to filter the dataset. At any time, press the orange 'Download' button to download
                the current selection as a csv file. Use the arrows at the bottom of the table to
                look through the full dataset.
            </p>

            {/* Dropdowns */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <VirtualizedMultiSelect
                    label="Filter by Sample"
                    options={options?.samples ?? []}
                    value={selectedSamples}
                    onChange={setSelectedSamples}
                    width={300}
                />
                <VirtualizedMultiSelect
                    label="Filter by Cell Type"
                    options={options?.populations ?? []}
                    value={selectedPopulations}
                    onChange={setSelectedPopulations}
                    width={300}
                />
            </div>

            {/* Table */}
            <Table1 data={data} />
        </div>
    )
}



export default Section1