import React, { useState, useRef, useEffect } from 'react';
import * as d3 from "d3";

interface MemoryCell {
    address: string;
    value: string | number | null;
    type: 'stack' | 'heap' | 'global' | 'code';
    variable?: string;
    size: number;
    allocated: boolean;
    highlighted?: boolean;
    referenced?: boolean;
}

interface MemoryVisualizerProps {
    memoryData: MemoryCell[];
    width?: number;
    height?: number;
    cellWidth?: number;
    cellHeight?: number;
    showAddresses?: boolean;
    showTypes?: boolean;
    showReferences?: boolean;
    onCellClick?: (cell: MemoryCell) => void;
    title?: string;
}

const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
    memoryData,
    width = 800,
    height = 600,
    cellWidth = 80,
    cellHeight = 40,
    showAddresses = true,
    showTypes = true,
    showReferences = true,
    onCellClick,
    title = "Memory Layout"
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [transform, setTransform] = useState({ x: 0, y: 0 });
    const [currentCellSize, setCurrentCellSize] = useState({ width: cellWidth, height: cellHeight });
    const [zoomBehavior, setZoomBehavior] = useState<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    // Calculate layout
    const cellsPerRow = Math.floor((width - 100) / currentCellSize.width);
    const rows = Math.ceil(memoryData.length / cellsPerRow);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        if (svg.empty()) return;

        // Create zoom behavior
        const zoomBehaviorInstance = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 10])
            .on("zoom", (event) => {
                setZoom(event.transform.k);
                setTransform({ x: event.transform.x, y: event.transform.y });
            });

        try {
            svg.call(zoomBehaviorInstance);
            setZoomBehavior(zoomBehaviorInstance);
        } catch (error) {
            console.warn('Failed to initialize zoom behavior:', error);
        }

        return () => {
            try {
                svg.on('.zoom', null);
            } catch (error) {
                console.warn('Failed to cleanup zoom behavior:', error);
            }
        };
    }, []);

    const getCellColor = (cell: MemoryCell): string => {
        if (cell.highlighted) return '#ff6b6b';
        if (cell.referenced) return '#ffd93d';

        switch (cell.type) {
            case 'stack': return cell.allocated ? '#a8e6cf' : '#f0f0f0';
            case 'heap': return cell.allocated ? '#ff8b94' : '#f0f0f0';
            case 'global': return cell.allocated ? '#96ceb4' : '#f0f0f0';
            case 'code': return cell.allocated ? '#feca57' : '#f0f0f0';
            default: return '#f0f0f0';
        }
    };

    const getTypeColor = (type: string): string => {
        switch (type) {
            case 'stack': return '#2ecc71';
            case 'heap': return '#e74c3c';
            case 'global': return '#27ae60';
            case 'code': return '#f39c12';
            default: return '#95a5a6';
        }
    };

    const handleCellClick = (cell: MemoryCell) => {
        if (onCellClick) {
            onCellClick(cell);
        }
    };

    const resetZoom = () => {
        if (!svgRef.current || !zoomBehavior) return;
        const svg = d3.select(svgRef.current);
        if (svg.empty()) return;
        
        try {
            svg.transition().duration(500).call(
                zoomBehavior.transform,
                d3.zoomIdentity
            );
        } catch (error) {
            console.warn('Failed to reset zoom:', error);
        }
    };

    const zoomIn = () => {
        if (!svgRef.current || !zoomBehavior) return;
        const svg = d3.select(svgRef.current);
        if (svg.empty()) return;
        
        try {
            svg.transition().duration(300).call(
                zoomBehavior.scaleBy,
                1.2
            );
        } catch (error) {
            console.warn('Failed to zoom in:', error);
        }
    };

    const zoomOut = () => {
        if (!svgRef.current || !zoomBehavior) return;
        const svg = d3.select(svgRef.current);
        if (svg.empty()) return;
        
        try {
            svg.transition().duration(300).call(
                zoomBehavior.scaleBy,
                0.8
            );
        } catch (error) {
            console.warn('Failed to zoom out:', error);
        }
    };

    const resizeCells = (factor: number) => {
        setCurrentCellSize({
            width: Math.max(40, Math.min(150, currentCellSize.width * factor)),
            height: Math.max(30, Math.min(80, currentCellSize.height * factor))
        });
    };

    return (
        <div ref={containerRef} className="w-full h-full border border-gray-300 bg-white relative overflow-hidden">
            {/* Controls */}
            <div className="absolute top-2 left-2 z-10 flex gap-2 flex-wrap">
                <div className="flex gap-1 bg-white rounded shadow p-1">
                    <button
                        onClick={zoomIn}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        +
                    </button>
                    <button
                        onClick={zoomOut}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        -
                    </button>
                    <button
                        onClick={resetZoom}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                        Reset
                    </button>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {Math.round(zoom * 100)}%
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
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#a8e6cf' }}></div>
                        <span>Stack</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#ff8b94' }}></div>
                        <span>Heap</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#96ceb4' }}></div>
                        <span>Global</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#feca57' }}></div>
                        <span>Code</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#ff6b6b' }}></div>
                        <span>Highlighted</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3" style={{ backgroundColor: '#ffd93d' }}></div>
                        <span>Referenced</span>
                    </div>
                </div>
            </div>

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                className="cursor-move"
            >
                <g transform={`translate(${transform.x + 25}, ${transform.y + 25}) scale(${zoom})`}>
                    {/* Memory cells */}
                    {memoryData.map((cell, index) => {
                        const row = Math.floor(index / cellsPerRow);
                        const col = index % cellsPerRow;
                        const x = col * currentCellSize.width;
                        const y = row * currentCellSize.height;

                        return (
                            <g key={`memory-cell-${index}`}>
                                {/* Cell background */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={currentCellSize.width}
                                    height={currentCellSize.height}
                                    fill={getCellColor(cell)}
                                    stroke={cell.highlighted ? "#ff6b6b" : "#333"}
                                    strokeWidth={cell.highlighted ? 3 : 1}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleCellClick(cell)}
                                    className="transition-all duration-200 hover:stroke-blue-500"
                                />

                                {/* Address */}
                                {showAddresses && (
                                    <text
                                        x={x + 2}
                                        y={y + 10}
                                        fontSize="8"
                                        fill="#666"
                                        pointerEvents="none"
                                        fontFamily="monospace"
                                    >
                                        {cell.address}
                                    </text>
                                )}

                                {/* Value */}
                                <text
                                    x={x + currentCellSize.width / 2}
                                    y={y + currentCellSize.height / 2 + 2}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#333"
                                    pointerEvents="none"
                                    fontFamily="monospace"
                                    fontWeight={cell.highlighted ? "bold" : "normal"}
                                >
                                    {cell.value !== null ? String(cell.value) : 'null'}
                                </text>

                                {/* Variable name */}
                                {cell.variable && (
                                    <text
                                        x={x + currentCellSize.width / 2}
                                        y={y + currentCellSize.height - 5}
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill="#666"
                                        pointerEvents="none"
                                        fontFamily="monospace"
                                    >
                                        {cell.variable}
                                    </text>
                                )}

                                {/* Type indicator */}
                                {showTypes && (
                                    <rect
                                        x={x + currentCellSize.width - 12}
                                        y={y + 2}
                                        width={10}
                                        height={10}
                                        fill={getTypeColor(cell.type)}
                                        stroke="#333"
                                        strokeWidth="1"
                                    />
                                )}

                                {/* Reference indicator */}
                                {showReferences && cell.referenced && (
                                    <circle
                                        cx={x + 8}
                                        cy={y + 8}
                                        r={4}
                                        fill="#ffd93d"
                                        stroke="#333"
                                        strokeWidth="1"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Memory section labels */}
                    <g>
                        {/* Stack section */}
                        <rect
                            x={0}
                            y={rows * currentCellSize.height + 10}
                            width={width / 4}
                            height={20}
                            fill="#a8e6cf"
                            stroke="#333"
                            strokeWidth="1"
                        />
                        <text
                            x={width / 8}
                            y={rows * currentCellSize.height + 23}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#333"
                            fontWeight="bold"
                        >
                            Stack
                        </text>

                        {/* Heap section */}
                        <rect
                            x={width / 4}
                            y={rows * currentCellSize.height + 10}
                            width={width / 4}
                            height={20}
                            fill="#ff8b94"
                            stroke="#333"
                            strokeWidth="1"
                        />
                        <text
                            x={width * 3 / 8}
                            y={rows * currentCellSize.height + 23}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#333"
                            fontWeight="bold"
                        >
                            Heap
                        </text>

                        {/* Global section */}
                        <rect
                            x={width / 2}
                            y={rows * currentCellSize.height + 10}
                            width={width / 4}
                            height={20}
                            fill="#96ceb4"
                            stroke="#333"
                            strokeWidth="1"
                        />
                        <text
                            x={width * 5 / 8}
                            y={rows * currentCellSize.height + 23}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#333"
                            fontWeight="bold"
                        >
                            Global
                        </text>

                        {/* Code section */}
                        <rect
                            x={width * 3 / 4}
                            y={rows * currentCellSize.height + 10}
                            width={width / 4}
                            height={20}
                            fill="#feca57"
                            stroke="#333"
                            strokeWidth="1"
                        />
                        <text
                            x={width * 7 / 8}
                            y={rows * currentCellSize.height + 23}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#333"
                            fontWeight="bold"
                        >
                            Code
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default MemoryVisualizer; 