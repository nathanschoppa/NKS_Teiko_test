// note that useVirtualizer cannot be memoized
// this is not a problem for this application

import { useState, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box, Button, Checkbox, TextField, Paper, ListItem, ListItemText, Chip, ClickAwayListener } from '@mui/material'

type Props = {
    options: string[]
    value: string[]
    onChange: (selected: string[]) => void
    label: string
    width?: number | string
    defaultValue?: string[]
}

const ITEM_HEIGHT = 40
const MAX_HEIGHT = 320

const VirtualizedMultiSelect = ({ options, value, onChange, label, width = 300 }: Props) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const parentRef = useRef<HTMLDivElement>(null)

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    // const allSelected = value.length === options.length
    const selectedSet = new Set(value)

    const virtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ITEM_HEIGHT,
        overscan: 10,
    })

    const toggleOption = (opt: string) => {
        if (selectedSet.has(opt)) {
            onChange(value.filter(v => v !== opt))
        } else {
            onChange([...value, opt])
        }
    }

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Box sx={{ width, position: 'relative' }}>
            {/* Input display */}
            <Box
                onClick={() => setOpen(o => !o)}
                sx={{
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    minHeight: 38,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    alignItems: 'center',
                }}
            >
                {value.length === 0 && (
                    <span style={{ color: '#999', fontSize: 13 }}>{label}</span>
                )}
                {value.length > 0 && value.length <= 3 && value.map(v => (
                    <Chip key={v} label={v} size="small" onDelete={(e) => {
                        e.stopPropagation()
                        toggleOption(v)
                    }} />
                ))}
                {value.length > 3 && (
                    <Chip size="small" label={`${value.length} selected`} />
                )}
            </Box>

            {/* Dropdown */}
            {open && (
                <Paper elevation={4} sx={{ position: 'absolute', zIndex: 1300, width: '100%', mt: 0.5 }}>
                    {/* Search */}
                    <Box sx={{ p: 1 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                        />
                    </Box>

                    {/* Select All / Deselect All */}
                    <Box sx={{ display: 'flex', gap: 1, px: 1, pb: 0.5 }}>
                        <Button size="small" onClick={() => onChange([...options])}>
                            {'Select All'}
                        </Button>
                        <Button size="small" onClick={() => onChange([])}>
                            {'Deselect All'}
                        </Button>
                    </Box>

                    {/* Virtualized list */}
                    <Box
                        ref={parentRef}
                        sx={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}
                    >
                        <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                            {virtualizer.getVirtualItems().map(virtualItem => {
                                const opt = filtered[virtualItem.index]
                                return (
                                    <ListItem
                                        key={opt}
                                        dense
                                        onClick={() => toggleOption(opt)}
                                        sx={{
                                            position: 'absolute',
                                            top: virtualItem.start,
                                            width: '100%',
                                            cursor: 'pointer',
                                            height: ITEM_HEIGHT,
                                        }}
                                    >
                                        <Checkbox
                                            size="small"
                                            checked={selectedSet.has(opt)}
                                            sx={{ mr: 1 }}
                                        />
                                        <ListItemText primary={opt} />
                                    </ListItem>
                                )
                            })}
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
        </ClickAwayListener>
    )
}

export default VirtualizedMultiSelect