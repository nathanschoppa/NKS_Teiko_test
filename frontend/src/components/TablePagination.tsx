// ignore the 'any' warning

// note that parsed = pageIndex + 1
// this is to support 0-based indexing and 1-based display

import { useState } from 'react'
import { type MRT_TableInstance } from 'material-react-table'

type Props = {
    table: MRT_TableInstance<any>
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

const TablePagination = ({ table }: Props) => {
    const { pageIndex, pageSize } = table.getState().pagination
    const totalRows = table.getPrePaginationRowModel().rows.length
    const pageCount = Math.ceil(totalRows / pageSize)
    const [inputValue, setInputValue] = useState(String(pageIndex + 1))

    const goToPage = (page: number) => {
        const clamped = Math.max(0, Math.min(page, pageCount - 1))
        table.setPageIndex(clamped)
        setInputValue(String(clamped + 1))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleInputCommit = () => {
        const parsed = parseInt(inputValue, 10)
        if (!isNaN(parsed)) {
            goToPage(parsed - 1)
        } else {
            setInputValue(String(pageIndex + 1))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleInputCommit()
    }

    return (
        <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'flex-end',
            gap:            '8px',
            padding:        '8px 16px',
            fontSize:       '13px',
            color:          '#444',
        }}>
            {/* Rows per page */}
            <span>Rows per page</span>
            <select
                value={pageSize}
                onChange={e => {
                    table.setPageSize(Number(e.target.value))
                    table.setPageIndex(0)
                    setInputValue('1')
                }}
                style={{
                    fontSize:     '13px',
                    border:       '1px solid #ccc',
                    borderRadius: '4px',
                    padding:      '2px 4px',
                    cursor:       'pointer',
                }}
            >
                {ROWS_PER_PAGE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>

            {/* Navigation */}
            <button onClick={() => goToPage(0)} disabled={pageIndex === 0}>«</button>
            <button onClick={() => goToPage(pageIndex - 1)} disabled={pageIndex === 0}>‹</button>

            {/* Page input */}
            <input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputCommit}
                onKeyDown={handleKeyDown}
                style={{
                    width:        '40px',
                    textAlign:    'center',
                    fontSize:     '13px',
                    border:       '1px solid #ccc',
                    borderRadius: '4px',
                    padding:      '2px 4px',
                }}
            />
            <span>/ {pageCount}</span>

            <button onClick={() => goToPage(pageIndex + 1)} disabled={pageIndex >= pageCount - 1}>›</button>
            <button onClick={() => goToPage(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>»</button>
        </div>
    )
}

export default TablePagination