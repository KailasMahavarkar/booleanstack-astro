import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Play, RotateCcw, Plus, MousePointer, Link, Trash2 } from 'lucide-react';

// Type definitions
interface Node {
    id: string;
    x: number;
    y: number;
}

interface Edge {
    source: string;
    target: string;
    id: string;
}

interface CallStackFrame {
    node: string;
    parent: string | null;
    neighbors: string[];
    currentNeighborIndex: number;
    phase: string;
}

interface StackOperation {
    operation: string;
    node: string;
    parent: string | null;
    stack: CallStackFrame[];
}

interface AlgorithmStep {
    action: string;
    node?: string;
    parent?: string;
    child?: string;
    articulationPoint?: string;
    backNode?: string;
    discoveryTime?: number;
    lowLink?: number;
    visited: Set<string>;
    discoveryTimes: Record<string, number>;
    lowLinks: Record<string, number>;
    callStack: CallStackFrame[];
    stackOperations: StackOperation[];
    articulationPoints?: string[];
    parentMap: Record<string, string | null>;
    childrenCount?: Record<string, number>;
    message: string;
}

interface AlgorithmState {
    isRunning: boolean;
    currentStep: number;
    steps: AlgorithmStep[];
    articulationPoints: string[];
    visitedNodes: Set<string>;
    currentNode: string | null;
    discoveryTimes: Record<string, number>;
    lowLinks: Record<string, number>;
    time: number;
    callStack: CallStackFrame[];
    stackOperations: StackOperation[];
    parent: Record<string, string | null>;
    childrenCount: Record<string, number>;
}

interface Graph {
    nodes: Node[];
    edges: Edge[];
}

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

