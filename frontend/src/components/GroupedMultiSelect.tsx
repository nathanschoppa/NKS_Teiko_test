// note that useVirtualizer cannot be memoized
// this is not a problem for this application

// note that values currently can be strings or numbers (time from treatment start)
// they must be converted to string for drawing purposes BUT remain as raw values
// for actual filtering

import { useState, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box, Button, Checkbox, TextField, Paper, ListItem, ListItemText, Chip, Typography, ClickAwayListener } from '@mui/material'

type GroupedOptions = Record<string, string[]>

type Props = {
    options: GroupedOptions
    value: Record<string, (string | number)[]>
    onChange: (selected: Record<string, (string | number)[]>) => void
    label: string
    width?: number | string
    defaultValue?: string[]
}

const ITEM_HEIGHT = 40
const GROUP_HEIGHT = 32
const MAX_HEIGHT = 320

// Flatten grouped options into a list of items for virtualization
type FlatItem =
    | { type: 'group'; label: string }
    | { type: 'option'; group: string; value: string |number }

const buildFlatList = (options: GroupedOptions, search: string): FlatItem[] => {
    const items: FlatItem[] = []
    for (const [group, values] of Object.entries(options)) {
        const filtered = values.filter(v =>
            String(v).toLowerCase().includes(search.toLowerCase()) ||
            group.toLowerCase().includes(search.toLowerCase())
        )
        if (filtered.length > 0) {
            items.push({ type: 'group', label: group })
            for (const v of filtered) {
                items.push({ type: 'option', group, value: v })
            }
        }
    }
    return items
}

const GroupedMultiSelect = ({ options, value, onChange, label, width = 300 }: Props) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const parentRef = useRef<HTMLDivElement>(null)

    const flatItems = buildFlatList(options, search)

    const virtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (i) => flatItems[i].type === 'group' ? GROUP_HEIGHT : ITEM_HEIGHT,
        overscan: 10,
    })

    const isSelected = (group: string, val: string | number) =>
        (value[group] ?? []).includes(val)

    const toggleOption = (group: string, val: string | number) => {
        const current = value[group] ?? []
        const updated = current.includes(val)
            ? current.filter(v => v !== val)
            : [...current, val]

        const next = { ...value }
        if (updated.length === 0) {
            delete next[group]
        } else {
            next[group] = updated
        }
        onChange(next)
    }

    const handleSelectAll = () => {
        const all: Record<string, string[]> = {}
        for (const [group, vals] of Object.entries(options)) {
            all[group] = [...vals]
        }
        onChange(all)
    }

    // Build chip summary
    const chipSummary = Object.entries(value).flatMap(([group, vals]) =>
        vals.map(v => `${group}: ${String(v)}`)
    )

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
                {chipSummary.length === 0 && (
                    <span style={{ color: '#999', fontSize: 13 }}>{label}</span>
                )}
                {chipSummary.length > 0 && chipSummary.length <= 3 && chipSummary.map(s => (
                    <Chip key={s} label={s} size="small" />
                ))}
                {chipSummary.length > 3 && (
                    <Chip size="small" label={`${chipSummary.length} filters active`} />
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
                        <Button size="small" onClick={handleSelectAll}>
                            {'Select All'}
                        </Button>
                        <Button size="small" onClick={() => onChange({})}>
                            {'Deselect All'}
                        </Button>
                    </Box>

                    {/* Virtualized list */}
                    <Box ref={parentRef} sx={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}>
                        <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                            {virtualizer.getVirtualItems().map(virtualItem => {
                                const item = flatItems[virtualItem.index]
                                if (item.type === 'group') {
                                    return (
                                        <Box
                                            key={`group-${item.label}`}
                                            sx={{
                                                position: 'absolute',
                                                top: virtualItem.start,
                                                width: '100%',
                                                height: GROUP_HEIGHT,
                                                display: 'flex',
                                                alignItems: 'center',
                                                px: 2,
                                                backgroundColor: '#f5f5f5',
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    )
                                }
                                return (
                                    <ListItem
                                        key={`${item.group}-${item.value}`}
                                        dense
                                        onClick={() => toggleOption(item.group, item.value)}
                                        sx={{
                                            position: 'absolute',
                                            top: virtualItem.start,
                                            width: '100%',
                                            height: ITEM_HEIGHT,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Checkbox
                                            size="small"
                                            checked={isSelected(item.group, item.value)}
                                            sx={{ mr: 1 }}
                                        />
                                        <ListItemText primary={String(item.value)} />
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

export default GroupedMultiSelect