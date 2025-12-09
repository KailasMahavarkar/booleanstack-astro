import type React from "react"
import { useState } from "react"
import { type IMemoryVisualizerProps, type IMemoryCell } from "./type"

const MemoryVisualizer: React.FC<IMemoryVisualizerProps> = ({
    memoryData,
    width = "100%",
    height = "600px",
    cellWidth = 80,
    cellHeight = 40,
    showAddresses = true,
    showTypes = true,
    showReferences = true,
    onCellClick,
    title = "Memory Layout",
}) => {
    const [hoveredCell, setHoveredCell] = useState<number | null>(null)

    // Calculate grid dimensions
    const containerWidth = typeof width === "number" ? width : 800
    const cellsPerRow = Math.max(1, Math.floor((containerWidth - 40) / cellWidth))
    const rows = Math.ceil(memoryData.length / cellsPerRow)
    const gridHeight = rows * cellHeight + 100

    // Color mappings
    const typeColors = {
        stack: "bg-green-300",
        heap: "bg-red-300",
        global: "bg-teal-300",
        code: "bg-yellow-300",
    }

    const getCellBgClass = (cell: IMemoryCell): string => {
        if (cell.highlighted) return "bg-red-500"
        if (cell.referenced) return "bg-yellow-400"
        if (!cell.allocated) return "bg-gray-100"
        return typeColors[cell.type] || "bg-gray-200"
    }

    return (
        <div
            className="relative border border-gray-300 bg-white overflow-auto"
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
                        <div className="w-4 h-4 bg-green-300 border border-gray-400 rounded" />
                        <span>Stack</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-300 border border-gray-400 rounded" />
                        <span>Heap</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-teal-300 border border-gray-400 rounded" />
                        <span>Global</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-300 border border-gray-400 rounded" />
                        <span>Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 border border-gray-400 rounded" />
                        <span>Highlighted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded" />
                        <span>Free</span>
                    </div>
                </div>
            </div>

            {/* Memory Grid */}
            <div
                className="p-4"
                style={{ minHeight: gridHeight }}
            >
                <div
                    className="grid gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${cellsPerRow}, ${cellWidth}px)`,
                        width: `${cellsPerRow * cellWidth + (cellsPerRow - 1) * 4}px`
                    }}
                >
                    {memoryData.map((cell, index) => (
                        <div
                            key={`cell-${index}`}
                            className={`
                                relative border-2 rounded cursor-pointer transition-all
                                ${getCellBgClass(cell)}
                                ${cell.highlighted ? 'border-red-600 shadow-lg' : 'border-gray-400'}
                                ${hoveredCell === index ? 'transform scale-105 shadow-md z-10' : ''}
                                hover:border-blue-500
                            `}
                            style={{
                                width: cellWidth,
                                height: cellHeight,
                            }}
                            onClick={() => onCellClick?.(cell)}
                            onMouseEnter={() => setHoveredCell(index)}
                            onMouseLeave={() => setHoveredCell(null)}
                        >
                            {/* Address */}
                            {showAddresses && (
                                <div className="absolute top-0 left-0 text-[8px] px-1 text-gray-600 font-mono">
                                    {cell.address}
                                </div>
                            )}

                            {/* Value */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`
                                    text-xs font-mono text-gray-800
                                    ${cell.highlighted ? 'font-bold' : ''}
                                `}>
                                    {cell.value !== null ? String(cell.value) : "null"}
                                </span>
                            </div>

                            {/* Variable name */}
                            {cell.variable && (
                                <div className="absolute bottom-0 left-0 right-0 text-[9px] text-center text-gray-600 font-mono px-1 truncate">
                                    {cell.variable}
                                </div>
                            )}

                            {/* Type indicator */}
                            {showTypes && (
                                <div
                                    className={`
                                        absolute top-1 right-1 w-2 h-2 rounded-sm border border-gray-600
                                        ${typeColors[cell.type].replace('bg-', 'bg-')}
                                    `}
                                    style={{
                                        backgroundColor: cell.type === 'stack' ? '#10b981' :
                                            cell.type === 'heap' ? '#ef4444' :
                                                cell.type === 'global' ? '#14b8a6' :
                                                    '#eab308'
                                    }}
                                />
                            )}

                            {/* Reference indicator */}
                            {showReferences && cell.referenced && (
                                <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-500 rounded-full border border-gray-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Panel for Hovered Cell */}
            {hoveredCell !== null && memoryData[hoveredCell] && (
                <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 z-30 max-w-xs">
                    <div className="text-sm space-y-1">
                        <div className="font-semibold text-gray-700">Cell Info</div>
                        <div className="text-xs space-y-0.5 font-mono">
                            <div>Address: {memoryData[hoveredCell].address}</div>
                            <div>Type: <span className="font-semibold">{memoryData[hoveredCell].type}</span></div>
                            <div>Value: {memoryData[hoveredCell].value ?? 'null'}</div>
                            {memoryData[hoveredCell].variable && (
                                <div>Variable: {memoryData[hoveredCell].variable}</div>
                            )}
                            <div>Size: {memoryData[hoveredCell].size} bytes</div>
                            <div>Allocated: {memoryData[hoveredCell].allocated ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MemoryVisualizer