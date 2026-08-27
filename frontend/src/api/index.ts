

// ── Helper Function ────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:8000'

async function post<T>(endpoint: string, body: object = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
    }
    return response.json()
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type Table1Row = {
    sample: string
    population: string
    count: number
    total_count: number
    proportion: number
}

export type OptionsResponse = {
    samples: string[]                   //Selected samples by sample ids
    populations: string[]               //Selected cell types
    columns: string[]                   //All columns in table2
    filters: Record<string, string[]>   //All possible filters
}

export type TTestRow = {
    cell_type: string
    comparison: string
    'p-value': number
    'p-adj': number
    'FDR BH': number
}

export type BoxplotResponse = {
    plot_data: Record<string, unknown>[]
    ttest: TTestRow[]
}

export type Table2Response = {
    table: Record<string, unknown>[]
    columns: string[]
    value_counts: Record<string, Record<string, number>>
}

// ── API functions ───────────────────────────────────────────────────────────────

// Fetch option information at start to populate filters
export function fetchOptions() {
    return post<OptionsResponse>('/api/options')
}

// Fetch Table1
export function fetchTable1(body: {
    samples?: string[]
    populations?: string[]
}) {
    return post<Table1Row[]>('/api/table1', body)
}

//Fetch Boxplot data and ttest table
export function fetchBoxplot(body: {
    factor?: string | null
    filters?: Record<string, (string | number)[]>
}) {
    return post<BoxplotResponse>('/api/boxplot', body)
}

//Fetch Table2 data
export function fetchTable2(body: {
    columns?: string[]
    filters?: Record<string, (string | number)[]>
    show_proportions?: boolean
}) {
    return post<Table2Response>('/api/table2', body)
}