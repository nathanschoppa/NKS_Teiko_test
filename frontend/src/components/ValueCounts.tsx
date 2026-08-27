import { Box, Typography, LinearProgress } from '@mui/material'
import  * as Style  from '../styles/common'

type ValueCountsData = Record<string, Record<string, number> | number>

type Props = {
    data: ValueCountsData
    columns:string[]
}

const ValueCounts = ({ data, columns }: Props) => {
    if (!data || Object.keys(data).length === 0) return null

    const filtered = Object.fromEntries(
        Object.entries(data).filter(([col]) => columns.includes(col))
    )

    return (
        <Box>
            <Typography variant="h3" style={Style.subsectionTitle}>
                Sample Counts For Selected Factors
            </Typography>

            {Object.entries(filtered).map(([col, counts]) => {
                // Numeric case — subject/sample unique count
                if (typeof counts === 'number') {
                    return (
                        <Typography
                            key={col}
                            variant="body2"
                            sx={{ color: Style.ACCENT, fontWeight: 700, textTransform: 'uppercase', mb: 1 }}
                        >
                            {col} {counts}
                        </Typography>
                    )
                }

                // Dict case — progress bars
                const total = Object.values(counts).reduce((a, b) => a + b, 0)

                return (
                    <Box key={col} sx={{ mb: 2 }}>
                        {/* Column header */}
                        <Typography
                            variant="body2"
                            sx={{ color: Style.ACCENT, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}
                        >
                            {col}
                        </Typography>

                        {/* One row per unique value */}
                        {Object.entries(counts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([val, count]) => {
                                const pct = ((count / total) * 100).toFixed(1)
                                return (
                                    <Box
                                        key={val}
                                        sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px', alignItems: 'center', gap: 1, mb: 0.5 }}
                                    >
                                        <Typography variant="body2" noWrap>
                                            {val}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Number(pct)}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: Style.BORDER,
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: Style.ACCENT,
                                                    borderRadius: 4,
                                                }
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ textAlign: 'right' }}>
                                            {count} ({pct}%)
                                        </Typography>
                                    </Box>
                                )
                            })}
                    </Box>
                )
            })}
        </Box>
    )
}

export default ValueCounts