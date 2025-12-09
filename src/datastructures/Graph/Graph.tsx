import React, { useState, useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
    type Node,
    type Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle,
    type NodeProps,
    type EdgeProps,
    getBezierPath,
    getSmoothStepPath,
    getStraightPath,
    BackgroundVariant,
    MiniMap,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { IGraphConfig, IGraphEdge, IGraphFlowProps, IGraphNode } from './type'

// Default configuration
const defaultConfig: Required<IGraphConfig> = {
    // Node
    nodeRadius: 30,
    nodeShape: 'circle',
    nodeBorderWidth: 2,
    nodeCornerRadius: 8,

    // Edge
    edgeWidth: 2,
    highlightEdgeWidth: 3,
    edgeType: 'simplebezier',
    arrowSize: 20,
    selfLoopRadius: 40,
    animated: false,

    // Labels
    labelFontSize: 14,
    labelFontFamily: 'system-ui, -apple-system, sans-serif',
    labelFontWeight: 600,
    weightFontSize: 11,
    weightPosition: 'top',

    // Display
    showNodeWeights: true,
    showEdgeWeights: true,
    showEdgeLabels: true,
    showGrid: true,
    showMiniMap: false,
    showControls: true,

    // Colors
    colors: {
        nodeBackgroundColor: '#ffffff',
        nodeTextColor: '#111827',
        nodeStrokeColor: '#6b7280',
        nodeHighlightBackgroundColor: '#fbbf24',
        nodeHighlightTextColor: '#111827',
        nodeHighlightStrokeColor: '#f59e0b',
        nodeHoverBackgroundColor: '#f3f4f6',
        nodeHoverStrokeColor: '#4b5563',

        edgeColor: '#6b7280',
        edgeHighlightColor: '#f59e0b',
        edgeHoverColor: '#9ca3af',
        edgeLabelBackgroundColor: '#ffffff',
        edgeLabelTextColor: '#111827',
        edgeLabelStrokeColor: '#e5e7eb',

        arrowColor: '#6b7280',
        arrowHighlightColor: '#f59e0b',
        selfLoopColor: '#6b7280',
        selfLoopHighlightColor: '#f59e0b',

        backgroundPatternColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        gridColor: '#e5e7eb',
        miniMapNodeColor: '#6b7280',
        miniMapMaskColor: 'rgba(107, 114, 128, 0.2)',

        depthColorMap: {
            0: '#ef4444',
            1: '#10b981',
            2: '#f59e0b',
            3: '#8b5cf6',
            4: '#06b6d4',
        }
    },

    // Layout
    layoutDirection: 'TB',
    nodeSpacing: { x: 100, y: 100 },
    rankSpacing: 150,

    // Interaction
    draggable: true,
    connectable: false,
    deletable: false,
    zoomable: true,
    pannable: true,
    selectable: true
}

// Custom node component
const CustomNode: React.FC<NodeProps> = ({ data }) => {
    const [isHovered, setIsHovered] = useState(false)
    const config = data.config as Required<IGraphConfig>
    const isHighlighted = data.highlighted
    const nodeShape = data.shape || config.nodeShape
    const nodeRadius = data.size?.width ? data.size.width / 2 : config.nodeRadius

    // Determine colors
    const bgColor = isHighlighted
        ? config.colors.nodeHighlightBackgroundColor
        : isHovered
            ? config.colors.nodeHoverBackgroundColor
            : data.bgColor || (
                data.depth !== undefined && config.colors.depthColorMap
                    ? config.colors.depthColorMap[data.depth % Object.keys(config.colors.depthColorMap).length]
                    : config.colors.nodeBackgroundColor
            )

    const strokeColor = isHighlighted
        ? config.colors.nodeHighlightStrokeColor
        : isHovered
            ? config.colors.nodeHoverStrokeColor
            : data.strokeColor || config.colors.nodeStrokeColor

    const textColor = isHighlighted
        ? config.colors.nodeHighlightTextColor
        : data.color || config.colors.nodeTextColor

    // Shape rendering
    const getShapeStyle = () => {
        const baseStyle = {
            backgroundColor: bgColor,
            border: `${config.nodeBorderWidth}px solid ${strokeColor}`,
            color: textColor,
            fontSize: `${config.labelFontSize}px`,
            fontFamily: config.labelFontFamily,
            fontWeight: config.labelFontWeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }

        switch (nodeShape) {
            case 'circle':
                return {
                    ...baseStyle,
                    width: `${nodeRadius * 2}px`,
                    height: `${nodeRadius * 2}px`,
                    borderRadius: '50%'
                }
            case 'rect':
                return {
                    ...baseStyle,
                    width: `${nodeRadius * 2}px`,
                    height: `${nodeRadius * 1.5}px`,
                    borderRadius: `${config.nodeCornerRadius}px`
                }
            case 'diamond':
                return {
                    ...baseStyle,
                    width: `${nodeRadius * 2}px`,
                    height: `${nodeRadius * 2}px`,
                    transform: 'rotate(45deg)'
                }
            case 'hexagon':
                return {
                    ...baseStyle,
                    width: `${nodeRadius * 2}px`,
                    height: `${nodeRadius * 1.75}px`,
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                }
            default:
                return baseStyle
        }
    }

    const getWeightPosition = () => {
        switch (config.weightPosition) {
            case 'top':
                return { top: `-${config.weightFontSize + 10}px`, left: '50%', transform: 'translateX(-50%)' }
            case 'bottom':
                return { bottom: `-${config.weightFontSize + 10}px`, left: '50%', transform: 'translateX(-50%)' }
            case 'left':
                return { left: `-${config.weightFontSize + 20}px`, top: '50%', transform: 'translateY(-50%)' }
            case 'right':
                return { right: `-${config.weightFontSize + 20}px`, top: '50%', transform: 'translateY(-50%)' }
            case 'center':
            default:
                return { top: '70%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: 'relative' }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: strokeColor, width: 8, height: 8 }}
            />

            <div style={getShapeStyle()}>
                <span style={nodeShape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
                    {data.label}
                </span>
            </div>

            {config.showNodeWeights && data.weight !== undefined && (
                <div
                    style={{
                        position: 'absolute',
                        fontSize: `${config.weightFontSize}px`,
                        fontFamily: config.labelFontFamily,
                        color: config.colors.nodeTextColor,
                        fontWeight: 'normal',
                        ...getWeightPosition()
                    }}
                >
                    w:{data.weight}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: strokeColor, width: 8, height: 8 }}
            />
        </div>
    )
}

// Custom edge component
const CustomEdge: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
}) => {
    const [isHovered, setIsHovered] = useState(false)
    const config = data?.config as Required<IGraphConfig>
    const isHighlighted = data?.highlighted

    // Determine path based on edge type
    const getPath = () => {
        const edgeType = data?.edgeType || config.edgeType
        switch (edgeType) {
            case 'straight':
                return getStraightPath({
                    sourceX,
                    sourceY,
                    targetX,
                    targetY
                })
            case 'step':
            case 'smoothstep':
                return getSmoothStepPath({
                    sourceX,
                    sourceY,
                    sourcePosition,
                    targetX,
                    targetY,
                    targetPosition,
                    borderRadius: edgeType === 'smoothstep' ? 10 : 0
                })
            case 'simplebezier':
            default:
                return getBezierPath({
                    sourceX,
                    sourceY,
                    sourcePosition,
                    targetX,
                    targetY,
                    targetPosition
                })
        }
    }

    const [edgePath, labelX, labelY] = getPath()

    const strokeColor = isHighlighted
        ? config.colors.edgeHighlightColor
        : isHovered
            ? config.colors.edgeHoverColor
            : data?.color || config.colors.edgeColor

    const strokeWidth = isHighlighted
        ? config.highlightEdgeWidth
        : config.edgeWidth

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    stroke: strokeColor,
                    strokeWidth,
                    cursor: 'pointer'
                }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />

            {(config.showEdgeWeights || config.showEdgeLabels) && (data?.weight || data?.label) && (
                <foreignObject
                    width={60}
                    height={30}
                    x={labelX - 30}
                    y={labelY - 15}
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: data?.bgColor || config.colors.edgeLabelBackgroundColor,
                            border: `1px solid ${data?.strokeColor || config.colors.edgeLabelStrokeColor}`,
                            borderRadius: 4,
                            fontSize: `${config.weightFontSize}px`,
                            fontFamily: config.labelFontFamily,
                            color: data?.color || config.colors.edgeLabelTextColor
                        }}
                    >
                        {data?.weight !== undefined ? `w:${data.weight}` : data?.label}
                    </div>
                </foreignObject>
            )}
        </>
    )
}

