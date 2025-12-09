import React, { useState } from 'react';
import { type IDPVisualizerProps, type IDPData, type IDPData1D, type IDPData2D, type IDPCell } from './type';

const DPVisualizer: React.FC<IDPVisualizerProps> = ({
    data,
    width = "100%",
    height = "100%",
    cellWidth = 60,
    cellHeight = 40,
    highlightedCells = [],
    computedCells = [],
    onCellClick,
    rowLabels,
    colLabels,
    title = "",
    showIndices = true,
    cellColors = {},
    showComputationOrder = false,
    maxColsPerRow = 10  // Default to 10 columns per row for 1D arrays
}) => {
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

    // Determine if data is 1D or 2D
    const is2D = Array.isArray(data[0])
    const originalLength = !is2D ? (data as IDPData1D).length : 0

    // For 1D arrays, calculate rows and cols based on wrapping
    const rows = is2D
        ? (data as IDPData2D).length
        : Math.ceil(originalLength / maxColsPerRow)
    const cols = is2D
        ? (data as IDPData2D)[0].length
        : Math.min(originalLength, maxColsPerRow)

    // Auto-generate labels if not provided
    const autoRowLabels = rowLabels ?? (is2D ? Array.from({ length: rows }, (_, i) => String(i)) : [])
    const autoColLabels = colLabels ?? (is2D
        ? Array.from({ length: cols }, (_, i) => String(i))
        : []  // For 1D with wrapping, we'll generate labels per row
    )

    // Helper functions
    const getActualIndex = (row: number, col: number): number => {
        // For wrapped 1D arrays, convert row/col back to original index
        return row * maxColsPerRow + col
    }

    const getCellValue = (row: number, col: number): IDPData => {
        if (is2D) {
            return (data as IDPData2D)[row][col]
        } else {
            const index = getActualIndex(row, col)
            return index < originalLength ? (data as IDPData1D)[index] : ''
        }
    }

    const isCellHighlighted = (row: number, col: number): boolean => {
        if (is2D) {
            return (highlightedCells as [number, number][]).some(([r, c]) => r === row && c === col)
        } else {
            const index = getActualIndex(row, col)
            return (highlightedCells as number[]).includes(index)
        }
    }

    const isCellComputed = (row: number, col: number): boolean => {
        if (is2D) {
            return (computedCells as [number, number][]).some(([r, c]) => r === row && c === col)
        } else {
            const index = getActualIndex(row, col)
            return (computedCells as number[]).includes(index)
        }
    }

    const getComputationOrder = (row: number, col: number): number => {
        if (is2D) {
            const index = (computedCells as [number, number][]).findIndex(([r, c]) => r === row && c === col)
            return index + 1
        } else {
            const actualIndex = getActualIndex(row, col)
            const index = (computedCells as number[]).indexOf(actualIndex)
            return index + 1
        }
    }

    const getCellColorStyle = (row: number, col: number): string => {
        // For 1D wrapped arrays, use actual index; for 2D, use row,col
        const key = is2D ? `${row},${col}` : String(getActualIndex(row, col))
        if (cellColors[key]?.color) return cellColors[key].color
        if (isCellHighlighted(row, col)) return '#ff6b6b'
        if (isCellComputed(row, col)) return '#51cf66'

        const value = getCellValue(row, col)
        if (typeof value === 'number' && value === 0) return '#e9ecef'
        return '#e3f2fd'
    }

    const getCellClasses = (row: number, col: number): string => {
        const isHighlighted = isCellHighlighted(row, col)
        const isComputed = isCellComputed(row, col)
        const isHovered = hoveredCell?.row === row && hoveredCell?.col === col

        return `
			relative border-2 cursor-pointer transition-all duration-200
			${isHighlighted ? 'border-red-500 shadow-lg ring-2 ring-red-300' : 'border-gray-400'}
			${isComputed && !isHighlighted ? 'ring-2 ring-green-300' : ''}
			${isHovered ? 'transform scale-110 z-20 shadow-xl' : ''}
			hover:border-blue-500
		`
    }

    const formatValue = (value: IDPData): string => {
        if (typeof value === 'number') {
            if (value === Infinity) return '∞'
            if (value === -Infinity) return '-∞'
            return value.toString()
        }
        if (typeof value === 'boolean') return value ? 'T' : 'F'
        return String(value)
    }

    const getFontSize = (value: IDPData): number => {
        // if value is up to 5 digits, return 12px
        // if value is more than 5 digits, return 10px
        // if value is more than 10 digits, return 8px
        const valueString = formatValue(value)
        if (valueString.length <= 5) return 12
        if (valueString.length <= 10) return 10
        return 8
    }

    const handleCellClick = (row: number, col: number, event: React.MouseEvent) => {
        if (onCellClick) {
            // For wrapped 1D arrays, use actual index as col
            const actualCol = !is2D ? getActualIndex(row, col) : col
            const cell: IDPCell = {
                value: getCellValue(row, col),
                row: is2D ? row : 0,  // For 1D, always row 0
                col: actualCol,
                highlighted: isCellHighlighted(row, col),
                computed: isCellComputed(row, col)
            }
            onCellClick(cell, event.shiftKey)
        }
    }

    return (
        <div
            className="relative bg-white border border-gray-300 h-full overflow-auto"
            style={{ width, height }}
        >
            {/* Title */}
            {title && (
                <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-3">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
            )}

            {/* Legend */}
            <div className="sticky top-14 z-10 bg-white/95 backdrop-blur p-2 mx-2 mt-2 rounded shadow-sm border border-gray-200">
                <div className="flex gap-4 flex-wrap text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400" style={{ backgroundColor: '#e3f2fd' }} />
                        <span>Default</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400" style={{ backgroundColor: '#51cf66' }} />
                        <span>Computed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-red-500" style={{ backgroundColor: '#ff6b6b' }} />
                        <span>Highlighted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400" style={{ backgroundColor: '#e9ecef' }} />
                        <span>Zero</span>
                    </div>

                    {/* add for custom colors */}
                    {Object.entries(cellColors).map(([key, { color, label }]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-400" style={{ backgroundColor: color }} />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Grid Container */}
            <div className="p-4">
                <div className="inline-block space-y-2">
                    {/* Grid Rows */}
                    {Array.from({ length: rows }, (_, row) => (
                        <div key={`row-${row}`}>
                            {/* Column Labels for wrapped 1D arrays - show per row */}
                            {!is2D && (
                                <div className="flex mb-1">
                                    {Array.from({ length: cols }, (_, col) => {
                                        const actualIndex = getActualIndex(row, col)
                                        if (actualIndex >= originalLength) return null
                                        return (
                                            <div
                                                key={`col-label-${row}-${col}`}
                                                className="flex items-center justify-center font-semibold text-xs text-gray-600"
                                                style={{ width: cellWidth, marginLeft: col > 0 ? '4px' : 0 }}
                                            >
                                                {actualIndex}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Column Labels for 2D arrays - show once at top */}
                            {is2D && row === 0 && autoColLabels.length > 0 && (
                                <div className="flex mb-2">
                                    {autoRowLabels.length > 0 && <div style={{ width: cellWidth }} />}
                                    {Array.from({ length: cols }, (_, col) => (
                                        <div
                                            key={`col-label-${col}`}
                                            className="flex items-center justify-center font-semibold text-sm text-gray-700 border-b-2 border-gray-300"
                                            style={{ width: cellWidth, marginLeft: col > 0 ? '4px' : 0 }}
                                        >
                                            {autoColLabels[col] || col}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center">
                                {/* Row Label for 2D arrays */}
                                {autoRowLabels.length > 0 && is2D && (
                                    <div
                                        className="flex items-center justify-center font-semibold text-sm text-gray-700 border-r-2 border-gray-300 mr-2"
                                        style={{ width: cellWidth, height: cellHeight }}
                                    >
                                        {autoRowLabels[row] || row}
                                    </div>
                                )}

                                {/* Cells */}
                                <div className="flex gap-1">
                                    {Array.from({ length: cols }, (_, col) => {
                                        // Skip empty cells for wrapped 1D arrays
                                        if (!is2D) {
                                            const actualIndex = getActualIndex(row, col)
                                            if (actualIndex >= originalLength) return null
                                        }

                                        const value = getCellValue(row, col)
                                        const isHighlighted = isCellHighlighted(row, col)
                                        const isComputed = isCellComputed(row, col)
                                        const computationOrder = getComputationOrder(row, col)
                                        const actualIndex = !is2D ? getActualIndex(row, col) : -1

                                        return (
                                            <div
                                                key={`cell-${row}-${col}`}
                                                className={getCellClasses(row, col)}
                                                style={{
                                                    width: cellWidth,
                                                    height: cellHeight,
                                                    backgroundColor: getCellColorStyle(row, col)
                                                }}
                                                onClick={(e) => handleCellClick(row, col, e)}
                                                onMouseEnter={() => setHoveredCell({ row, col })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                {/* Cell indices */}
                                                {showIndices && (
                                                    <div className="absolute top-0 left-1 text-[9px] text-gray-500 font-mono">
                                                        {is2D ? `[${row},${col}]` : `[${actualIndex}]`}
                                                    </div>
                                                )}

                                                {/* Cell value */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span
                                                        style={{
                                                            fontSize: getFontSize(value)
                                                        }}
                                                        className={`
                                                        font-mono text-gray-800
                                                        ${isHighlighted ? 'font-bold text-red-700' : ''}
                                                        ${isComputed && !isHighlighted ? 'font-semibold text-green-700' : ''}
                                                    `}>
                                                        {formatValue(value)}
                                                    </span>
                                                </div>

                                                {/* Computation order */}
                                                {showComputationOrder && isComputed && computationOrder > 0 && (
                                                    <div className="absolute top-1 right-1 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center">
                                                        <span className="text-[10px] font-bold">{computationOrder}</span>
                                                    </div>
                                                )}

                                                {/* Computed indicator (when not showing order) */}
                                                {!showComputationOrder && isComputed && (
                                                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hover Info Panel */}
            {hoveredCell && (
                <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 z-30 max-w-xs">
                    <div className="text-sm space-y-1">
                        <div className="font-semibold text-gray-700">Cell Info</div>
                        <div className="text-xs space-y-0.5 font-mono">
                            <div>Position: {is2D ? `[${hoveredCell.row}, ${hoveredCell.col}]` : `[${hoveredCell.col}]`}</div>
                            <div>Value: <span className="font-semibold">{formatValue(getCellValue(hoveredCell.row, hoveredCell.col))}</span></div>
                            <div>Highlighted: {isCellHighlighted(hoveredCell.row, hoveredCell.col) ? 'Yes' : 'No'}</div>
                            <div>Computed: {isCellComputed(hoveredCell.row, hoveredCell.col) ? 'Yes' : 'No'}</div>
                            {showComputationOrder && isCellComputed(hoveredCell.row, hoveredCell.col) && (
                                <div>Order: #{getComputationOrder(hoveredCell.row, hoveredCell.col)}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DPVisualizer