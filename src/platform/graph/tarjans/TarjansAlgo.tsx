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

interface Bridge {
    source: string;
    target: string;
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
    bridge?: Bridge;
    backNode?: string;
    discoveryTime?: number;
    lowLink?: number;
    visited: Set<string>;
    discoveryTimes: Record<string, number>;
    lowLinks: Record<string, number>;
    callStack: CallStackFrame[];
    stackOperations: StackOperation[];
    bridges?: Bridge[];
    parentMap: Record<string, string | null>;
    message: string;
}

interface AlgorithmState {
    isRunning: boolean;
    currentStep: number;
    steps: AlgorithmStep[];
    bridges: Bridge[];
    visitedNodes: Set<string>;
    currentNode: string | null;
    discoveryTimes: Record<string, number>;
    lowLinks: Record<string, number>;
    time: number;
    callStack: CallStackFrame[];
    stackOperations: StackOperation[];
    parent: Record<string, string | null>;
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

    // well it can happen that the data is not accurate...
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
            {
                title && (
                    <p className="text-sm font-semibold mb-2">
                        {title}
                    </p>
                )
            }
            {
                label && (
                    <div className="flex flex-row bg-gray-600 text-white rounded-t-md p-1" style={{ width: `${availableWidth}px` }}>
                        {label.map((item, index) => (
                            <div key={index} className={`flex items-center justify-center w-[${blockSize}px] h-[15px] border-r border-gray-300 last:border-r-0 text-xs`}>
                                {item}
                            </div>
                        ))}
                    </div>
                )
            }
            <div className="flex flex-row bg-gray-200 rounded-b-md p-1" style={{ width: `${availableWidth}px` }}>
                {transformedData.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-center w-[${blockSize}px] h-[30px] border-r border-gray-300 last:border-r-0 text-xs`}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}

const BridgeFinder = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [graph, setGraph] = useState<Graph>({
        nodes: [
            { id: 'A', x: 150, y: 100 },
            { id: 'B', x: 150, y: 300 },
            { id: 'C', x: 350, y: 100 },
            { id: 'D', x: 350, y: 300 },
        ],
        edges: [

            { source: 'A', target: 'B', id: 'A-B' },
            { source: 'A', target: 'C', id: 'A-C' },
            { source: 'B', target: 'C', id: 'B-C' },
            { source: 'B', target: 'D', id: 'B-D' }
        ]
    });

    const [editMode, setEditMode] = useState<'select' | 'add-node' | 'add-edge' | 'delete'>('select');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [edgeStart, setEdgeStart] = useState<string | null>(null);

    const [algorithm, setAlgorithm] = useState<AlgorithmState>({
        isRunning: false,
        currentStep: 0,
        steps: [],
        bridges: [],
        visitedNodes: new Set<string>(),
        currentNode: null,
        discoveryTimes: {},
        lowLinks: {},
        time: 0,
        callStack: [],
        stackOperations: [],
        parent: {},
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

    // Tarjan's Bridge Finding Algorithm with Call Stack Tracking
    const findBridges = (startNode: string = 'A'): { steps: AlgorithmStep[], bridges: Bridge[] } => {
        const steps: AlgorithmStep[] = [];
        const bridges: Bridge[] = [];
        const visited = new Set<string>();
        const discoveryTimes: Record<string, number> = {};
        const lowLinks: Record<string, number> = {};
        const parent: Record<string, string | null> = {};
        const callStack: CallStackFrame[] = [];
        const stackOperations: StackOperation[] = [];
        let time = 0;

        // Build adjacency list
        const adj: Record<string, string[]> = {};
        graph.nodes.forEach(node => adj[node.id] = []);
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
                message: `DFS(${u}): PUSH to stack. disc[${u}] = ${discoveryTimes[u]}, low[${u}] = ${lowLinks[u]}`
            });

            for (const v of adj[u]) {
                if (!visited.has(v)) {
                    parent[v] = u;

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
                        message: `Exploring edge ${u} -> ${v}. Will call DFS(${v})`
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
                        message: `Returned from DFS(${v}). Updated low[${u}] = min(${oldLowLink}, ${lowLinks[v]}) = ${lowLinks[u]}`
                    });

                    // Check if edge (u,v) is a bridge
                    if (lowLinks[v] > discoveryTimes[u]) {
                        bridges.push({ source: u, target: v });
                        steps.push({
                            action: 'bridge_found',
                            bridge: { source: u, target: v },
                            bridges: [...bridges],
                            visited: new Set(visited),
                            discoveryTimes: { ...discoveryTimes },
                            lowLinks: { ...lowLinks },
                            callStack: [...callStack],
                            stackOperations: [...stackOperations],
                            parentMap: { ...parent },
                            message: `Bridge found: ${u} - ${v} (low[${v}] = ${lowLinks[v]} > disc[${u}] = ${discoveryTimes[u]})`
                        });
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
                message: `DFS(${u}): FINISHED. POP from stack and return to ${parentNode || 'main'}`
            });
        };

        // Start DFS from the first available node
        const startNodeId = graph.nodes.find(n => n.id === startNode)?.id || graph.nodes[0]?.id;
        if (startNodeId) {
            dfs(startNodeId);
        }

        return { steps, bridges };
    };

    const runAlgorithm = () => {
        if (graph.nodes.length === 0) return;
        const { steps, bridges } = findBridges();
        setAlgorithm({
            ...algorithm,
            steps,
            bridges: [], // Don't show bridges until we step through and find them
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
                bridges: step.bridges || algorithm.bridges,
                callStack: step.callStack || [],
                stackOperations: step.stackOperations || [],
                parent: step.parentMap || {}
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
                bridges: step.bridges || [],
                callStack: step.callStack || [],
                stackOperations: step.stackOperations || [],
                parent: step.parentMap || {}
            });
        }
    };

    const reset = () => {
        setAlgorithm({
            isRunning: false,
            currentStep: 0,
            steps: [],
            bridges: [],
            visitedNodes: new Set<string>(),
            currentNode: null,
            discoveryTimes: {},
            lowLinks: {},
            time: 0,
            callStack: [],
            stackOperations: [],
            parent: {}
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
            .attr('stroke-width', 15) // Thick for easy clicking
            .style('cursor', editMode === 'delete' ? 'pointer' : 'default')
            .on('click', (event, d) => handleEdgeClick(event, d.id));

        // Visible edge line
        const edges = edgeGroups.append('line')
            .attr('class', 'edge')
            .attr('x1', d => graph.nodes.find(n => n.id === d.source)?.x || 0)
            .attr('y1', d => graph.nodes.find(n => n.id === d.source)?.y || 0)
            .attr('x2', d => graph.nodes.find(n => n.id === d.target)?.x || 0)
            .attr('y2', d => graph.nodes.find(n => n.id === d.target)?.y || 0)
            .attr('stroke', d => {
                if (algorithm.isRunning) {
                    const isBridge = algorithm.bridges.some(b =>
                        (b.source === d.source && b.target === d.target) ||
                        (b.source === d.target && b.target === d.source)
                    );
                    return isBridge ? '#ef4444' : '#6b7280';
                }
                if (editMode === 'delete') {
                    return '#ef4444'; // Red when in delete mode
                }
                return '#6b7280';
            })
            .attr('stroke-width', d => {
                if (algorithm.isRunning) {
                    const isBridge = algorithm.bridges.some(b =>
                        (b.source === d.source && b.target === d.target) ||
                        (b.source === d.target && b.target === d.source)
                    );
                    return isBridge ? 4 : 2;
                }
                if (editMode === 'delete') {
                    return 3; // Thicker in delete mode
                }
                return 2;
            })
            .style('pointer-events', 'none'); // Let the hit area handle clicks

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
                    if (d.id === algorithm.currentNode) return '#3b82f6';
                    if (algorithm.visitedNodes.has(d.id)) return '#10b981';
                    return '#e5e7eb';
                }
                if (d.id === selectedNode) return '#fbbf24';
                if (d.id === edgeStart) return '#f59e0b';
                return '#e5e7eb';
            })
            .attr('stroke', d => {
                if (d.id === selectedNode || d.id === edgeStart) return '#f59e0b';
                return '#374151';
            })
            .attr('stroke-width', d => {
                if (d.id === selectedNode || d.id === edgeStart) return 3;
                return 2;
            });

        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', d => {
                if (algorithm.isRunning && d.id === algorithm.currentNode) return 'white';
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

    return (
        <div className="p-6 bg-white">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                Interactive Bridge Detection with Tarjan's Algorithm
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
                            {editMode === 'delete' && "Click nodes or edges to delete them (edges are highlighted in red and easier to click)"}
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
                                <div className="w-8 h-0.5 bg-red-500"></div>
                                <span>Bridge</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-gray-500"></div>
                                <span>Regular Edge</span>
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
                                    <span className="font-medium">Bridges Found:</span> {algorithm.bridges.length}
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
                                {currentStep.action === 'bridge_found' && (
                                    <>
                                        <span className="font-bold">Bridge found:</span> {currentStep.bridge?.source} - {currentStep.bridge?.target}
                                    </>
                                )}
                                {currentStep.action === 'dfs_call' && (
                                    <>
                                        <span className="font-bold">DFS called from:</span> {currentStep.parent} DFS({currentStep.node})
                                    </>
                                )}
                                {currentStep.action === 'dfs_return' && (
                                    <>
                                        <span className="font-bold">DFS returned from:</span> {currentStep.parent} DFS({currentStep.node})
                                    </>
                                )}
                                {!['bridge_found', 'dfs_call', 'dfs_return'].includes(currentStep.action) && (
                                    currentStep.message
                                )}
                            </p>
                        </div>
                    )}

                    {
                        algorithm.stackOperations.length > 0 && (
                            <>
                                <MemoryBlock
                                    className="mb-4"
                                    title="Parent Map"
                                    label={['A', 'B', 'C', 'D']}
                                    data={['A', 'B', 'C', 'D'].map(node => algorithm.parent[node] || 'null')}
                                    width={200}
                                    fixDataSize={4}
                                />  

                                <MemoryBlock
                                    className="mb-4"
                                    title="Visited Nodes"
                                    label={['A', 'B', 'C', 'D']}
                                    data={['A', 'B', 'C', 'D'].map(node => algorithm.visitedNodes.has(node))}
                                    width={200}
                                    fixDataSize={4}
                                />

                                <MemoryBlock
                                    className="mb-4"
                                    title="Discovery Times"
                                    label={['A', 'B', 'C', 'D']}
                                    data={['A', 'B', 'C', 'D'].map(node => algorithm.discoveryTimes[node] || 0)}
                                    width={200}
                                    fixDataSize={4}
                                />

                                <MemoryBlock
                                    className="mb-4"
                                    title="Low Links"
                                    label={['A', 'B', 'C', 'D']}
                                    data={['A', 'B', 'C', 'D'].map(node => algorithm.lowLinks[node] || 0)}
                                    width={200}
                                    fixDataSize={4}
                                />
                            </>
                        )
                    }


                    {algorithm.stackOperations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-200 my-3">
                            <h4 className="font-semibold mb-2 text-sm">Recent Stack Operations:</h4>
                            <div className="space-y-1 overflow-y-auto">
                                {algorithm.stackOperations.map((op, index) => (
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





                    {algorithm.bridges.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-2">Bridges Found</h3>
                            <div className="space-y-1">
                                {algorithm.bridges.map((bridge, index) => (
                                    <div key={index} className="text-sm font-mono">
                                        {bridge.source} - {bridge.target}
                                    </div>
                                ))}
                            </div>
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
                </div>
            </div>


        </div>
    );
};

export default BridgeFinder;