import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, Plus, MousePointer, Link, Trash2 } from 'lucide-react';
import { useGraph, type GraphNode, type GraphEdge, type GraphConfig } from '../../../datastructures/Graph/hooks/useGraph';

const Graph: React.FC<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    directed?: boolean;
    width?: number;
    height?: number;
    highlightPath?: string[];
    config?: GraphConfig;
    onNodeClick?: (node: GraphNode) => void;
    onEdgeClick?: (edge: GraphEdge) => void;
}> = ({
    nodes,
    edges,
    directed = false,
    width = 600,
    height = 400,
    highlightPath = [],
    config,
    onNodeClick,
    onEdgeClick,
}) => {
        const { config: mergedConfig } = useGraph({ nodes, edges, directed, highlightPath, config });
        const { colors } = mergedConfig;

        // Separate edges into regular and self-loops
        const regularEdges = edges.filter(e => e.source !== e.target);
        const selfLoops = edges.filter(e => e.source === e.target);

        // Calculate edge path
        const getEdgePath = (edge: GraphEdge): string => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return '';

            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = mergedConfig.nodeRadius!;

            const startX = sourceNode.x + (dx / distance) * radius;
            const startY = sourceNode.y + (dy / distance) * radius;
            const endX = targetNode.x - (dx / distance) * radius;
            const endY = targetNode.y - (dy / distance) * radius;

            return `M ${startX} ${startY} L ${endX} ${endY}`;
        };

        // Get edge center for labels
        const getEdgeCenter = (edge: GraphEdge): { x: number; y: number } => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return { x: 0, y: 0 };

            return {
                x: (sourceNode.x + targetNode.x) / 2,
                y: (sourceNode.y + targetNode.y) / 2
            };
        };

        // Check if edge is highlighted
        const isEdgeHighlighted = (edge: GraphEdge): boolean => {
            const sourceIndex = highlightPath.indexOf(edge.source);
            const targetIndex = highlightPath.indexOf(edge.target);
            return sourceIndex !== -1 && targetIndex !== -1 && Math.abs(sourceIndex - targetIndex) === 1;
        };

        return (
            <div className="w-full h-full">
                <svg
                    width={width}
                    height={height}
                    style={{
                        border: `1px solid ${colors.svgBorderColor}`,
                        backgroundColor: colors.svgBackgroundColor
                    }}
                >
                    {/* Regular edges */}
                    {regularEdges.map(edge => {
                        const highlighted = isEdgeHighlighted(edge);
                        const center = getEdgeCenter(edge);

                        return (
                            <g key={edge.id}>
                                <path
                                    d={getEdgePath(edge)}
                                    stroke={edge.color || (highlighted ? colors.edgeHighlightColor : colors.edgeColor)}
                                    strokeWidth={highlighted ? mergedConfig.highlightEdgeWidth! : mergedConfig.edgeWidth!}
                                    fill="none"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onEdgeClick?.(edge)}
                                />

                                {/* Edge label */}
                                {edge.label && (
                                    <g>
                                        <circle
                                            cx={center.x}
                                            cy={center.y}
                                            r={12}
                                            fill="white"
                                            stroke="#333"
                                            strokeWidth={1}
                                        />
                                        <text
                                            x={center.x}
                                            y={center.y + 4}
                                            textAnchor="middle"
                                            fontSize={`${mergedConfig.weightFontSize}px`}
                                            fill="#333"
                                            fontWeight="bold"
                                            pointerEvents="none"
                                        >
                                            {edge.label}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map(node => {
                        const highlighted = highlightPath.includes(node.id);

                        return (
                            <g key={node.id}>
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={mergedConfig.nodeRadius!}
                                    fill={node.bgColor || (highlighted ? colors.nodeHighlightBackgroundColor : colors.nodeBackgroundColor)}
                                    stroke={node.strokeColor || (highlighted ? colors.nodeHighlightStrokeColor : colors.nodeStrokeColor)}
                                    strokeWidth={highlighted ? 3 : 2}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onNodeClick?.(node)}
                                />

                                {/* Node label */}
                                <text
                                    x={node.x}
                                    y={node.y + 4}
                                    textAnchor="middle"
                                    fontSize={`${mergedConfig.labelFontSize}px`}
                                    fill={node.color || (highlighted ? colors.nodeHighlightTextColor : colors.nodeTextColor)}
                                    fontWeight="bold"
                                    pointerEvents="none"
                                >
                                    {node.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

// Memory Block Component
interface MemoryBlockProps {
    data: (string | boolean | number)[];
    width: number;
    fixDataSize: number;
    label: string[];
    className?: string;
    title?: string;
}

function MemoryBlock({ data, width, fixDataSize, label, title, ...props }: MemoryBlockProps) {
    const availableWidth = width;
    const blockSize = availableWidth / fixDataSize;

    function transformData(data: (string | boolean | number)[]): (string | boolean | number)[] {
        if (data.length === 0) {
            throw new Error('cannot');
        }

        const dataType = typeof data[0];
        const fillMode = dataType === 'string' ? '' : dataType === 'boolean' ? 'F' : '0';
        const compute = [...data, ...Array(fixDataSize - data.length).fill(fillMode)];
        for (let i = 0; i < compute.length; i++) {
            if (dataType === 'string') {
                compute[i] = compute[i] || '';
            } else if (dataType === 'boolean') {
                compute[i] = compute[i] === true ? 'T' : 'F';
            } else if (dataType === 'number') {
                compute[i] = compute[i] || 0;
            }
        }
        return compute;
    }

    const transformedData = transformData(data);
    const classes = `flex flex-col ${props.className}`;

    return (
        <div className={classes} {...props}>
            {title && (
                <p className="text-sm font-semibold mb-2">
                    {title}
                </p>
            )}
            {label && (
                <div className="flex flex-row bg-gray-600 text-white rounded-t-md p-1" style={{ width: `${availableWidth}px` }}>
                    {label.map((item, index) => (
                        <div key={index} className={`flex items-center justify-center border-r border-gray-300 last:border-r-0 text-xs`} style={{ width: `${blockSize}px`, height: '15px' }}>
                            {item}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-row bg-gray-200 rounded-b-md p-1" style={{ width: `${availableWidth}px` }}>
                {transformedData.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-center border-r border-gray-300 last:border-r-0 text-xs`}
                        style={{ width: `${blockSize}px`, height: '30px' }}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main Component Types
interface Node {
    id: string;
    x: number;
    y: number;
}

interface Edge {
    source: string;
    target: string;
    id: string;
    traversed?: boolean;
    traversalOrder?: number;
}

interface EulerianStep {
    action: string;
    node?: string;
    edge?: Edge;
    path: string[];
    currentEdge?: Edge;
    visitedEdges: Set<string>;
    degrees: Record<string, number>;
    oddDegreeNodes: string[];
    message: string;
    pathType?: 'circuit' | 'path' | 'none';
    isComplete?: boolean;
    backtrackFrom?: string;
}

interface AlgorithmState {
    isRunning: boolean;
    currentStep: number;
    steps: EulerianStep[];
    currentPath: string[];
    visitedEdges: Set<string>;
    currentNode: string | null;
    degrees: Record<string, number>;
    oddDegreeNodes: string[];
    pathType: 'circuit' | 'path' | 'none';
    isComplete: boolean;
    traversalOrder: Record<string, number>;
}

interface Graph {
    nodes: Node[];
    edges: Edge[];
}

const EulerianPathCircuit = () => {
    const [graph, setGraph] = useState<Graph>({
        nodes: [
            { id: 'A', x: 150, y: 150 },
            { id: 'B', x: 350, y: 100 },
            { id: 'C', x: 450, y: 250 },
            { id: 'D', x: 250, y: 300 },
        ],
        edges: [
            { source: 'A', target: 'B', id: 'A-B' },
            { source: 'B', target: 'C', id: 'B-C' },
            { source: 'C', target: 'D', id: 'C-D' },
            { source: 'D', target: 'A', id: 'D-A' },
            { source: 'A', target: 'C', id: 'A-C' }
        ]
    });

    const [editMode, setEditMode] = useState<'select' | 'add-node' | 'add-edge' | 'delete'>('select');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [edgeStart, setEdgeStart] = useState<string | null>(null);

    const [algorithm, setAlgorithm] = useState<AlgorithmState>({
        isRunning: false,
        currentStep: 0,
        steps: [],
        currentPath: [],
        visitedEdges: new Set<string>(),
        currentNode: null,
        degrees: {},
        oddDegreeNodes: [],
        pathType: 'none',
        isComplete: false,
        traversalOrder: {}
    });

    // Convert internal graph to GraphNode and GraphEdge format
    const graphNodes: GraphNode[] = useMemo(() => {
        return graph.nodes.map(node => ({
            id: node.id,
            label: node.id,
            x: node.x,
            y: node.y,
            bgColor: (() => {
                if (algorithm.isRunning) {
                    if (algorithm.oddDegreeNodes.includes(node.id)) return '#f59e0b'; // Orange for odd degree
                    if (node.id === algorithm.currentNode) return '#3b82f6'; // Blue for current
                    if (algorithm.currentPath.includes(node.id)) return '#10b981'; // Green for in path
                    return '#e5e7eb'; // Gray for others
                }
                if (node.id === selectedNode) return '#fbbf24';
                if (node.id === edgeStart) return '#f59e0b';
                return '#e5e7eb';
            })(),
            strokeColor: (() => {
                if (algorithm.isRunning && algorithm.oddDegreeNodes.includes(node.id)) {
                    return '#d97706';
                }
                if (node.id === selectedNode || node.id === edgeStart) return '#f59e0b';
                return '#374151';
            })(),
            color: (() => {
                if (algorithm.isRunning && (node.id === algorithm.currentNode || algorithm.oddDegreeNodes.includes(node.id))) {
                    return 'white';
                }
                return 'black';
            })(),
            weight: algorithm.isRunning && algorithm.degrees[node.id] !== undefined ? algorithm.degrees[node.id] : undefined
        }));
    }, [graph.nodes, algorithm, selectedNode, edgeStart]);

    const graphEdges: GraphEdge[] = useMemo(() => {
        return graph.edges.map(edge => {
            const edgeKey1 = `${edge.source}-${edge.target}`;
            const edgeKey2 = `${edge.target}-${edge.source}`;
            const edgeKey = edgeKey1 < edgeKey2 ? edgeKey1 : edgeKey2;

            const isTraversed = algorithm.visitedEdges.has(edgeKey) || algorithm.visitedEdges.has(edge.id);
            const traversalOrder = algorithm.traversalOrder[edge.id];

            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                color: isTraversed ? '#10b981' : (editMode === 'delete' ? '#ef4444' : '#6b7280'),
                label: traversalOrder ? traversalOrder.toString() : undefined
            };
        });
    }, [graph.edges, algorithm, editMode]);

    // Generate unique node ID
    const generateNodeId = (): string => {
        const usedIds = new Set(graph.nodes.map(n => n.id));
        for (let i = 0; i < 26; i++) {
            const id = String.fromCharCode(65 + i);
            if (!usedIds.has(id)) return id;
        }
        return `N${Date.now()}`;
    };

    // Generate edge ID
    const generateEdgeId = (source: string, target: string): string => {
        return `${source}-${target}`;
    };

    // Handle canvas clicks for adding nodes
    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (algorithm.isRunning || editMode !== 'add-node') return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if click is within SVG bounds
        if (x >= 0 && x <= 600 && y >= 0 && y <= 400) {
            const newNode: Node = {
                id: generateNodeId(),
                x: x,
                y: y
            };
            setGraph(prev => ({
                ...prev,
                nodes: [...prev.nodes, newNode]
            }));
            reset();
        }
    };

    // Handle node clicks
    const handleNodeClick = (node: GraphNode) => {
        if (algorithm.isRunning) return;

        if (editMode === 'select') {
            setSelectedNode(selectedNode === node.id ? null : node.id);
        } else if (editMode === 'delete') {
            deleteNode(node.id);
        } else if (editMode === 'add-edge') {
            if (edgeStart === null) {
                setEdgeStart(node.id);
                setSelectedNode(node.id);
            } else if (edgeStart !== node.id) {
                addEdge(edgeStart, node.id);
                setEdgeStart(null);
                setSelectedNode(null);
            }
        }
    };

    // Handle edge clicks
    const handleEdgeClick = (edge: GraphEdge) => {
        if (algorithm.isRunning) return;

        if (editMode === 'delete') {
            deleteEdge(edge.id);
        }
    };

    // Add edge
    const addEdge = (source: string, target: string) => {
        const edgeId = generateEdgeId(source, target);
        const reverseEdgeId = generateEdgeId(target, source);

        // Check if edge already exists
        const edgeExists = graph.edges.some(e =>
            e.id === edgeId || e.id === reverseEdgeId
        );

        if (!edgeExists) {
            const newEdge: Edge = {
                source: source,
                target: target,
                id: edgeId
            };
            setGraph(prev => ({
                ...prev,
                edges: [...prev.edges, newEdge]
            }));
            reset();
        }
    };

    // Delete node
    const deleteNode = (nodeId: string) => {
        setGraph(prev => ({
            nodes: prev.nodes.filter(n => n.id !== nodeId),
            edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
        }));
        setSelectedNode(null);
        reset();
    };

    // Delete edge
    const deleteEdge = (edgeId: string) => {
        setGraph(prev => ({
            ...prev,
            edges: prev.edges.filter(e => e.id !== edgeId)
        }));
        reset();
    };

    // Check if graph is connected (simplified check)
    const isConnected = (): boolean => {
        if (graph.nodes.length === 0) return true;

        const visited = new Set<string>();
        const adj: Record<string, string[]> = {};

        // Build adjacency list
        graph.nodes.forEach(node => adj[node.id] = []);
        graph.edges.forEach(edge => {
            adj[edge.source].push(edge.target);
            adj[edge.target].push(edge.source);
        });

        // DFS from first node
        const dfs = (node: string) => {
            visited.add(node);
            for (const neighbor of adj[node]) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                }
            }
        };

        dfs(graph.nodes[0].id);
        return visited.size === graph.nodes.length;
    };

    // Find Eulerian Path/Circuit using Hierholzer's algorithm
    const findEulerianPath = (): { steps: EulerianStep[], pathType: 'circuit' | 'path' | 'none' } => {
        const steps: EulerianStep[] = [];

        // Calculate degrees
        const degrees: Record<string, number> = {};
        graph.nodes.forEach(node => degrees[node.id] = 0);
        graph.edges.forEach(edge => {
            degrees[edge.source]++;
            degrees[edge.target]++;
        });

        const oddDegreeNodes = graph.nodes.filter(node => degrees[node.id] % 2 === 1).map(n => n.id);

        steps.push({
            action: 'check_degrees',
            path: [],
            visitedEdges: new Set(),
            degrees: { ...degrees },
            oddDegreeNodes: [...oddDegreeNodes],
            message: `Checking node degrees. Odd degree nodes: ${oddDegreeNodes.length}`
        });

        // Determine if Eulerian path/circuit exists
        let pathType: 'circuit' | 'path' | 'none' = 'none';
        let startNode = graph.nodes[0]?.id;

        if (!isConnected()) {
            steps.push({
                action: 'not_connected',
                path: [],
                visitedEdges: new Set(),
                degrees,
                oddDegreeNodes,
                pathType: 'none',
                message: 'Graph is not connected. No Eulerian path/circuit possible.'
            });
            return { steps, pathType: 'none' };
        }

        if (oddDegreeNodes.length === 0) {
            pathType = 'circuit';
            steps.push({
                action: 'eulerian_circuit',
                path: [],
                visitedEdges: new Set(),
                degrees,
                oddDegreeNodes,
                pathType: 'circuit',
                message: 'All nodes have even degree. Eulerian circuit exists! Can start from any node.'
            });
        } else if (oddDegreeNodes.length === 2) {
            pathType = 'path';
            startNode = oddDegreeNodes[0];
            steps.push({
                action: 'eulerian_path',
                path: [],
                visitedEdges: new Set(),
                degrees,
                oddDegreeNodes,
                pathType: 'path',
                message: `Exactly 2 nodes have odd degree. Eulerian path exists! Must start from ${startNode}.`
            });
        } else {
            steps.push({
                action: 'no_eulerian',
                path: [],
                visitedEdges: new Set(),
                degrees,
                oddDegreeNodes,
                pathType: 'none',
                message: `${oddDegreeNodes.length} nodes have odd degree. No Eulerian path/circuit possible.`
            });
            return { steps, pathType: 'none' };
        }

        // Build adjacency list for algorithm
        const adj: Record<string, string[]> = {};
        graph.nodes.forEach(node => adj[node.id] = []);
        graph.edges.forEach(edge => {
            adj[edge.source].push(edge.target);
            adj[edge.target].push(edge.source);
        });

        // Hierholzer's algorithm
        const path: string[] = [startNode];
        const visitedEdges = new Set<string>();
        const edgeUsed = new Set<string>();
        let traversalCount = 0;

        steps.push({
            action: 'start_algorithm',
            node: startNode,
            path: [startNode],
            visitedEdges: new Set(),
            degrees,
            oddDegreeNodes,
            pathType,
            message: `Starting Hierholzer's algorithm from node ${startNode}`
        });

        const findPath = (currentNode: string, currentPath: string[]) => {
            for (const neighbor of adj[currentNode]) {
                const edgeId1 = `${currentNode}-${neighbor}`;
                const edgeId2 = `${neighbor}-${currentNode}`;
                const edgeKey = edgeId1 < edgeId2 ? edgeId1 : edgeId2;

                if (!edgeUsed.has(edgeKey)) {
                    edgeUsed.add(edgeKey);
                    visitedEdges.add(edgeKey);
                    traversalCount++;

                    const edge = graph.edges.find(e =>
                        (e.source === currentNode && e.target === neighbor) ||
                        (e.source === neighbor && e.target === currentNode)
                    );

                    steps.push({
                        action: 'traverse_edge',
                        node: neighbor,
                        edge: edge,
                        path: [...currentPath, neighbor],
                        currentEdge: edge,
                        visitedEdges: new Set(visitedEdges),
                        degrees,
                        oddDegreeNodes,
                        pathType,
                        message: `Traversing edge ${currentNode} → ${neighbor}. Edge ${traversalCount}/${graph.edges.length}`
                    });

                    findPath(neighbor, [...currentPath, neighbor]);
                    return;
                }
            }

            // No more edges from current node
            if (currentPath.length > 1) {
                steps.push({
                    action: 'backtrack',
                    node: currentNode,
                    path: [...currentPath],
                    visitedEdges: new Set(visitedEdges),
                    degrees,
                    oddDegreeNodes,
                    pathType,
                    backtrackFrom: currentNode,
                    message: `No more unvisited edges from ${currentNode}. ${visitedEdges.size === graph.edges.length ? 'Path complete!' : 'Backtracking...'}`
                });
            }
        };

        findPath(startNode, [startNode]);

        // Check if all edges were visited
        const isComplete = visitedEdges.size === graph.edges.length;

        steps.push({
            action: 'complete',
            path: [...path],
            visitedEdges: new Set(visitedEdges),
            degrees,
            oddDegreeNodes,
            pathType,
            isComplete,
            message: isComplete
                ? `Success! Found Eulerian ${pathType}. All ${graph.edges.length} edges visited.`
                : `Incomplete. Only ${visitedEdges.size}/${graph.edges.length} edges visited.`
        });

        return { steps, pathType };
    };

    const runAlgorithm = () => {
        if (graph.nodes.length === 0) return;
        const { steps, pathType } = findEulerianPath();
        setAlgorithm({
            ...algorithm,
            steps,
            pathType,
            isRunning: true,
            currentStep: 0
        });
    };

    const nextStep = () => {
        if (algorithm.currentStep < algorithm.steps.length - 1) {
            const nextStepIndex = algorithm.currentStep + 1;
            const step = algorithm.steps[nextStepIndex];

            // Update traversal order for edges
            const newTraversalOrder = { ...algorithm.traversalOrder };
            if (step.edge && step.action === 'traverse_edge') {
                newTraversalOrder[step.edge.id] = Object.keys(newTraversalOrder).length + 1;
            }

            setAlgorithm({
                ...algorithm,
                currentStep: nextStepIndex,
                currentPath: step.path,
                visitedEdges: step.visitedEdges,
                currentNode: step.node || null,
                degrees: step.degrees,
                oddDegreeNodes: step.oddDegreeNodes,
                pathType: step.pathType || algorithm.pathType,
                isComplete: step.isComplete || false,
                traversalOrder: newTraversalOrder
            });
        }
    };

    const prevStep = () => {
        if (algorithm.currentStep > 0) {
            const prevStepIndex = algorithm.currentStep - 1;
            const step = algorithm.steps[prevStepIndex];

            // Update traversal order for edges (remove if going backwards)
            const newTraversalOrder = { ...algorithm.traversalOrder };
            const currentStepData = algorithm.steps[algorithm.currentStep];
            if (currentStepData?.edge && currentStepData.action === 'traverse_edge') {
                delete newTraversalOrder[currentStepData.edge.id];
            }

            setAlgorithm({
                ...algorithm,
                currentStep: prevStepIndex,
                currentPath: step.path,
                visitedEdges: step.visitedEdges,
                currentNode: step.node || null,
                degrees: step.degrees,
                oddDegreeNodes: step.oddDegreeNodes,
                pathType: step.pathType || 'none',
                isComplete: step.isComplete || false,
                traversalOrder: newTraversalOrder
            });
        }
    };

    const reset = () => {
        setAlgorithm({
            isRunning: false,
            currentStep: 0,
            steps: [],
            currentPath: [],
            visitedEdges: new Set<string>(),
            currentNode: null,
            degrees: {},
            oddDegreeNodes: [],
            pathType: 'none',
            isComplete: false,
            traversalOrder: {}
        });
        setSelectedNode(null);
        setEdgeStart(null);
    };

    const currentStep = algorithm.steps[algorithm.currentStep];

    const editModeButtons = [
        { mode: 'select' as const, icon: MousePointer, label: 'Select', color: 'bg-blue-500' },
        { mode: 'add-node' as const, icon: Plus, label: 'Add Node', color: 'bg-green-500' },
        { mode: 'add-edge' as const, icon: Link, label: 'Add Edge', color: 'bg-purple-500' },
        { mode: 'delete' as const, icon: Trash2, label: 'Delete', color: 'bg-red-500' }
    ];

    const nodeIds = graph.nodes.map(n => n.id).sort();

    return (
        <div className="p-6 bg-white">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                Interactive Eulerian Path & Circuit Finder
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h2 className="text-xl font-semibold mb-4">Interactive Graph Editor</h2>

                        {/* Edit Mode Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {editModeButtons.map(({ mode, icon: Icon, label, color }) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setEditMode(mode);
                                        setSelectedNode(null);
                                        setEdgeStart(null);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 text-white rounded transition-colors ${editMode === mode ? color : 'bg-gray-400'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 rounded p-3 mb-4 text-sm">
                            {editMode === 'select' && "Click nodes to select them"}
                            {editMode === 'add-node' && "Click anywhere on the canvas to add a new node"}
                            {editMode === 'add-edge' && "Click two nodes to connect them with an edge"}
                            {editMode === 'delete' && "Click nodes or edges to delete them"}
                        </div>

                        <div onClick={handleCanvasClick} className="cursor-pointer">
                            <Graph
                                nodes={graphNodes}
                                edges={graphEdges}
                                width={600}
                                height={400}
                                highlightPath={algorithm.currentPath}
                                onNodeClick={handleNodeClick}
                                onEdgeClick={handleEdgeClick}
                                config={{
                                    showNodeWeights: algorithm.isRunning,
                                    showEdgeLabels: algorithm.isRunning,
                                    colors: {
                                        nodeBackgroundColor: "#e5e7eb",
                                        nodeTextColor: "#333",
                                        nodeStrokeColor: "#374151",
                                        nodeHighlightBackgroundColor: "#3b82f6",
                                        nodeHighlightTextColor: "#fff",
                                        nodeHighlightStrokeColor: "#fff",
                                        edgeColor: "#6b7280",
                                        edgeHighlightColor: "#10b981",
                                        edgeLabelBackgroundColor: "white",
                                        edgeLabelTextColor: "#333",
                                        edgeLabelStrokeColor: "#666",
                                        arrowColor: "#666",
                                        arrowHighlightColor: "#10b981",
                                        selfLoopColor: "#666",
                                        selfLoopHighlightColor: "#10b981",
                                        svgBackgroundColor: "white",
                                        svgBorderColor: "#d1d5db",
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={runAlgorithm}
                            disabled={graph.nodes.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Play size={16} />
                            Find Eulerian Path/Circuit
                        </button>

                        <button
                            onClick={prevStep}
                            disabled={!algorithm.isRunning || algorithm.currentStep === 0}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        <button
                            onClick={nextStep}
                            disabled={!algorithm.isRunning || algorithm.currentStep >= algorithm.steps.length - 1}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>

                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2">Legend</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                                <span>Odd Degree Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                <span>Current Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span>Node in Path</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                                <span>Selected Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                                <span>Other Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 bg-green-500"></div>
                                <span>Traversed Edge</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-gray-500"></div>
                                <span>Untraversed Edge</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white border border-black rounded-full flex items-center justify-center text-xs">1</div>
                                <span>Traversal Order</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">How to Use</h3>
                        <div className="text-sm space-y-2">
                            <p><strong>Select Mode:</strong> Click nodes to select/deselect them</p>
                            <p><strong>Add Node:</strong> Click anywhere on the canvas to add a new node</p>
                            <p><strong>Add Edge:</strong> Click two nodes in sequence to connect them</p>
                            <p><strong>Delete:</strong> Click nodes or edges to remove them</p>
                            <p><strong>Algorithm:</strong> Shows node degrees and highlights traversal order</p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2">Edit Mode</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            Current: <span className="font-medium">{editMode.replace('-', ' ').toUpperCase()}</span>
                        </p>
                        {edgeStart && (
                            <p className="text-sm text-orange-600">
                                Edge start: <span className="font-bold">{edgeStart}</span>
                                <br />Click another node to complete the edge
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2">Algorithm Status</h3>
                        {algorithm.isRunning ? (
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Step:</span> {algorithm.currentStep + 1} / {algorithm.steps.length}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Path Type:</span> {
                                        algorithm.pathType === 'circuit' ? '🔄 Eulerian Circuit' :
                                            algorithm.pathType === 'path' ? '➡️ Eulerian Path' :
                                                '❌ No Eulerian Path/Circuit'
                                    }
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Edges Traversed:</span> {algorithm.visitedEdges.size} / {graph.edges.length}
                                </p>
                                {algorithm.currentPath.length > 0 && (
                                    <p className="text-sm">
                                        <span className="font-medium">Current Path:</span> {algorithm.currentPath.join(' → ')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">
                                {graph.nodes.length === 0 ? 'Add nodes to begin' : 'Click "Find Eulerian Path/Circuit" to begin'}
                            </p>
                        )}
                    </div>

                    {currentStep && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-2">Current Step</h3>
                            <p className="text-sm">
                                {currentStep.message}
                            </p>
                        </div>
                    )}

                    {algorithm.isRunning && nodeIds.length > 0 && (
                        <>
                            <MemoryBlock
                                className="mb-4"
                                title="Node Degrees"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.degrees[node] ?? 0)}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />

                            <MemoryBlock
                                className="mb-4"
                                title="Odd Degree?"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.oddDegreeNodes.includes(node))}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />

                            <MemoryBlock
                                className="mb-4"
                                title="In Current Path?"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.currentPath.includes(node))}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />
                        </>
                    )}

                    {algorithm.oddDegreeNodes.length > 0 && algorithm.isRunning && (
                        <div className="bg-orange-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-2">Odd Degree Analysis</h3>
                            <div className="space-y-1">
                                <p className="text-sm">
                                    <span className="font-medium">Odd degree nodes:</span> {algorithm.oddDegreeNodes.join(', ')}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Count:</span> {algorithm.oddDegreeNodes.length}
                                </p>
                                <div className="text-xs mt-2 p-2 bg-white rounded border">
                                    {algorithm.oddDegreeNodes.length === 0 && "✅ Eulerian Circuit possible"}
                                    {algorithm.oddDegreeNodes.length === 2 && "✅ Eulerian Path possible"}
                                    {algorithm.oddDegreeNodes.length > 2 && "❌ No Eulerian path/circuit"}
                                </div>
                            </div>
                        </div>
                    )}

                    {algorithm.isComplete && algorithm.currentPath.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-2">
                                {algorithm.pathType === 'circuit' ? '🔄 Eulerian Circuit Found!' : '➡️ Eulerian Path Found!'}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm font-mono bg-white p-2 rounded border">
                                    {algorithm.currentPath.join(' → ')}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {algorithm.pathType === 'circuit'
                                        ? 'This path visits every edge exactly once and returns to the starting node.'
                                        : 'This path visits every edge exactly once, starting and ending at different nodes.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Eulerian Conditions</h3>
                        <div className="text-sm space-y-2">
                            <p><strong>Eulerian Circuit:</strong> All vertices have even degree</p>
                            <p><strong>Eulerian Path:</strong> Exactly 2 vertices have odd degree</p>
                            <p><strong>No Eulerian Path:</strong> More than 2 vertices have odd degree</p>
                            <p><strong>Note:</strong> Graph must be connected (all edges reachable)</p>
                            <div className="mt-3 p-2 bg-white rounded border text-xs">
                                <strong>Hierholzer's Algorithm:</strong> Efficiently finds Eulerian paths/circuits by building cycles and merging them.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EulerianPathCircuit;