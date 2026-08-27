import Plot from 'react-plotly.js'

type Props = {
    data: Record<string, unknown>[]
    factor: string | null
}

const BoxplotChart = ({ data, factor }: Props) => {
    if (!data.length || !factor) {
        return <p style={{ color: '#999' }}>Select a factor to display the boxplot.</p>
    }

    // Get unique factor levels and populations
    // NOTE: we must explicitly test null and undefined
    // because v=0 is considered falsy
    const levels = [...new Set(
        data.map(r => r[factor])
            .filter(v => v !== null && v !== undefined)
    )]
    // const populations = [...new Set(data.map(r => r['population'] as string))]

    // Build one trace per factor level
    const traces = levels.map(level => ({
        type: 'box' as const,
        name: level,
        x: data.filter(r => r[factor] === level).map(r => r['population'] as string),
        y: data.filter(r => r[factor] === level).map(r => r['proportion'] as number),
        boxpoints: 'outliers' as const,
    }))

    return (
        <Plot
            data={traces}
            layout={{
                title: {text: `Cell Type Proportions by ${factor}`},
                xaxis: { title: { text: 'Cell Type' } },
                yaxis: { title: { text: 'Proportion' } },
                boxmode: 'group',
                autosize: true,
            }}
            style={{ width: '100%', height: 500 }}
            useResizeHandler
        />
    )
}

export default BoxplotChart