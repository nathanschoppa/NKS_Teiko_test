import { MaterialReactTable, useMaterialReactTable, type MRT_Row, createMRTColumnHelper } from 'material-react-table'
import { Box, Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { type Table1Row } from '../api/index'
import { WHITE, GREY_LIGHT, GREY_BG, BORDER, ACCENT } from '../styles/common'
import TablePagination from '../components/TablePagination'


type Props = {
    data: Table1Row[]
}

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename: 'filtered_cell_counts'
})

const columnHelper = createMRTColumnHelper<Table1Row>()

const columns = [
    columnHelper.accessor('sample',      { header: 'Sample' }),
    columnHelper.accessor('population',  { header: 'Population' }),
    columnHelper.accessor('total_count', { header: 'Total Count' }),
    columnHelper.accessor('count',       { header: 'Count' }),
    columnHelper.accessor('proportion',  { header: 'Percentage (%)' }),
]

const Table1 = ({ data }: Props) => {
    const handleExportAllRows = (rows: MRT_Row<Table1Row>[]) => {
        const rowData = rows.map(row => row.original)
        const csv = generateCsv(csvConfig)(rowData)
        download(csvConfig)(csv)
    }

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
        renderBottomToolbar: ({ table }) => <TablePagination table={table} />,
        positionToolbarAlertBanner: 'bottom',
        initialState: {
            density: 'compact'
        },
        defaultColumn: {
            minSize: 50,
            maxSize: 200,
            size: 100,
        },
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.index % 2 === 0 ? WHITE : GREY_LIGHT,
            }
        }),
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: '16px', padding: '8px' }}>
                <Button
                    disabled={table.getPrePaginationRowModel().rows.length === 0}
                    onClick={() => handleExportAllRows(table.getPrePaginationRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                >
                    Export
                </Button>
            </Box>
        ),
    })

    return <MaterialReactTable table={table} />
}

export default Table1