const ArticulationPointFinder = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [graph, setGraph] = useState<Graph>({
        nodes: [
            { id: 'A', x: 150, y: 100 },
            { id: 'B', x: 300, y: 100 },
            { id: 'C', x: 450, y: 100 },
            { id: 'D', x: 150, y: 250 },
            { id: 'E', x: 450, y: 250 },
        ],
        edges: [
            { source: 'A', target: 'B', id: 'A-B' },
            { source: 'B', target: 'C', id: 'B-C' },
            { source: 'A', target: 'D', id: 'A-D' },
            { source: 'C', target: 'E', id: 'C-E' }
        ]
    });

    const [editMode, setEditMode] = useState<'select' | 'add-node' | 'add-edge' | 'delete'>('select');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [edgeStart, setEdgeStart] = useState<string | null>(null);

    const [algorithm, setAlgorithm] = useState<AlgorithmState>({
        isRunning: false,
        currentStep: 0,
        steps: [],
        articulationPoints: [],
        visitedNodes: new Set<string>(),
        currentNode: null,
        discoveryTimes: {},
        lowLinks: {},
        time: 0,
        callStack: [],
        stackOperations: [],
        parent: {},
        childrenCount: {}
    });

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

    // Handle SVG clicks
    const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
        if (algorithm.isRunning) return;

        if (!svgRef.current) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const x = event.clientX - svgRect.left;
        const y = event.clientY - svgRect.top;

        if (editMode === 'add-node') {
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
    const handleNodeClick = (event: React.MouseEvent, nodeId: string) => {
        event.stopPropagation();
        if (algorithm.isRunning) return;

        if (editMode === 'select') {
            setSelectedNode(selectedNode === nodeId ? null : nodeId);
        } else if (editMode === 'delete') {
            deleteNode(nodeId);
        } else if (editMode === 'add-edge') {
            if (edgeStart === null) {
                setEdgeStart(nodeId);
                setSelectedNode(nodeId);
            } else if (edgeStart !== nodeId) {
                addEdge(edgeStart, nodeId);
                setEdgeStart(null);
                setSelectedNode(null);
            }
        }
    };

    // Handle edge clicks
    const handleEdgeClick = (event: React.MouseEvent, edgeId: string) => {
        event.stopPropagation();
        if (algorithm.isRunning) return;

        if (editMode === 'delete') {
            deleteEdge(edgeId);
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

    // Tarjan's Articulation Points Algorithm
    const findArticulationPoints = (startNode: string = 'A'): { steps: AlgorithmStep[], articulationPoints: string[] } => {
        const steps: AlgorithmStep[] = [];
        const articulationPoints: string[] = [];
        const visited = new Set<string>();
        const discoveryTimes: Record<string, number> = {};
        const lowLinks: Record<string, number> = {};
        const parent: Record<string, string | null> = {};
        const callStack: CallStackFrame[] = [];
        const stackOperations: StackOperation[] = [];
        const childrenCount: Record<string, number> = {};
        let time = 0;

        // Build adjacency list
        const adj: Record<string, string[]> = {};
        graph.nodes.forEach(node => {
            adj[node.id] = [];
            childrenCount[node.id] = 0;
        });
        graph.edges.forEach(edge => {
            adj[edge.source].push(edge.target);
            adj[edge.target].push(edge.source);
        });

        const dfs = (u: string, parentNode: string | null = null) => {
            // Push to call stack
            callStack.push({
                node: u,
                parent: parentNode,
                neighbors: [...adj[u]],
                currentNeighborIndex: 0,
                phase: 'entering'
            });

            stackOperations.push({
                operation: 'push',
                node: u,
                parent: parentNode,
                stack: [...callStack]
            });

            visited.add(u);
            discoveryTimes[u] = lowLinks[u] = time++;

            steps.push({
                action: 'visit',
                node: u,
                discoveryTime: discoveryTimes[u],
                lowLink: lowLinks[u],
                visited: new Set(visited),
                discoveryTimes: { ...discoveryTimes },
                lowLinks: { ...lowLinks },
                callStack: [...callStack],
                stackOperations: [...stackOperations],
                parentMap: { ...parent },
                childrenCount: { ...childrenCount },
                message: `DFS(${u}): PUSH to stack. disc[${u}] = ${discoveryTimes[u]}, low[${u}] = ${lowLinks[u]}`
            });

            for (const v of adj[u]) {
                if (!visited.has(v)) {
                    parent[v] = u;
                    childrenCount[u] = (childrenCount[u] || 0) + 1;

                    steps.push({
                        action: 'explore',
                        node: v,
                        parent: u,
                        visited: new Set(visited),
                        discoveryTimes: { ...discoveryTimes },
                        lowLinks: { ...lowLinks },
                        callStack: [...callStack],
                        stackOperations: [...stackOperations],
                        parentMap: { ...parent },
                        childrenCount: { ...childrenCount },
                        message: `Exploring edge ${u} -> ${v}. Will call DFS(${v}). Children count of ${u}: ${childrenCount[u]}`
                    });

                    dfs(v, u);

                    // Update low-link value after returning from recursion
                    const oldLowLink = lowLinks[u];
                    lowLinks[u] = Math.min(lowLinks[u], lowLinks[v]);

                    steps.push({
                        action: 'update_lowlink',
                        node: u,
                        child: v,
                        visited: new Set(visited),
                        discoveryTimes: { ...discoveryTimes },
                        lowLinks: { ...lowLinks },
                        callStack: [...callStack],
                        stackOperations: [...stackOperations],
                        parentMap: { ...parent },
                        childrenCount: { ...childrenCount },
                        message: `Returned from DFS(${v}). Updated low[${u}] = min(${oldLowLink}, ${lowLinks[v]}) = ${lowLinks[u]}`
                    });

                    // Check for articulation point
                    // Case 1: Root node with more than one child
                    if (parent[u] === null && childrenCount[u] > 1) {
                        if (!articulationPoints.includes(u)) {
                            articulationPoints.push(u);
                            steps.push({
                                action: 'articulation_point_found',
                                articulationPoint: u,
                                articulationPoints: [...articulationPoints],
                                visited: new Set(visited),
                                discoveryTimes: { ...discoveryTimes },
                                lowLinks: { ...lowLinks },
                                callStack: [...callStack],
                                stackOperations: [...stackOperations],
                                parentMap: { ...parent },
                                childrenCount: { ...childrenCount },
                                message: `Articulation point found: ${u} (root with ${childrenCount[u]} children)`
                            });
                        }
                    }
                    // Case 2: Non-root node where low[v] >= disc[u]
                    else if (parent[u] !== null && lowLinks[v] >= discoveryTimes[u]) {
                        if (!articulationPoints.includes(u)) {
                            articulationPoints.push(u);
                            steps.push({
                                action: 'articulation_point_found',
                                articulationPoint: u,
                                articulationPoints: [...articulationPoints],
                                visited: new Set(visited),
                                discoveryTimes: { ...discoveryTimes },
                                lowLinks: { ...lowLinks },
                                callStack: [...callStack],
                                stackOperations: [...stackOperations],
                                parentMap: { ...parent },
                                childrenCount: { ...childrenCount },
                                message: `Articulation point found: ${u} (low[${v}] = ${lowLinks[v]} >= disc[${u}] = ${discoveryTimes[u]})`
                            });
                        }
                    }
                } else if (v !== parent[u]) {
                    // Back edge
                    const oldLowLink = lowLinks[u];
                    lowLinks[u] = Math.min(lowLinks[u], discoveryTimes[v]);
                    steps.push({
                        action: 'back_edge',
                        node: u,
                        backNode: v,
                        visited: new Set(visited),
                        discoveryTimes: { ...discoveryTimes },
                        lowLinks: { ...lowLinks },
                        callStack: [...callStack],
                        stackOperations: [...stackOperations],
                        parentMap: { ...parent },
                        childrenCount: { ...childrenCount },
                        message: `Back edge ${u} -> ${v}: low[${u}] = min(${oldLowLink}, disc[${v}]) = ${lowLinks[u]}`
                    });
                }
            }

            // Pop from call stack before returning
            const poppedFrame = callStack.pop();
            stackOperations.push({
                operation: 'pop',
                node: u,
                parent: parentNode,
                stack: [...callStack]
            });

            steps.push({
                action: 'return',
                node: u,
                visited: new Set(visited),
                discoveryTimes: { ...discoveryTimes },
                lowLinks: { ...lowLinks },
                callStack: [...callStack],
                stackOperations: [...stackOperations],
                parentMap: { ...parent },
                childrenCount: { ...childrenCount },
                message: `DFS(${u}): FINISHED. POP from stack and return to ${parentNode || 'main'}`
            });
        };

        // Start DFS from the first available node or specified start node
        const startNodeId = graph.nodes.find(n => n.id === startNode)?.id || graph.nodes[0]?.id;
        if (startNodeId) {
            dfs(startNodeId);
        }

        return { steps, articulationPoints };
    };

    const runAlgorithm = () => {
        if (graph.nodes.length === 0) return;
        const { steps, articulationPoints } = findArticulationPoints();
        setAlgorithm({
            ...algorithm,
            steps,
            articulationPoints: [], // Don't show articulation points until we step through and find them
            isRunning: true,
            currentStep: 0
        });
    };

    const nextStep = () => {
        if (algorithm.currentStep < algorithm.steps.length - 1) {
            const nextStepIndex = algorithm.currentStep + 1;
            const step = algorithm.steps[nextStepIndex];
            setAlgorithm({
                ...algorithm,
                currentStep: nextStepIndex,
                visitedNodes: step.visited,
                currentNode: step.node || null,
                discoveryTimes: step.discoveryTimes,
                lowLinks: step.lowLinks,
                articulationPoints: step.articulationPoints || algorithm.articulationPoints,
                callStack: step.callStack || [],
                stackOperations: step.stackOperations || [],
                parent: step.parentMap || {},
                childrenCount: step.childrenCount || {}
            });
        }
    };

    const prevStep = () => {
        if (algorithm.currentStep > 0) {
            const prevStepIndex = algorithm.currentStep - 1;
            const step = algorithm.steps[prevStepIndex];
            setAlgorithm({
                ...algorithm,
                currentStep: prevStepIndex,
                visitedNodes: step.visited,
                currentNode: step.node || null,
                discoveryTimes: step.discoveryTimes,
                lowLinks: step.lowLinks,
                articulationPoints: step.articulationPoints || [],
                callStack: step.callStack || [],
                stackOperations: step.stackOperations || [],
                parent: step.parentMap || {},
                childrenCount: step.childrenCount || {}
            });
        }
    };

    const reset = () => {
        setAlgorithm({
            isRunning: false,
            currentStep: 0,
            steps: [],
            articulationPoints: [],
            visitedNodes: new Set<string>(),
            currentNode: null,
            discoveryTimes: {},
            lowLinks: {},
            time: 0,
            callStack: [],
            stackOperations: [],
            parent: {},
            childrenCount: {}
        });
        setSelectedNode(null);
        setEdgeStart(null);
    };

    // D3 Visualization
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 400;

        // Create edges with thicker hit area for better clicking
        const edgeGroups = svg.selectAll('.edge-group')
            .data(graph.edges)
            .enter()
            .append('g')
            .attr('class', 'edge-group');

        // Invisible thick line for easier clicking
        edgeGroups.append('line')
            .attr('class', 'edge-hitarea')
            .attr('x1', d => graph.nodes.find(n => n.id === d.source)?.x || 0)
            .attr('y1', d => graph.nodes.find(n => n.id === d.source)?.y || 0)
            .attr('x2', d => graph.nodes.find(n => n.id === d.target)?.x || 0)
            .attr('y2', d => graph.nodes.find(n => n.id === d.target)?.y || 0)
            .attr('stroke', 'transparent')
            .attr('stroke-width', 15)
            .style('cursor', editMode === 'delete' ? 'pointer' : 'default')
            .on('click', (event, d) => handleEdgeClick(event, d.id));

        // Visible edge line
        const edges = edgeGroups.append('line')
            .attr('class', 'edge')
            .attr('x1', d => graph.nodes.find(n => n.id === d.source)?.x || 0)
            .attr('y1', d => graph.nodes.find(n => n.id === d.source)?.y || 0)
            .attr('x2', d => graph.nodes.find(n => n.id === d.target)?.x || 0)
            .attr('y2', d => graph.nodes.find(n => n.id === d.target)?.y || 0)
            .attr('stroke', editMode === 'delete' ? '#ef4444' : '#6b7280')
            .attr('stroke-width', editMode === 'delete' ? 3 : 2)
            .style('pointer-events', 'none');

        // Create nodes
        const nodes = svg.selectAll('.node')
            .data(graph.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => handleNodeClick(event, d.id));

        nodes.append('circle')
            .attr('r', 25)
            .attr('fill', d => {
                if (algorithm.isRunning) {
                    if (algorithm.articulationPoints.includes(d.id)) return '#ef4444'; // Red for articulation points
                    if (d.id === algorithm.currentNode) return '#3b82f6'; // Blue for current
                    if (algorithm.visitedNodes.has(d.id)) return '#10b981'; // Green for visited
                    return '#e5e7eb'; // Gray for unvisited
                }
                if (d.id === selectedNode) return '#fbbf24';
                if (d.id === edgeStart) return '#f59e0b';
                return '#e5e7eb';
            })
            .attr('stroke', d => {
                if (algorithm.isRunning && algorithm.articulationPoints.includes(d.id)) {
                    return '#dc2626';
                }
                if (d.id === selectedNode || d.id === edgeStart) return '#f59e0b';
                return '#374151';
            })
            .attr('stroke-width', d => {
                if (algorithm.isRunning && algorithm.articulationPoints.includes(d.id)) {
                    return 4;
                }
                if (d.id === selectedNode || d.id === edgeStart) return 3;
                return 2;
            });

        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', d => {
                if (algorithm.isRunning) {
                    if (algorithm.articulationPoints.includes(d.id)) return 'white';
                    if (d.id === algorithm.currentNode) return 'white';
                }
                return 'black';
            })
            .text(d => d.id);

        // Add discovery time and low-link labels
        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '45px')
            .attr('font-size', '12px')
            .attr('fill', '#374151')
            .text(d => {
                if (algorithm.isRunning && algorithm.discoveryTimes[d.id] !== undefined) {
                    return `disc: ${algorithm.discoveryTimes[d.id]}`;
                }
                return '';
            });

        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '60px')
            .attr('font-size', '12px')
            .attr('fill', '#374151')
            .text(d => {
                if (algorithm.isRunning && algorithm.lowLinks[d.id] !== undefined) {
                    return `low: ${algorithm.lowLinks[d.id]}`;
                }
                return '';
            });

        // Add click handler to SVG for adding nodes
        svg.on('click', handleSvgClick);

    }, [graph, algorithm, editMode, selectedNode, edgeStart]);

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
                Interactive Articulation Points Detection with Tarjan's Algorithm
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

                        <svg ref={svgRef} width="600" height="400" className="border border-gray-300 rounded bg-white"></svg>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={runAlgorithm}
                            disabled={graph.nodes.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Play size={16} />
                            Start Algorithm
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
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                <span>Articulation Point (Cut Vertex)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                <span>Current Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span>Visited Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                                <span>Selected Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                                <span>Unvisited Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-gray-500"></div>
                                <span>Edge</span>
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
                            <p><strong>Algorithm:</strong> Discovery time (disc) and low-link values (low) are shown below each node</p>
                            <p><strong>Articulation Points:</strong> Nodes whose removal increases the number of connected components</p>
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
                                    <span className="font-medium">Current Node:</span> {algorithm.currentNode || 'None'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Articulation Points Found:</span> {algorithm.articulationPoints.length}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">
                                {graph.nodes.length === 0 ? 'Add nodes to begin' : 'Click "Start Algorithm" to begin'}
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

                    {algorithm.stackOperations.length > 0 && nodeIds.length > 0 && (
                        <>
                            <MemoryBlock
                                className="mb-4"
                                title="Parent Map"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.parent[node] || 'null')}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />

                            <MemoryBlock
                                className="mb-4"
                                title="Visited Nodes"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.visitedNodes.has(node))}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />

                            <MemoryBlock
                                className="mb-4"
                                title="Discovery Times"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.discoveryTimes[node] ?? 0)}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />

                            <MemoryBlock
                                className="mb-4"
                                title="Low Links"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.lowLinks[node] ?? 0)}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />

                            <MemoryBlock
                                className="mb-4"
                                title="Children Count"
                                label={nodeIds}
                                data={nodeIds.map(node => algorithm.childrenCount[node] ?? 0)}
                                width={200}
                                fixDataSize={nodeIds.length}
                            />
                        </>
                    )}

                    {algorithm.stackOperations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-200 my-3">
                            <h4 className="font-semibold mb-2 text-sm">Recent Stack Operations:</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {algorithm.stackOperations.slice(-5).map((op, index) => (
                                    <div
                                        key={index}
                                        className={`text-xs p-1 rounded ${op.operation === 'push'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        <span className="font-semibold">
                                            {op.operation.toUpperCase()}
                                        </span>
                                        {' '}DFS({op.node})
                                        {op.parent && ` from ${op.parent}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {algorithm.articulationPoints.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-2">Articulation Points Found</h3>
                            <div className="space-y-1">
                                {algorithm.articulationPoints.map((point, index) => (
                                    <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                                        Node {point}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                These nodes are critical - removing any of them would disconnect the graph.
                            </p>
                        </div>
                    )}

                    {algorithm.isRunning && (
                        <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">DFS Call Stack</h3>
                            {algorithm.callStack.length === 0 ? (
                                <p className="text-sm text-gray-600">Stack is empty</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-xs text-gray-600 mb-2">
                                        Bottom → Top (most recent call)
                                    </div>
                                    {algorithm.callStack.map((frame, index) => (
                                        <div
                                            key={index}
                                            className={`p-2 rounded border text-sm ${index === algorithm.callStack.length - 1
                                                ? 'bg-purple-200 border-purple-400 font-semibold'
                                                : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <div className="font-mono">
                                                DFS({frame.node})
                                                {frame.parent && (
                                                    <span className="text-gray-600 ml-2">
                                                        ← called from {frame.parent}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-xs text-gray-600 mt-2">
                                        Stack depth: {algorithm.callStack.length}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Algorithm Explanation</h3>
                        <div className="text-sm space-y-2">
                            <p><strong>Articulation Points:</strong> Vertices whose removal increases the number of connected components in the graph.</p>
                            <p><strong>Two Conditions:</strong></p>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                                <li><strong>Root:</strong> Has more than one child in DFS tree</li>
                                <li><strong>Non-root:</strong> Has a child v where low[v] ≥ disc[u]</li>
                            </ul>
                            <p><strong>Discovery Time:</strong> When a node is first visited</p>
                            <p><strong>Low Link:</strong> Lowest discovery time reachable from the subtree</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticulationPointFinder;