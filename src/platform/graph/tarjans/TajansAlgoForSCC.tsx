import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Play, RotateCcw, Plus, MousePointer, Link, Trash2 } from 'lucide-react';

// Type definitions
interface Node {
    id: string;
    x: number;
    y: number;
    sccId?: number;
}

interface Edge {
    source: string;
    target: string;
    id: string;
}

interface SCC {
    id: number;
    nodes: string[];
}

interface CallStackFrame {
    node: string;
    neighbors: string[];
    currentNeighborIndex: number;
    phase: string;
}

interface StackOperation {
    operation: string;
    node: string;
    stack: string[];
}

interface AlgorithmStep {
    action: string;
    node?: string;
    scc?: string[];
    discoveryTime?: number;
    lowLink?: number;
    visited: Set<string>;
    discoveryTimes: Record<string, number>;
    lowLinks: Record<string, number>;
    inStack: Record<string, boolean>;
    sccStack: string[];
    callStack: CallStackFrame[];
    stackOperations: StackOperation[];
    sccs: SCC[];
    message: string;
}

interface AlgorithmState {
    isRunning: boolean;
    currentStep: number;
    steps: AlgorithmStep[];
    sccs: SCC[];
    visitedNodes: Set<string>;
    currentNode: string | null;
    discoveryTimes: Record<string, number>;
    lowLinks: Record<string, number>;
    inStack: Record<string, boolean>;
    sccStack: string[];
    time: number;
    callStack: CallStackFrame[];
    stackOperations: StackOperation[];
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
                            <div
                                style={{
                                    width: `${blockSize}px`
                                }}
                                key={index} className={`flex items-center justify-center h-[15px] border-r border-gray-300 last:border-r-0 text-xs`}>
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
                        style={{
                            width: `${blockSize}px`
                        }}
                        className={`flex items-center justify-center h-[30px] border-r border-gray-300 last:border-r-0 text-xs`}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}


