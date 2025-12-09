// Primitive data types that can be displayed in the visualizer cells
// data can only be numbers, strings, boolean
export type IDPData = number | string | boolean;

// Two-dimensional array of primitive data (matrix/table format)
export type IDPData2D = IDPData[][];

// One-dimensional array of primitive data (linear/vector format)
export type IDPData1D = IDPData[];

// Color configuration for cell styling with a label for identification
export interface IDPColor {
    color: string;  // CSS color value (hex, rgb, named color, etc.)
    label: string;  // Human-readable label for this color scheme
}

// Represents a single cell in the visualizer with its data and metadata
export interface IDPCell {
    value: IDPData;           // The actual data value to display
    row: number              // Row index (0-based)
    col: number              // Column index (0-based)
    highlighted?: boolean    // Whether this cell should be visually highlighted
    computed?: boolean       // Whether this cell represents a computed/derived value
    color?: string          // Optional CSS color for custom cell styling
    label?: string          // Optional text label to display with the cell
}

// Main props interface for the IDP (Interactive Data Programming) Visualizer component
export interface IDPVisualizerProps {
    data: IDPData2D | IDPData1D  // The data to visualize (supports 1D or 2D arrays)
    width?: number | string       // Container width (px number or CSS string like "100%")
    height?: number | string      // Container height (px number or CSS string like "100%")
    cellWidth?: number           // Width of individual cells in pixels
    cellHeight?: number          // Height of individual cells in pixels
    highlightedCells?: [number, number][] | number[]  // Cells to highlight: [row, col][] for 2D or indices[] for 1D
    computedCells?: [number, number][] | number[]     // Cells marked as computed: [row, col][] for 2D or indices[] for 1D
    onCellClick?: (cell: IDPCell, isShiftClick?: boolean) => void  // Callback when a cell is clicked
    rowLabels?: string[]         // Labels to display for each row
    colLabels?: string[]         // Labels to display for each column
    title?: string               // Title text displayed above the visualizer
    showIndices?: boolean        // Whether to show row/column indices
    cellColors?: Record<string, IDPColor>  // Mapping of cell identifiers to color configurations
    showComputationOrder?: boolean  // Whether to display the order of computation
    maxColsPerRow?: number       // For 1D arrays: max columns before wrapping to new row
}