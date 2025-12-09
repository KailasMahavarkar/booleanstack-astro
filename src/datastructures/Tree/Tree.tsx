import { Minus, Plus, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import React, { useState, useRef } from "react"
import { type TreeProps, type ZoomOrigin, type TreeNodeData, type TreeNodeConfig } from "./type"


function calculateSubtreeWidth(node: TreeNodeData, spacing: number, size: number): number {
    if (!node.children || node.children.length === 0) return size
    const widths = node.children.map((child) => calculateSubtreeWidth(child, spacing, size))
    return widths.reduce((sum, w) => sum + w, 0) + spacing * (widths.length - 1)
}

function getNodeClasses(isLeaf: boolean, config: TreeNodeData["config"], currentDepth: number) {
    if (!config) return ""
    const common = "rounded-full flex justify-center items-center shadow-md cursor-pointer select-none"
    const bg = isLeaf ? config.colors.leafBackgroundColor : config.colors.backgroundColor
    const text = isLeaf ? config.colors.leafTextColor : config.colors.textColor

    if (!config.showLevelColorWithOverride) return `${bg} ${text} ${common}`

    const fallback: Record<number, string> = {
        0: "bg-rose-600",
        1: "bg-emerald-600",
        2: "bg-amber-600",
        3: "bg-fuchsia-600",
        4: "bg-cyan-600",
    }
    const map = config.colors.depthColorMap || fallback
    const color = map[currentDepth % Object.keys(map).length]
    return `${color} ${text} ${common}`
}

const TreeNode: React.FC<TreeNodeData> = ({
    value,
    children,
    currentDepth = 0,
    xPosition = 0,
    yPosition = 0,
    isLeaf = false,
    isPreviouslyExpanded = false,
    highlightLeftChildPath = false,
    highlightRightChildPath = false,
    visited = false,
    config = {
        verticalSpacing: 120,
        horizontalSpacing: 120,
        delta: 0,
        expandable: true,
        isFullyExpanded: true,
        size: 60,
        expandableIconSize: 10,
        showExpandIcon: true,
        showLevelColorWithOverride: true,
        colors: {
            backgroundColor: "bg-zinc-800",
            textColor: "text-white",
            expandableIconColor: "text-zinc-900",
            expandableIconBackgroundColor: "bg-white",
            parentPathColor: "#7c3aed",
            leftChildPathColor: "#16a34a",
            rightChildPathColor: "#f59e0b",
            leafBackgroundColor: "bg-emerald-600",
            leafTextColor: "text-white",
            depthColorMap: {
                0: "bg-zinc-800",
                1: "bg-emerald-600",
                2: "bg-amber-600",
                3: "bg-fuchsia-600",
                4: "bg-cyan-600",
            },
        },
    },
}) => {
    const [isExpanded, setIsExpanded] = useState(isPreviouslyExpanded || (config.isFullyExpanded ?? true))
    const H_SPACING = config.horizontalSpacing!
    const V_SPACING = config.verticalSpacing!
    const NODE_SIZE = config.size!

    const childWidths = children.map((child) => calculateSubtreeWidth(child, H_SPACING, NODE_SIZE))
    const totalWidth = childWidths.reduce((sum, w) => sum + w, 0) + H_SPACING * Math.max(0, childWidths.length - 1)
    let currX = xPosition - totalWidth / 2

    const positionedChildren: TreeNodeData[] = children.map((child, idx) => {
        const w = childWidths[idx]
        const childX = currX + w / 2
        currX += w + H_SPACING
        const singleLeaf = children.length === 1 && children[0].children.length === 0
        return {
            ...child,
            config,
            xPosition: singleLeaf ? childX - H_SPACING + w : childX,
            yPosition: yPosition + V_SPACING,
            currentDepth: currentDepth + 1,
            isLeaf: child.children.length === 0,
            isPreviouslyExpanded: child.isPreviouslyExpanded,
            highLightParentPath: child.highLightParentPath,
        }
    })

    const hasChildren = positionedChildren.length > 0
    const expanded = config.expandable ? isExpanded : !!config.isFullyExpanded
    const showExpandBtn = !!(config.showExpandIcon && config.expandable && hasChildren)

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: `${yPosition}px`,
                    left: `${xPosition}px`,
                    transform: "translate(-50%, -50%)",
                    width: `${config.size}px`,
                    height: `${config.size}px`,
                    border: visited ? "1px solid #fde047" : "1px solid rgba(0,0,0,0.1)",
                    zIndex: 1,
                    backgroundColor: !config.showLevelColorWithOverride ? (isLeaf ? "#059669" : "#111827") : undefined,
                    color: !config.showLevelColorWithOverride ? "#ffffff" : undefined,
                }}
                className={getNodeClasses(isLeaf, config, currentDepth)}
                onClick={() => {
                    if (config.expandable && hasChildren) setIsExpanded((p) => !p)
                }}
                role="button"
                aria-expanded={expanded}
                aria-label={`Tree node value ${value}`}
            >
                {value}
                {showExpandBtn && !isLeaf && (
                    <>
                        {expanded ? (
                            <Minus
                                width={config.expandableIconSize ?? 12}
                                height={config.expandableIconSize ?? 12}
                                className="border border-zinc-800 bg-white text-zinc-900 rounded-full opacity-70"
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: (config.size ?? 60) / 2 - (config.expandableIconSize ?? 12) / 2,
                                    transform: "translate(0, 50%)",
                                }}
                            />
                        ) : (
                            <Plus
                                width={config.expandableIconSize ?? 12}
                                height={config.expandableIconSize ?? 12}
                                className="border border-zinc-800 bg-white text-zinc-900 rounded-full opacity-70"
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: (config.size ?? 60) / 2 - (config.expandableIconSize ?? 12) / 2,
                                    transform: "translate(0, 50%)",
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            {expanded &&
                hasChildren &&
                positionedChildren.map((child, index) => {
                    if (child.xPosition == null) return null
                    let strokeColor = config.colors.strokeColor || "#111827"
                    if (child.highLightParentPath) {
                        strokeColor = config.colors.parentPathColor
                    } else {
                        if (highlightLeftChildPath && index === 0) strokeColor = config.colors.leftChildPathColor
                        if (highlightRightChildPath && index === positionedChildren.length - 1)
                            strokeColor = config.colors.rightChildPathColor
                    }

                    return (
                        <div key={uuidv4()}>
                            <div style={{ height: '1px', width: '1px' }} />
                            <svg
                                style={{
                                    position: "absolute",
                                    overflow: "visible",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    zIndex: 0,
                                }}
                                aria-hidden
                            >
                                <line
                                    x1={xPosition}
                                    y1={yPosition}
                                    x2={child.xPosition}
                                    y2={child.yPosition}
                                    stroke={strokeColor}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <TreeNode key={`${child.value}-${index}`} {...child} />
                        </div>
                    )
                })}
        </>
    )
}

