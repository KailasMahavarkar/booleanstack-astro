import React, { useState, useCallback, useEffect } from 'react'
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
    getBezierPath,
    type EdgeProps,
    BackgroundVariant,
    Panel
} from 'reactflow'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FastForward, MoveHorizontal } from 'lucide-react'
import 'reactflow/dist/style.css'
import { type IRecursiveVisualizerProps, type IRecursiveCall } from './type'


// Custom node component for function calls
const FunctionCallNode: React.FC<NodeProps> = ({ data }) => {
    const isActive = data.isActive
    const hasReturned = data.hasReturned
    const isCurrentReturn = data.isCurrentReturn
    const isRootNode = data.isRootNode
    const nodeWidth = data.nodeWidth
    const nodeHeight = data.nodeHeight

    const styleProps = nodeWidth || nodeHeight ? {
        width: nodeWidth ? `${nodeWidth}px` : undefined,
        height: nodeHeight ? `${nodeHeight}px` : undefined,
        minWidth: nodeWidth ? `${nodeWidth}px` : undefined,
        minHeight: nodeHeight ? `${nodeHeight}px` : undefined,
    } : {}

    return (
        <div
            className={`
                px-4 py-3 rounded-lg border-2 min-w-[150px] transition-all duration-300 shadow-lg
                flex flex-col justify-center relative
                ${isActive ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl' : ''}
                ${isCurrentReturn && isRootNode ? 'border-green-600 bg-green-100 scale-110 shadow-2xl animate-pulse ring-4 ring-green-300' : ''}
                ${isCurrentReturn && !isRootNode ? 'border-green-500 bg-green-50 scale-105 shadow-xl animate-pulse' : ''}
                ${hasReturned && !isCurrentReturn ? 'border-green-400 bg-green-50/70' : ''}
                ${!isActive && !hasReturned && !isCurrentReturn ? 'border-gray-300 bg-white' : ''}
            `}
            style={styleProps}
        >
            {/* Top handle for incoming calls */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                className="w-2 h-2"
                style={{ background: '#555' }}
            />

            {/* Left handle for return paths (left children) */}
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="w-1 h-1 opacity-0"
                style={{ top: '30%' }}
            />

            {/* Right handle for return paths (right children) */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="w-1 h-1 opacity-0"
                style={{ top: '30%' }}
            />

            {/* Left target handle for return paths from children */}
            <Handle
                type="target"
                position={Position.Left}
                id="left-return"
                className="w-1 h-1 opacity-0"
                style={{ top: '70%' }}
            />

            {/* Right target handle for return paths from children */}
            <Handle
                type="target"
                position={Position.Right}
                id="right-return"
                className="w-1 h-1 opacity-0"
                style={{ top: '70%' }}
            />

            <div className="text-center">
                <div className="font-mono font-semibold text-sm text-gray-800">
                    {data.label}
                </div>
                {data.args && (
                    <div className="text-xs text-gray-600 mt-1">
                        ({data.args})
                    </div>
                )}
                {hasReturned && data.returnValue !== undefined && (
                    <div className="text-xs text-green-600 mt-2 font-semibold">
                        → {data.returnValue}
                        {isRootNode && (
                            <span className="ml-1 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">
                                FINAL
                            </span>
                        )}
                    </div>
                )}
                {data.step && (
                    <div className="text-[10px] text-gray-400 mt-1">
                        #{data.step}
                    </div>
                )}
            </div>

            {/* Bottom handle for outgoing calls */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="w-2 h-2"
                style={{ background: '#555' }}
            />
        </div>
    )
}

// Custom edge component for animated calls
const AnimatedEdge: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const isActive = data?.isActive || false
    const isReturn = data?.isReturn || false
    const hasExecuted = data?.hasExecuted || false

    return (
        <>
            <path
                id={id}
                style={style}
                className={`
                    react-flow__edge-path transition-all duration-300
                    ${isActive ? 'stroke-blue-500 stroke-2' : ''}
                    ${isReturn ? 'stroke-green-500 stroke-2' : ''}
                    ${!isActive && !isReturn && hasExecuted ? 'stroke-gray-400' : ''}
                    ${!hasExecuted ? 'stroke-transparent' : ''}
                `}
                d={edgePath}
                markerEnd={markerEnd}
                strokeDasharray={isReturn ? '5,5' : undefined}
            />
            {data?.label && hasExecuted && (
                <g>
                    {/* Background rectangle for label - dynamically sized */}
                    <rect
                        x={labelX - (data.label.length * 3.5)}
                        y={labelY - 10}
                        width={data.label.length * 7}
                        height={18}
                        rx={3}
                        className={`
                            ${isActive && isReturn ? 'fill-green-100 stroke-green-500' : ''}
                            ${isActive && !isReturn ? 'fill-blue-100 stroke-blue-500' : ''}
                            ${!isActive && isReturn ? 'fill-green-50 stroke-green-300' : ''}
                            ${!isActive && !isReturn ? 'fill-gray-100 stroke-gray-300' : ''}
                        `}
                        strokeWidth={1}
                    />
                    {/* Label text */}
                    <text
                        x={labelX}
                        y={labelY + 4}
                        textAnchor="middle"
                        className={`
                            text-xs font-mono font-semibold
                            ${isActive && isReturn ? 'fill-green-700' : ''}
                            ${isActive && !isReturn ? 'fill-blue-700' : ''}
                            ${!isActive && isReturn ? 'fill-green-600' : ''}
                            ${!isActive && !isReturn ? 'fill-gray-600' : ''}
                        `}
                        style={{ fontSize: '11px' }}
                    >
                        {data.label}
                    </text>
                </g>
            )}
        </>
    )
}

// Node types
const nodeTypes = {
    functionCall: FunctionCallNode
}

// Edge types
const edgeTypes = {
    animated: AnimatedEdge
}


const RecursiveVisualizerFlow: React.FC<IRecursiveVisualizerProps> = ({
    calls,
    width = "100%",
    height = "600px",
    autoPlay = false,
    playSpeed = 1000,
    title = "Recursive Call Graph",
    containerClassName = "",
    containerStyle = {},
    horizontalSpacing = 250,
    verticalSpacing = 120,
    nodeWidth,
    nodeHeight,
    controlPosition = 'bottom-center',
}) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [controlPos, setControlPos] = useState<'bottom-left' | 'bottom-center' | 'bottom-right'>(controlPosition)

    // Calculate max steps
    const maxStep = Math.max(
        ...calls.map(c => Math.max(c.callStep, c.returnStep || 0)),
        0
    )

    // Generate initial nodes with proper tree layout
    const generateNodes = useCallback((step: number): Node[] => {
        const effectiveNodeWidth = nodeWidth ?? 180

        // Build tree structure
        interface TreeNode {
            call: IRecursiveCall
            children: TreeNode[]
            x: number
            width: number
        }

        const treeMap = new Map<string, TreeNode>()

        // Create tree nodes
        calls.forEach(call => {
            treeMap.set(call.id, {
                call,
                children: [],
                x: 0,
                width: 0
            })
        })

        // Build parent-child relationships
        let rootNode: TreeNode | null = null
        calls.forEach(call => {
            const node = treeMap.get(call.id)!
            if (call.parentId) {
                const parent = treeMap.get(call.parentId)
                if (parent) {
                    parent.children.push(node)
                }
            } else {
                rootNode = node
            }
        })

        if (!rootNode) return []

        // Calculate subtree widths (bottom-up)
        const calculateWidth = (node: TreeNode): number => {
            if (node.children.length === 0) {
                node.width = effectiveNodeWidth
                return effectiveNodeWidth
            }

            const childrenWidth = node.children.reduce((sum, child) => {
                return sum + calculateWidth(child)
            }, 0)

            const spacing = Math.max(horizontalSpacing, effectiveNodeWidth * 0.3) * (node.children.length - 1)
            node.width = Math.max(effectiveNodeWidth, childrenWidth + spacing)
            return node.width
        }

        calculateWidth(rootNode)

        // Position nodes (top-down)
        const positionNodes = (node: TreeNode, x: number) => {
            node.x = x

            if (node.children.length === 0) return

            // Calculate total width needed for children
            const totalChildWidth = node.children.reduce((sum, child) => sum + child.width, 0)
            const spacingWidth = Math.max(horizontalSpacing, effectiveNodeWidth * 0.3) * (node.children.length - 1)
            const totalWidth = totalChildWidth + spacingWidth

            // Start position for first child (centered under parent)
            let currentX = x - totalWidth / 2

            node.children.forEach((child) => {
                // Position child at the center of its allocated space
                positionNodes(child, currentX + child.width / 2)
                currentX += child.width + Math.max(horizontalSpacing, effectiveNodeWidth * 0.3)
            })
        }

        positionNodes(rootNode, 0)

        // Convert to React Flow nodes
        return calls.map((call) => {
            const treeNode = treeMap.get(call.id)!

            const isActive = call.callStep === step
            const hasExecuted = call.callStep <= step
            const hasReturned = call.returnStep !== undefined && call.returnStep <= step
            const isCurrentReturn = call.returnStep === step

            return {
                id: call.id,
                type: 'functionCall',
                position: {
                    x: treeNode.x,
                    y: call.depth * verticalSpacing
                },
                data: {
                    label: call.functionName,
                    args: Array.isArray(call.args) ? call.args.join(', ') : call.args,
                    returnValue: hasReturned ? call.returnValue : undefined,
                    isActive,
                    hasReturned,
                    isCurrentReturn,
                    isRootNode: !call.parentId,
                    step: hasExecuted ? call.callStep : undefined,
                    nodeWidth,
                    nodeHeight,
                },
                hidden: !hasExecuted
            }
        })
    }, [calls, horizontalSpacing, verticalSpacing, nodeWidth, nodeHeight])

    // Generate edges
    const generateEdges = useCallback((step: number): Edge[] => {
        const edges: Edge[] = []

        // Build parent-child map to determine sibling positions
        const childrenMap = new Map<string, IRecursiveCall[]>()
        calls.forEach(call => {
            if (call.parentId) {
                if (!childrenMap.has(call.parentId)) {
                    childrenMap.set(call.parentId, [])
                }
                childrenMap.get(call.parentId)!.push(call)
            }
        })

        calls.forEach(call => {
            if (!call.parentId) return

            const hasExecuted = call.callStep <= step
            const isActive = call.callStep === step
            const hasReturned = call.returnStep !== undefined && call.returnStep <= step
            const isReturning = call.returnStep === step

            // Determine if this is a left or right child
            const siblings = childrenMap.get(call.parentId) || []
            const siblingIndex = siblings.findIndex(s => s.id === call.id)
            const totalSiblings = siblings.length
            const isLeftChild = siblingIndex < totalSiblings / 2

            // Call edge (always top to bottom)
            const callArgs = Array.isArray(call.args) ? call.args.join(', ') : call.args
            const callLabel = hasExecuted ? `[#${call.callStep}] ${callArgs}` : ''

            edges.push({
                id: `call-${call.parentId}-${call.id}`,
                source: call.parentId,
                target: call.id,
                sourceHandle: 'bottom',
                targetHandle: 'top',
                type: 'animated',
                animated: isActive,
                style: {
                    strokeWidth: isActive ? 2 : 1
                },
                data: {
                    label: callLabel,
                    isActive,
                    hasExecuted,
                    isReturn: false
                },
                markerEnd: hasExecuted ? {
                    type: MarkerType.ArrowClosed,
                    color: isActive ? '#3b82f6' : '#9ca3af'
                } : undefined
            })

            // Return edge (if applicable) - use side handles based on child position
            if (hasReturned) {
                const sourceHandle = isLeftChild ? 'left' : 'right'
                const targetHandle = isLeftChild ? 'left-return' : 'right-return'
                const returnLabel = `[#${call.returnStep}] → ${call.returnValue}`

                edges.push({
                    id: `return-${call.id}-${call.parentId}`,
                    source: call.id,
                    target: call.parentId,
                    sourceHandle,
                    targetHandle,
                    type: 'animated',
                    animated: isReturning,
                    style: {
                        strokeWidth: isReturning ? 2 : 1
                    },
                    data: {
                        label: returnLabel,
                        isActive: isReturning,
                        hasExecuted: true,
                        isReturn: true
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isReturning ? '#10b981' : '#9ca3af'
                    }
                })
            }
        })

        return edges
    }, [calls])

    const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes(currentStep))
    const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges(currentStep))

    // Update nodes and edges when step changes
    useEffect(() => {
        setNodes(generateNodes(currentStep))
        setEdges(generateEdges(currentStep))
    }, [currentStep, generateNodes, generateEdges, setNodes, setEdges])

    // Auto-play functionality
    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= maxStep) {
                    setIsPlaying(false)
                    return prev
                }
                return prev + 1
            })
        }, playSpeed / playbackSpeed)

        return () => clearInterval(interval)
    }, [isPlaying, playSpeed, playbackSpeed, maxStep])

    // Control handlers
    const handlePrevStep = () => {
        setIsPlaying(false)
        setCurrentStep(prev => Math.max(0, prev - 1))
    }

    const handleNextStep = () => {
        setIsPlaying(false)
        setCurrentStep(prev => Math.min(maxStep, prev + 1))
    }

    const handleReset = () => {
        setIsPlaying(false)
        setCurrentStep(0)
    }

    const togglePlay = () => {
        setIsPlaying(!isPlaying)
    }

    const cycleControlPosition = () => {
        setControlPos(prev => {
            if (prev === 'bottom-left') return 'bottom-center'
            if (prev === 'bottom-center') return 'bottom-right'
            return 'bottom-left'
        })
    }

    return (
        <div
            className={`relative bg-white border border-gray-300 rounded-lg ${containerClassName}`}
            style={{ width, height, ...containerStyle }}
        >
            {/* Title */}
            {title && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-2 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
            )}

            {/* React Flow Canvas */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                attributionPosition="bottom-left"
            >
                <Background variant={BackgroundVariant.Dots} />
                <Controls />

                {/* Custom Controls Panel */}
                <Panel position={controlPos}>
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 mb-3">
                        {/* Step indicator and progress bar */}
                        <div className="mb-2">
                            <div className="text-center text-xs text-gray-600 mb-1.5">
                                Step {currentStep} / {maxStep}
                            </div>
                            <div className="relative h-1.5 bg-gray-200 rounded-full w-48 mx-auto">
                                <div
                                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentStep / maxStep) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Control buttons with labels */}
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleReset}
                                    className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                    title="Reset to start"
                                >
                                    <RotateCcw size={14} />
                                </button>
                                <span className="text-[9px] text-gray-500 mt-0.5">Reset</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 0}
                                    className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    title="Previous step"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="text-[9px] text-gray-500 mt-0.5">Prev</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={togglePlay}
                                    className="px-2 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                </button>
                                <span className="text-[9px] text-gray-500 mt-0.5">{isPlaying ? 'Pause' : 'Play'}</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleNextStep}
                                    disabled={currentStep >= maxStep}
                                    className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    title="Next step"
                                >
                                    <ChevronRight size={14} />
                                </button>
                                <span className="text-[9px] text-gray-500 mt-0.5">Next</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => setPlaybackSpeed(s => s === 1 ? 2 : s === 2 ? 0.5 : 1)}
                                    className="p-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-0.5"
                                    title="Toggle speed"
                                >
                                    <FastForward size={14} />
                                    <span className="text-[9px]">{playbackSpeed}x</span>
                                </button>
                                <span className="text-[9px] text-gray-500 mt-0.5">Speed</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={cycleControlPosition}
                                    className="p-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                                    title="Change panel position"
                                >
                                    <MoveHorizontal size={14} />
                                </button>
                                <span className="text-[9px] text-gray-500 mt-0.5">Move</span>
                            </div>
                        </div>

                        {/* Slider */}
                        <input
                            type="range"
                            min="0"
                            max={maxStep}
                            value={currentStep}
                            onChange={(e) => {
                                setIsPlaying(false)
                                setCurrentStep(parseInt(e.target.value))
                            }}
                            className="w-full h-1"
                        />
                    </div>
                </Panel>

                {/* Legend */}
                <Panel position="top-right">
                    <div className="bg-white rounded-lg shadow-md p-3 text-xs mt-16 mr-4">
                        <div className="font-semibold mb-2">Legend</div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded" />
                                <span>Active Call</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-50 border-2 border-green-400 rounded" />
                                <span>Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border-2 border-green-600 rounded ring-2 ring-green-300" />
                                <span>Final Result</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0 border-t-2 border-blue-500" />
                                <span>Call</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0 border-t-2 border-green-500 border-dashed" />
                                <span>Return</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}

export default RecursiveVisualizerFlow