// if explicit columnOrder is not passed, then column order
// will vary accoring to select/deselect order

import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_Row } from 'material-react-table'
import { Box, Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { WHITE, GREY_LIGHT, GREY_BG, BORDER, ACCENT } from '../styles/common'
import TablePagination from '../components/TablePagination'

type CsvRow = Record<string, string | number | boolean | null | undefined>
type Props = {
    data: Record<string, unknown>[]
}

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename: 'cell_count_data'
})

const Table2 = ({ data}: Props) => {
    // console.log('_columns received:', data.length ? Object.keys(data[0]) : [])
    
    const handleExportAllRows = (rows: MRT_Row<Record<string, unknown>>[]) => {
        const rowData = rows.map(row => row.original as CsvRow) 
        const csv = generateCsv(csvConfig)(rowData)
        download(csvConfig)(csv)
    }

    const columns = useMemo(
        () => (data.length ? Object.keys(data[0]).map((key) => ({
            accessorKey: key,
            header: key.toUpperCase(),
            })) : []),
        [data]
    )

    const table = useMaterialReactTable({
        columns,
        data,
        state: {columnOrder: data.length ? Object.keys(data[0]) : []},
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
            minSize: 20,
            maxSize: 200,
            size: 40,
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

export default Table2