const Tree: React.FC<TreeProps> = ({
    // Container props
    width = "100%",
    height = "600px",
    allowCanvas = false,
    containerClassName = "",
    containerStyle = {},

    // Zoom props
    initialZoom = 1,
    minZoom = 0.3,
    maxZoom = 3,
    zoomStep = 0.2,

    // Tree props
    value,
    children,
    currentDepth = 0,
    xPosition,
    yPosition,
    isLeaf = false,
    isPreviouslyExpanded = false,
    highlightLeftChildPath = false,
    highlightRightChildPath = false,
    highLightParentPath = false,
    visited = false,
    config,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPanning, setPanning] = useState(false)
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(initialZoom)
    const [zoomOrigin, setZoomOrigin] = useState<ZoomOrigin>('center')
    const panStart = useRef({ x: 0, y: 0 })


    // Calculate container dimensions for positioning
    const containerWidth = typeof width === 'number' ? width : 800

    // If no position is provided, center the tree at top
    const defaultX = typeof containerWidth === 'number' ? containerWidth / 2 : 400
    const defaultY = 100
    const treeX = xPosition ?? defaultX
    const treeY = yPosition ?? defaultY

    // Pan handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!allowCanvas) return
        setPanning(true)
        panStart.current = {
            x: e.clientX - panOffset.x,
            y: e.clientY - panOffset.y
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!allowCanvas || !isPanning) return
        setPanOffset({
            x: e.clientX - panStart.current.x,
            y: e.clientY - panStart.current.y
        })
    }

    const handleMouseUp = () => {
        setPanning(false)
    }

    const handleMouseLeave = () => {
        setPanning(false)
    }

    // Zoom controls
    const handleZoomIn = () => {
        const newZoom = Math.min(maxZoom, zoom + zoomStep)
        setZoom(newZoom)
    }

    const handleZoomOut = () => {
        const newZoom = Math.max(minZoom, zoom - zoomStep)
        setZoom(newZoom)
    }

    const handleReset = () => {
        setPanOffset({ x: 0, y: 0 })
        setZoom(initialZoom)
    }

    // Get transform origin based on selected option
    const getTransformOrigin = () => {
        switch (zoomOrigin) {
            case 'topleft': return 'top left'
            case 'topright': return 'top right'
            case 'bottomleft': return 'bottom left'
            case 'bottomright': return 'bottom right'
            case 'center':
            default: return 'center'
        }
    }

    // Merge default config with provided config
    const defaultConfig: TreeNodeConfig = {
        verticalSpacing: 120,
        horizontalSpacing: 120,
        delta: 0,
        expandable: true,
        isFullyExpanded: true,
        size: 60,
        expandableIconSize: 10,
        showExpandIcon: true,
        showLevelColorWithOverride: true,
        colors: {
            backgroundColor: "bg-zinc-800",
            textColor: "text-white",
            expandableIconColor: "text-zinc-900",
            expandableIconBackgroundColor: "bg-white",
            parentPathColor: "#7c3aed",
            leftChildPathColor: "#16a34a",
            rightChildPathColor: "#f59e0b",
            leafBackgroundColor: "bg-emerald-600",
            leafTextColor: "text-white",
            depthColorMap: {
                0: "bg-zinc-800",
                1: "bg-emerald-600",
                2: "bg-amber-600",
                3: "bg-fuchsia-600",
                4: "bg-cyan-600",
            },
        },
    }

    const mergedConfig = config ? { ...defaultConfig, ...config } : defaultConfig

    const containerClasses = `
        relative overflow-hidden bg-slate-50
        ${allowCanvas ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''}
        ${containerClassName}
    `

    const showControls = allowCanvas && (panOffset.x !== 0 || panOffset.y !== 0 || zoom !== initialZoom)

    return (
        <div
            ref={containerRef}
            className={containerClasses}
            style={{
                width,
                height,
                ...containerStyle
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    transform: allowCanvas
                        ? `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`
                        : `scale(${zoom})`,
                    transformOrigin: getTransformOrigin(),
                    transition: isPanning ? 'none' : 'transform 0.2s ease-out'
                }}
            >
                <TreeNode
                    value={value}
                    currentDepth={currentDepth}
                    xPosition={treeX}
                    yPosition={treeY}
                    isLeaf={isLeaf}
                    isPreviouslyExpanded={isPreviouslyExpanded}
                    highlightLeftChildPath={highlightLeftChildPath}
                    highlightRightChildPath={highlightRightChildPath}
                    highLightParentPath={highLightParentPath}
                    visited={visited}
                    config={mergedConfig}
                >
                    {children}
                </TreeNode>
            </div>

            {/* Controls Panel */}
            {allowCanvas && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    {/* Zoom Controls */}
                    <div className="flex gap-1 bg-white border border-gray-300 rounded shadow-sm p-1">
                        <button
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                            disabled={zoom <= minZoom}
                        >
                            <ZoomOut size={18} className={zoom <= minZoom ? 'text-gray-300' : 'text-gray-700'} />
                        </button>
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-700 min-w-[50px] text-center">
                            {Math.round(zoom * 100)}%
                        </div>
                        <button
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            onClick={handleZoomIn}
                            title="Zoom In"
                            disabled={zoom >= maxZoom}
                        >
                            <ZoomIn size={18} className={zoom >= maxZoom ? 'text-gray-300' : 'text-gray-700'} />
                        </button>
                    </div>

                    {/* Zoom Origin Selector */}
                    <select
                        value={zoomOrigin}
                        onChange={(e) => setZoomOrigin(e.target.value as ZoomOrigin)}
                        className="bg-white border border-gray-300 rounded shadow-sm px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        title="Zoom Origin"
                    >
                        <option value="center">Center</option>
                        <option value="topleft">Top Left</option>
                        <option value="topright">Top Right</option>
                        <option value="bottomleft">Bottom Left</option>
                        <option value="bottomright">Bottom Right</option>
                    </select>

                    {/* Reset Button */}
                    {showControls && (
                        <button
                            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-xs hover:bg-gray-50"
                            onClick={handleReset}
                            title="Reset View"
                        >
                            <Maximize2 size={14} />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default Tree