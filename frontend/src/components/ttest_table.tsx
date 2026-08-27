import { MaterialReactTable, useMaterialReactTable, createMRTColumnHelper } from 'material-react-table'
import { type TTestRow } from '../api/index'
import { WHITE, GREY_LIGHT, GREY_BG, BORDER, ACCENT, ACCENT_LIGHT, subsectionTitle, subsectionText } from '../styles/common'

type Props = {
    data: TTestRow[]
    factor: string | null
}

const columnHelper = createMRTColumnHelper<TTestRow>()

const columns = [
    columnHelper.accessor('cell_type',   { header: 'Cell Type' }),
    columnHelper.accessor('comparison',  { header: 'Comparison' }),
    columnHelper.accessor('p-value',     { header: 'p-value' }),
    columnHelper.accessor('p-adj',       { header: 'Holm p-adj' }),
    columnHelper.accessor('FDR BH',      { header: 'FDR BH' }),
]

const PairwiseTable = ({ data, factor }: Props) => {
    const table = useMaterialReactTable({
        columns,
        data,
        enableRowSelection:         false,
        enableColumnActions:        false,
        enableDensityToggle:        false,
        enableFullScreenToggle:     false,
        enableHiding:               false,
        enableColumnFilters:        false,
        enableGlobalFilter:         false,
        paginationDisplayMode:      'pages',
        enableToolbarInternalActions: false,
        enableTopToolbar: false,
        initialState: {
            density: 'compact'
        },
        defaultColumn: {
            minSize: 50,
            maxSize: 200,
            size: 100,
        },
        muiTableHeadRowProps: {
            sx: {
                backgroundColor: GREY_BG
            }
        },
        muiTableHeadCellProps: {
            sx: {
                borderRight: `1px solid ${BORDER}`,
                borderBottom: `2px solid ${ACCENT}`,
                fontSize: '13px',
            }
        },
        muiTableBodyCellProps: {
            sx: {
                borderRight: `1px solid ${BORDER}`,
                fontSize: '13px',
            }
        },
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.original['p-adj'] < 0.05
                    ? ACCENT_LIGHT  // light red tint for significant rows
                    : row.index % 2 === 0
                        ? WHITE
                        : GREY_LIGHT,
                '& td': {
                    fontWeight: row.original['p-adj'] < 0.05 ? 700 : 400,
                }
            }
        })
    })

    if (!factor) return null
    if (!data.length) return <p style={subsectionText}>No pairwise results to display.</p>

    return (
        <div>
            <h3 style={subsectionTitle}>Multiple t-test Across {factor}</h3>
            <MaterialReactTable table={table} />
        </div>
    )
}

export default PairwiseTable