const SCCFinder = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [graph, setGraph] = useState<Graph>({
        nodes: [
            { id: 'A', x: 150, y: 100 },
            { id: 'B', x: 350, y: 100 },
            { id: 'C', x: 450, y: 200 },
            { id: 'D', x: 250, y: 300 },
        ],
        edges: [
            { source: 'A', target: 'B', id: 'A-B' },
            { source: 'B', target: 'C', id: 'B-C' },
            { source: 'C', target: 'D', id: 'C-D' },
            { source: 'D', target: 'A', id: 'D-A' },
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
        sccs: [],
        visitedNodes: new Set<string>(),
        currentNode: null,
        discoveryTimes: {},
        lowLinks: {},
        inStack: {},
        sccStack: [],
        time: 0,
        callStack: [],
        stackOperations: []
    });

    // SCC colors
    const sccColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff8a80', '#ce93d8', '#ffab91'];

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

    // Add edge (directed)
    const addEdge = (source: string, target: string) => {
        const edgeId = generateEdgeId(source, target);

        // Check if edge already exists
        const edgeExists = graph.edges.some(e => e.id === edgeId);

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

    // Tarjan's SCC Algorithm with Stack Tracking
    const findSCCs = (startNode: string = 'A'): { steps: AlgorithmStep[], sccs: SCC[] } => {
        const steps: AlgorithmStep[] = [];
        const sccs: SCC[] = [];
        const visited = new Set<string>();
        const discoveryTimes: Record<string, number> = {};
        const lowLinks: Record<string, number> = {};
        const inStack: Record<string, boolean> = {};
        const sccStack: string[] = [];
        const callStack: CallStackFrame[] = [];
        const stackOperations: StackOperation[] = [];
        let time = 0;
        let sccId = 0;

        // Build adjacency list (directed graph)
        const adj: Record<string, string[]> = {};
        graph.nodes.forEach(node => adj[node.id] = []);
        graph.edges.forEach(edge => {
            adj[edge.source].push(edge.target);
        });

        const dfs = (u: string) => {
            // Push to call stack
            callStack.push({
                node: u,
                neighbors: [...adj[u]],
                currentNeighborIndex: 0,
                phase: 'entering'
            });

            visited.add(u);
            discoveryTimes[u] = lowLinks[u] = time++;
            sccStack.push(u);
            inStack[u] = true;

            stackOperations.push({
                operation: 'push',
                node: u,
                stack: [...sccStack]
            });

            steps.push({
                action: 'visit',
                node: u,
                discoveryTime: discoveryTimes[u],
                lowLink: lowLinks[u],
                visited: new Set(visited),
                discoveryTimes: { ...discoveryTimes },
                lowLinks: { ...lowLinks },
                inStack: { ...inStack },
                sccStack: [...sccStack],
                callStack: [...callStack],
                stackOperations: [...stackOperations],
                sccs: [...sccs],
                message: `Visit ${u}: disc[${u}] = low[${u}] = ${discoveryTimes[u]}, push to stack`
            });

            for (const v of adj[u]) {
                if (!visited.has(v)) {
                    steps.push({
                        action: 'explore',
                        node: v,
                        visited: new Set(visited),
                        discoveryTimes: { ...discoveryTimes },
                        lowLinks: { ...lowLinks },
                        inStack: { ...inStack },
                        sccStack: [...sccStack],
                        callStack: [...callStack],
                        stackOperations: [...stackOperations],
                        sccs: [...sccs],
                        message: `Explore edge ${u} → ${v}, call DFS(${v})`
                    });

                    dfs(v);

                    // Update low-link value
                    const oldLowLink = lowLinks[u];
                    lowLinks[u] = Math.min(lowLinks[u], lowLinks[v]);

                    steps.push({
                        action: 'update_lowlink',
                        node: u,
                        visited: new Set(visited),
                        discoveryTimes: { ...discoveryTimes },
                        lowLinks: { ...lowLinks },
                        inStack: { ...inStack },
                        sccStack: [...sccStack],
                        callStack: [...callStack],
                        stackOperations: [...stackOperations],
                        sccs: [...sccs],
                        message: `Update low[${u}] = min(${oldLowLink}, ${lowLinks[v]}) = ${lowLinks[u]}`
                    });
                } else if (inStack[v]) {
                    // Cross edge to node in current SCC
                    const oldLowLink = lowLinks[u];
                    lowLinks[u] = Math.min(lowLinks[u], discoveryTimes[v]);

                    steps.push({
                        action: 'cross_edge',
                        node: u,
                        visited: new Set(visited),
                        discoveryTimes: { ...discoveryTimes },
                        lowLinks: { ...lowLinks },
                        inStack: { ...inStack },
                        sccStack: [...sccStack],
                        callStack: [...callStack],
                        stackOperations: [...stackOperations],
                        sccs: [...sccs],
                        message: `Cross edge ${u} → ${v}: low[${u}] = min(${oldLowLink}, disc[${v}]) = ${lowLinks[u]}`
                    });
                }
                // If v is visited but not in stack, it's part of different SCC - ignore
            }

            // Check if u is root of an SCC
            if (lowLinks[u] === discoveryTimes[u]) {
                const newSCC: string[] = [];
                let w: string;

                // Pop stack until u is found
                do {
                    w = sccStack.pop()!;
                    inStack[w] = false;
                    newSCC.push(w);

                    stackOperations.push({
                        operation: 'pop',
                        node: w,
                        stack: [...sccStack]
                    });
                } while (w !== u);

                sccs.push({ id: sccId++, nodes: newSCC.reverse() });

                steps.push({
                    action: 'scc_found',
                    node: u,
                    scc: newSCC,
                    visited: new Set(visited),
                    discoveryTimes: { ...discoveryTimes },
                    lowLinks: { ...lowLinks },
                    inStack: { ...inStack },
                    sccStack: [...sccStack],
                    callStack: [...callStack],
                    stackOperations: [...stackOperations],
                    sccs: [...sccs],
                    message: `SCC found rooted at ${u}: {${newSCC.join(', ')}}`
                });
            }

            // Pop from call stack
            callStack.pop();

            steps.push({
                action: 'return',
                node: u,
                visited: new Set(visited),
                discoveryTimes: { ...discoveryTimes },
                lowLinks: { ...lowLinks },
                inStack: { ...inStack },
                sccStack: [...sccStack],
                callStack: [...callStack],
                stackOperations: [...stackOperations],
                sccs: [...sccs],
                message: `Return from DFS(${u})`
            });
        };

        // Start DFS from all unvisited nodes
        for (const node of graph.nodes) {
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }

        return { steps, sccs };
    };

    const runAlgorithm = () => {
        if (graph.nodes.length === 0) return;
        const { steps, sccs } = findSCCs();
        setAlgorithm({
            ...algorithm,
            steps,
            sccs: [],
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
                inStack: step.inStack,
                sccStack: step.sccStack,
                sccs: step.sccs,
                callStack: step.callStack || [],
                stackOperations: step.stackOperations || []
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
                inStack: step.inStack,
                sccStack: step.sccStack,
                sccs: step.sccs,
                callStack: step.callStack || [],
                stackOperations: step.stackOperations || []
            });
        }
    };

    const reset = () => {
        setAlgorithm({
            isRunning: false,
            currentStep: 0,
            steps: [],
            sccs: [],
            visitedNodes: new Set<string>(),
            currentNode: null,
            discoveryTimes: {},
            lowLinks: {},
            inStack: {},
            sccStack: [],
            time: 0,
            callStack: [],
            stackOperations: []
        });
        setSelectedNode(null);
        setEdgeStart(null);
    };

    // Get node color based on SCC
    const getNodeColor = (nodeId: string): string => {
        if (algorithm.isRunning) {
            if (nodeId === algorithm.currentNode) return '#3b82f6'; // Blue for current

            // Find which SCC this node belongs to
            const scc = algorithm.sccs.find(scc => scc.nodes.includes(nodeId));
            if (scc) {
                return sccColors[scc.id % sccColors.length];
            }

            if (algorithm.visitedNodes.has(nodeId)) return '#10b981'; // Green for visited
            return '#e5e7eb'; // Gray for unvisited
        }
        if (nodeId === selectedNode) return '#fbbf24';
        if (nodeId === edgeStart) return '#f59e0b';
        return '#e5e7eb';
    };

    // D3 Visualization
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 400;

        // Define arrow marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#666');

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

        // Visible edge line with arrow
        const edges = edgeGroups.append('line')
            .attr('class', 'edge')
            .attr('x1', d => {
                const sourceNode = graph.nodes.find(n => n.id === d.source);
                const targetNode = graph.nodes.find(n => n.id === d.target);
                if (!sourceNode || !targetNode) return 0;
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                return sourceNode.x + (dx / length) * 25;
            })
            .attr('y1', d => {
                const sourceNode = graph.nodes.find(n => n.id === d.source);
                const targetNode = graph.nodes.find(n => n.id === d.target);
                if (!sourceNode || !targetNode) return 0;
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                return sourceNode.y + (dy / length) * 25;
            })
            .attr('x2', d => {
                const sourceNode = graph.nodes.find(n => n.id === d.source);
                const targetNode = graph.nodes.find(n => n.id === d.target);
                if (!sourceNode || !targetNode) return 0;
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                return targetNode.x - (dx / length) * 25;
            })
            .attr('y2', d => {
                const sourceNode = graph.nodes.find(n => n.id === d.source);
                const targetNode = graph.nodes.find(n => n.id === d.target);
                if (!sourceNode || !targetNode) return 0;
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                return targetNode.y - (dy / length) * 25;
            })
            .attr('stroke', editMode === 'delete' ? '#ef4444' : '#6b7280')
            .attr('stroke-width', editMode === 'delete' ? 3 : 2)
            .attr('marker-end', 'url(#arrowhead)')
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
            .attr('fill', d => getNodeColor(d.id))
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
                Interactive SCC Detection with Tarjan's Algorithm
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h2 className="text-xl font-semibold mb-4">Interactive Directed Graph Editor</h2>

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
                                    className={`flex items-center gap-2 px-3 py-2 text-white rounded transition-colors ${editMode === mode ? color : 'bg-gray-400'}`}
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
                            {editMode === 'add-edge' && "Click two nodes to connect them with a directed edge"}
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
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                <span>Current Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span>Visited Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                                <span>SCC Nodes (colored by SCC)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                                <span>Unvisited Node</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">How to Use</h3>
                        <div className="text-sm space-y-2">
                            <p><strong>Select Mode:</strong> Click nodes to select/deselect them</p>
                            <p><strong>Add Node:</strong> Click anywhere on the canvas to add a new node</p>
                            <p><strong>Add Edge:</strong> Click two nodes in sequence to connect them with a directed edge</p>
                            <p><strong>Delete:</strong> Click nodes or edges to remove them</p>
                            <p><strong>Algorithm:</strong> Discovery time (disc) and low-link values (low) are shown below each node</p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80">
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
                                    <span className="font-medium">SCCs Found:</span> {algorithm.sccs.length}
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
                            <p className="text-sm">{currentStep.message}</p>
                        </div>
                    )}

                    {algorithm.stackOperations.length > 0 && (
                        <>
                            <MemoryBlock
                                className="mb-4"
                                title="In Stack"
                                label={['A', 'B', 'C', 'D']}
                                data={['A', 'B', 'C', 'D'].map(node => algorithm.inStack[node] || false)}
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

                            <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                <h3 className="text-lg font-semibold mb-2">SCC Stack</h3>
                                {algorithm.sccStack.length === 0 ? (
                                    <p className="text-sm text-gray-600">Stack is empty</p>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-600 mb-2">
                                            Bottom → Top
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {algorithm.sccStack.map((node, index) => (
                                                <div
                                                    key={index}
                                                    className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-sm font-mono"
                                                >
                                                    {node}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {algorithm.sccs.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold mb-2">SCCs Found</h3>
                            <div className="space-y-2">
                                {algorithm.sccs.map((scc, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: sccColors[scc.id % sccColors.length] }}
                                        ></div>
                                        <span className="text-sm font-mono">
                                            SCC {scc.id + 1}: {'{' + scc.nodes.join(', ') + '}'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {algorithm.isRunning && (
                        <div className="bg-orange-50 rounded-lg p-4">
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
                                                ? 'bg-orange-200 border-orange-400 font-semibold'
                                                : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <div className="font-mono">DFS({frame.node})</div>
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

export default SCCFinder;