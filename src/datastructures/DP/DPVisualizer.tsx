import React, { useState, useRef, useEffect } from 'react';

export interface DPCell {
    value: number | string | boolean | null | undefined;
    row: number;
    col: number;
    highlighted?: boolean;
    computed?: boolean;
    color?: string;
    label?: string;
}

export interface DPVisualizerProps {
    data: (number | string | boolean | null | undefined)[][] | (number | string | boolean | null | undefined)[]; // 2D array for 2D DP, 1D array for 1D DP
    cellWidth?: number;
    cellHeight?: number;
    highlightedCells?: [number, number][] | number[]; // For 2D: [row, col][], For 1D: index[]
    computedCells?: [number, number][] | number[];
    onCellClick?: (cell: DPCell, isShiftClick?: boolean) => void;
    rowLabels?: string[];
    colLabels?: string[];
    title?: string;
    showIndices?: boolean;
    cellColors?: { [key: string]: string };
    showComputationOrder?: boolean;
}

const DPVisualizer: React.FC<DPVisualizerProps> = ({
    data,
    cellWidth = 60,
    cellHeight = 40,
    highlightedCells = [],
    computedCells = [],
    onCellClick,
    rowLabels = [],
    colLabels = [],
    title = "",
    showIndices = true,
    cellColors = {},
    showComputationOrder = false
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mainGroupRef = useRef<SVGGElement>(null);
    const [currentCellSize, setCurrentCellSize] = useState<{width: number, height: number}>({ width: cellWidth, height: cellHeight });
    const [currentZoom, setCurrentZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [transform, setTransform] = useState({ x: 0, y: 0 });

    const is2D = Array.isArray(data[0]);
    const rows = is2D ? data.length : 1;
    const cols = is2D ? (data[0] as (number | string | boolean | null | undefined)[]).length : data.length;

    // Calculate dimensions
    const labelOffset = 30;
    const totalWidth = cols * currentCellSize.width + (colLabels.length > 0 ? labelOffset : 0);
    const totalHeight = rows * currentCellSize.height + (rowLabels.length > 0 ? labelOffset : 0);

    const getCellValue = (row: number, col: number): number | string | boolean | null | undefined => {
        return is2D ? (data as (number | string | boolean | null | undefined)[][])[row][col] : (data as (number | string | boolean | null | undefined)[])[col];
    };

    const isCellHighlighted = (row: number, col: number): boolean => {
        if (is2D) {
            return (highlightedCells as [number, number][]).some(([r, c]) => r === row && c === col);
        } else {
            return (highlightedCells as number[]).includes(col);
        }
    };

    const isCellComputed = (row: number, col: number): boolean => {
        if (is2D) {
            return (computedCells as [number, number][]).some(([r, c]) => r === row && c === col);
        } else {
            return (computedCells as number[]).includes(col);
        }
    };

    const getComputationOrder = (row: number, col: number): number => {
        if (is2D) {
            const index = (computedCells as [number, number][]).findIndex(([r, c]) => r === row && c === col);
            return index + 1;
        } else {
            const index = (computedCells as number[]).indexOf(col);
            return index + 1;
        }
    };

    const getCellColor = (row: number, col: number): string => {
        const cellValue = getCellValue(row, col);
        const key = `${row},${col}`;

        if (cellColors[key]) return cellColors[key];
        if (isCellHighlighted(row, col)) return '#ff6b6b';
        if (isCellComputed(row, col)) return '#51cf66';
        if (cellValue === null || cellValue === undefined) return '#f8f9fa';
        if (cellValue === 0) return '#e9ecef';
        return '#e3f2fd';
    };

    const handleCellClick = (row: number, col: number, event?: React.MouseEvent) => {
        if (onCellClick) {
            const cell: DPCell = {
                value: getCellValue(row, col),
                row,
                col,
                highlighted: isCellHighlighted(row, col),
                computed: isCellComputed(row, col)
            };
            onCellClick(cell, event?.shiftKey || false);
        }
    };

    const formatValue = (value: number | string | boolean | null | undefined): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
            if (value === Infinity) return '∞';
            if (value === -Infinity) return '-∞';
            return value.toString();
        }
        if (typeof value === 'boolean') return value ? 'T' : 'F';
        return String(value);
    };

    const updateTransform = () => {
        if (mainGroupRef.current) {
            mainGroupRef.current.setAttribute(
                'transform', 
                `translate(${transform.x + 25}, ${transform.y + 25}) scale(${currentZoom})`
            );
        }
    };

    useEffect(() => {
        updateTransform();
    }, [transform, currentZoom]);

    const resizeCells = (factor: number) => {
        setCurrentCellSize({
            width: Math.max(20, Math.min(120, currentCellSize.width * factor)),
            height: Math.max(15, Math.min(80, currentCellSize.height * factor))
        });
    };

    const zoomIn = () => {
        const newZoom = Math.min(10, currentZoom * 1.2);
        setCurrentZoom(newZoom);
    };

    const zoomOut = () => {
        const newZoom = Math.max(0.3, currentZoom * 0.8);
        setCurrentZoom(newZoom);
    };

    const resetZoom = () => {
        setCurrentZoom(1);
        setTransform({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left mouse button
            setIsPanning(true);
            setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setTransform({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.3, Math.min(10, currentZoom * zoomFactor));
        setCurrentZoom(newZoom);
    };

    return (
        <div ref={containerRef} className="w-full h-full border border-gray-300 bg-white relative overflow-hidden">
            {/* Controls */}
            <div className="absolute top-2 left-2 z-10 flex gap-2 flex-wrap">
                <div className="flex gap-1 bg-white rounded shadow p-1">
                    <button
                        onClick={zoomIn}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        title="Zoom in"
                    >
                        +
                    </button>
                    <button
                        onClick={zoomOut}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        title="Zoom out"
                    >
                        -
                    </button>
                    <button
                        onClick={resetZoom}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        title="Reset zoom"
                    >
                        Reset
                    </button>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {Math.round(currentZoom * 100)}%
                    </span>
                </div>

                <div className="flex gap-1 bg-white rounded shadow p-1">
                    <button
                        onClick={() => resizeCells(1.2)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        title="Increase cell size"
                    >
                        ⊞
                    </button>
                    <button
                        onClick={() => resizeCells(0.8)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        title="Decrease cell size"
                    >
                        ⊟
                    </button>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {currentCellSize.width}×{currentCellSize.height}
                    </span>
                </div>
            </div>

            {/* Title */}
            {title && (
                <div className="absolute top-2 right-2 z-10">
                    <span className="px-3 py-1 bg-white border rounded shadow text-sm font-medium">
                        {title}
                    </span>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-2 left-2 z-10 bg-white rounded shadow p-2 text-xs">
                <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-100 border"></div>
                        <span>Empty</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#e3f2fd' }}></div>
                        <span>Value</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#51cf66' }}></div>
                        <span>Computed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#ff6b6b' }}></div>
                        <span>Highlighted</span>
                    </div>
                </div>
            </div>

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${totalWidth + 100} ${totalHeight + 100}`}
                className={isPanning ? "cursor-grabbing" : "cursor-grab"}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <g ref={mainGroupRef} className="main-group" transform="translate(25, 25)">
                    {/* Background grid */}
                    <defs>
                        <pattern id="grid" width={currentCellSize.width} height={currentCellSize.height} patternUnits="userSpaceOnUse">
                            <path d={`M ${currentCellSize.width} 0 L 0 0 0 ${currentCellSize.height}`} fill="none" stroke="#f0f0f0" strokeWidth="1" />
                        </pattern>
                    </defs>

                    {/* Column labels */}
                    {colLabels.length > 0 && (
                        <g>
                            {Array.from({ length: cols }, (_, col) => (
                                <text
                                    key={`col-label-${col}`}
                                    x={(rowLabels.length > 0 ? labelOffset : 0) + col * currentCellSize.width + currentCellSize.width / 2}
                                    y={15}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#666"
                                    fontWeight="bold"
                                >
                                    {colLabels[col] || col}
                                </text>
                            ))}
                        </g>
                    )}

                    {/* Row labels */}
                    {rowLabels.length > 0 && is2D && (
                        <g>
                            {Array.from({ length: rows }, (_, row) => (
                                <text
                                    key={`row-label-${row}`}
                                    x={15}
                                    y={(colLabels.length > 0 ? labelOffset : 0) + row * currentCellSize.height + currentCellSize.height / 2 + 4}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#666"
                                    fontWeight="bold"
                                >
                                    {rowLabels[row] || row}
                                </text>
                            ))}
                        </g>
                    )}

                    {/* Grid cells */}
                    <g>
                        {Array.from({ length: rows }, (_, row) =>
                            Array.from({ length: cols }, (_, col) => {
                                const x = (rowLabels.length > 0 ? labelOffset : 0) + col * currentCellSize.width;
                                const y = (colLabels.length > 0 ? labelOffset : 0) + row * currentCellSize.height;
                                const value = getCellValue(row, col);
                                const isHighlighted = isCellHighlighted(row, col);
                                const isComputed = isCellComputed(row, col);
                                const computationOrder = getComputationOrder(row, col);

                                return (
                                    <g key={`cell-${row}-${col}`}>
                                        {/* Cell background */}
                                        <rect
                                            x={x}
                                            y={y}
                                            width={currentCellSize.width}
                                            height={currentCellSize.height}
                                            fill={getCellColor(row, col)}
                                            stroke={isHighlighted ? "#ff6b6b" : "#333"}
                                            strokeWidth={isHighlighted ? 3 : 1}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCellClick(row, col, e);
                                            }}
                                            className="transition-all duration-200 hover:stroke-blue-500"
                                        />

                                        {/* Cell value */}
                                        <text
                                            x={x + currentCellSize.width / 2}
                                            y={y + currentCellSize.height / 2 + 4}
                                            textAnchor="middle"
                                            fontSize={Math.min(currentCellSize.width / 4, 14)}
                                            fill="#333"
                                            pointerEvents="none"
                                            fontWeight={isHighlighted ? "bold" : "normal"}
                                        >
                                            {formatValue(value)}
                                        </text>

                                        {/* Cell indices */}
                                        {showIndices && (
                                            <text
                                                x={x + 2}
                                                y={y + 10}
                                                fontSize={Math.min(currentCellSize.width / 8, 8)}
                                                fill="#999"
                                                pointerEvents="none"
                                            >
                                                {is2D ? `[${row},${col}]` : `[${col}]`}
                                            </text>
                                        )}

                                        {/* Computation order */}
                                        {showComputationOrder && isComputed && computationOrder > 0 && (
                                            <circle
                                                cx={x + currentCellSize.width - 8}
                                                cy={y + 8}
                                                r={6}
                                                fill="#2e7d32"
                                                stroke="white"
                                                strokeWidth={1}
                                            />
                                        )}

                                        {showComputationOrder && isComputed && computationOrder > 0 && (
                                            <text
                                                x={x + currentCellSize.width - 8}
                                                y={y + 11}
                                                textAnchor="middle"
                                                fontSize="8"
                                                fill="white"
                                                pointerEvents="none"
                                                fontWeight="bold"
                                            >
                                                {computationOrder}
                                            </text>
                                        )}

                                        {/* Computed indicator (when not showing order) */}
                                        {!showComputationOrder && isComputed && (
                                            <circle
                                                cx={x + currentCellSize.width - 6}
                                                cy={y + 6}
                                                r={3}
                                                fill="#2e7d32"
                                            />
                                        )}
                                    </g>
                                );
                            })
                        )}
                    </g>

                    {/* Grid overlay */}
                    <rect
                        x={rowLabels.length > 0 ? labelOffset : 0}
                        y={colLabels.length > 0 ? labelOffset : 0}
                        width={cols * currentCellSize.width}
                        height={rows * currentCellSize.height}
                        fill="url(#grid)"
                        pointerEvents="none"
                    />
                </g>
            </svg>
        </div>
    );
};


export default DPVisualizer;