// Main component
const GraphFlowInner: React.FC<IGraphFlowProps> = ({
    nodes: inputNodes,
    edges: inputEdges,
    directed = false,
    width = '100%',
    height = '600px',
    highlightPath = [],
    config = {},
    onNodeClick,
    onEdgeClick,
    onNodesChange: onNodesChangeCallback,
    onEdgesChange: onEdgesChangeCallback,
    className = '',
    style = {}
}) => {
    const mergedConfig = useMemo<Required<IGraphConfig>>(
        () => ({
            ...defaultConfig,
            ...config,
            colors: { ...defaultConfig.colors, ...config.colors }
        }),
        [config]
    )

    const { fitView } = useReactFlow()

    // Layout algorithm to position nodes automatically
    const calculateLayout = useCallback((nodes: IGraphNode[]) => {
        const positioned = nodes.filter(n => n.x !== undefined && n.y !== undefined)
        const unpositioned = nodes.filter(n => n.x === undefined || n.y === undefined)

        if (unpositioned.length === 0) {
            return nodes.map(n => ({ ...n, x: n.x!, y: n.y! }))
        }

        const result = [...positioned]
        const { layoutDirection, nodeSpacing, rankSpacing } = mergedConfig

        // Group nodes by depth for hierarchical layout
        const nodesByDepth = new Map<number, IGraphNode[]>()
        unpositioned.forEach(node => {
            const depth = node.depth ?? 0
            if (!nodesByDepth.has(depth)) {
                nodesByDepth.set(depth, [])
            }
            nodesByDepth.get(depth)!.push(node)
        })

        const depths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b)

        depths.forEach((depth, depthIndex) => {
            const nodesAtDepth = nodesByDepth.get(depth)!
            const numNodes = nodesAtDepth.length

            nodesAtDepth.forEach((node, nodeIndex) => {
                let x: number, y: number

                if (layoutDirection === 'TB' || layoutDirection === 'BT') {
                    // Top to Bottom or Bottom to Top
                    const totalWidth = (numNodes - 1) * nodeSpacing.x
                    const startX = -totalWidth / 2
                    x = startX + nodeIndex * nodeSpacing.x
                    y = depthIndex * rankSpacing

                    if (layoutDirection === 'BT') {
                        y = -y
                    }
                } else {
                    // Left to Right or Right to Left
                    const totalHeight = (numNodes - 1) * nodeSpacing.y
                    const startY = -totalHeight / 2
                    x = depthIndex * rankSpacing
                    y = startY + nodeIndex * nodeSpacing.y

                    if (layoutDirection === 'RL') {
                        x = -x
                    }
                }

                result.push({ ...node, x, y })
            })
        })

        return result
    }, [mergedConfig])

    // Convert nodes
    const initialNodes = useMemo<Node[]>(() => {
        const layoutedNodes = calculateLayout(inputNodes)

        return layoutedNodes.map(node => ({
            id: node.id,
            type: 'custom',
            position: {
                x: node.x!,
                y: node.y!
            },
            data: {
                ...node,
                label: node.label,
                weight: node.weight,
                color: node.color,
                bgColor: node.bgColor,
                strokeColor: node.strokeColor,
                depth: node.depth,
                shape: node.shape,
                config: mergedConfig,
                highlighted: highlightPath.includes(node.id)
            },
            draggable: mergedConfig.draggable,
            selectable: mergedConfig.selectable,
            deletable: mergedConfig.deletable
        }))
    }, [inputNodes, mergedConfig, highlightPath, calculateLayout])

    // Convert edges
    const initialEdges = useMemo<Edge[]>(() => {
        const edges: Edge[] = []

        inputEdges.forEach(edge => {
            // Check if it's a self-loop
            const isSelfLoop = edge.source === edge.target

            const isHighlighted = highlightPath.includes(edge.source) && highlightPath.includes(edge.target)

            edges.push({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: isSelfLoop ? 'default' : 'custom',
                animated: edge.animated ?? mergedConfig.animated,
                style: isSelfLoop ? {
                    stroke: isHighlighted ? mergedConfig.colors.selfLoopHighlightColor : edge.color || mergedConfig.colors.selfLoopColor,
                    strokeWidth: isHighlighted ? mergedConfig.highlightEdgeWidth : mergedConfig.edgeWidth,
                    // Create self-loop effect
                    strokeDasharray: '5 5'
                } : undefined,
                data: {
                    ...edge,
                    config: mergedConfig,
                    highlighted: isHighlighted,
                    edgeType: edge.type || mergedConfig.edgeType
                },
                markerEnd: directed ? {
                    type: MarkerType.ArrowClosed,
                    color: isHighlighted ? mergedConfig.colors.arrowHighlightColor : mergedConfig.colors.arrowColor,
                    width: mergedConfig.arrowSize,
                    height: mergedConfig.arrowSize
                } : undefined
            })
        })

        return edges
    }, [inputEdges, mergedConfig, highlightPath, directed])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    // Update nodes when input changes
    useEffect(() => {
        setNodes(initialNodes)
    }, [initialNodes, setNodes])

    // Update edges when input changes
    useEffect(() => {
        setEdges(initialEdges)
    }, [initialEdges, setEdges])

    // Fit view on mount
    useEffect(() => {
        setTimeout(() => fitView({ padding: 0.1 }), 100)
    }, [fitView])

    // Handle node click
    const onNodeClickHandler = useCallback((_event: React.MouseEvent, node: Node) => {
        if (onNodeClick) {
            onNodeClick(node.data as IGraphNode)
        }
    }, [onNodeClick])

    // Handle edge click
    const onEdgeClickHandler = useCallback((_event: React.MouseEvent, edge: Edge) => {
        if (onEdgeClick) {
            onEdgeClick(edge.data as IGraphEdge)
        }
    }, [onEdgeClick])

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), [])
    const edgeTypes = useMemo(() => ({ custom: CustomEdge }), [])

    return (
        <div
            className={className}
            style={{
                width,
                height,
                border: `1px solid ${mergedConfig.colors.edgeColor}`,
                borderRadius: 8,
                overflow: 'hidden',
                ...style
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => {
                    onNodesChange(changes)
                    if (onNodesChangeCallback) {
                        onNodesChangeCallback(nodes)
                    }
                }}
                onEdgesChange={(changes) => {
                    onEdgesChange(changes)
                    if (onEdgesChangeCallback) {
                        onEdgesChangeCallback(edges)
                    }
                }}
                onNodeClick={onNodeClickHandler}
                onEdgeClick={onEdgeClickHandler}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                attributionPosition="bottom-left"
                zoomOnScroll={mergedConfig.zoomable}
                panOnScroll={!mergedConfig.zoomable}
                panOnDrag={mergedConfig.pannable}
                preventScrolling={mergedConfig.zoomable}
                nodesDraggable={mergedConfig.draggable}
                nodesConnectable={mergedConfig.connectable}
                elementsSelectable={mergedConfig.selectable}
            >
                {mergedConfig.showGrid && (
                    <Background
                        variant={BackgroundVariant.Dots}
                        color={mergedConfig.colors.backgroundPatternColor}
                        style={{ backgroundColor: mergedConfig.colors.backgroundColor }}
                    />
                )}

                {mergedConfig.showControls && (
                    <Controls
                        style={{
                            backgroundColor: mergedConfig.colors.nodeBackgroundColor,
                            borderColor: mergedConfig.colors.nodeStrokeColor
                        }}
                    />
                )}

                {mergedConfig.showMiniMap && (
                    <MiniMap
                        nodeColor={mergedConfig.colors.miniMapNodeColor}
                        maskColor={mergedConfig.colors.miniMapMaskColor}
                        pannable
                        zoomable
                    />
                )}
            </ReactFlow>
        </div>
    )
}

// Wrapper component with ReactFlowProvider
const GraphFlow: React.FC<IGraphFlowProps> = (props) => {
    return (
        <ReactFlowProvider>
            <GraphFlowInner {...props} />
        </ReactFlowProvider>
    )
}

export default GraphFlow