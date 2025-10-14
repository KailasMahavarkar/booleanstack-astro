import { useState, useEffect } from 'react';

interface Node {
    id: number;
    x: number;
    y: number;
    label: string;
}

interface Edge {
    from: number;
    to: number;
}

interface Graph {
    nodes: Node[];
    edges: Edge[];
}

interface KosarajuStep {
    phase?: 'dfs1' | 'dfs2' | 'transpose';
    action?: 'visit' | 'finish' | 'start_scc' | 'complete_scc';
    vertex?: number;
    visited?: boolean[];
    path?: number[];
    finishOrder?: number[];
    currentSCC?: number[];
    sccs?: number[][];
    scc?: number[];
    message: string;
}

const SCCDemo = () => {
    const [algorithm, setAlgorithm] = useState<'kosaraju' | 'simple'>('kosaraju');
    const [graph, setGraph] = useState<Graph>({
        nodes: [
            { id: 0, x: 100, y: 100, label: '0' },
            { id: 1, x: 200, y: 100, label: '1' },
            { id: 2, x: 300, y: 100, label: '2' },
            { id: 3, x: 200, y: 200, label: '3' },
            { id: 4, x: 400, y: 150, label: '4' }
        ],
        edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 0 },
            { from: 1, to: 3 },
            { from: 3, to: 1 },
            { from: 2, to: 4 }
        ]
    });

    const [sccs, setSCCs] = useState<number[][]>([]);
    const [kosarajuSteps, setKosarajuSteps] = useState<KosarajuStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECCA7', '#FF8A80'];

    // Kosaraju's Algorithm Implementation
    const kosarajuSCC = (): { sccs: number[][], steps: KosarajuStep[] } => {
        const n = graph.nodes.length;
        const adj: number[][] = Array(n).fill(null).map(() => []);
        const transpose: number[][] = Array(n).fill(null).map(() => []);

        // Build adjacency lists
        graph.edges.forEach(edge => {
            adj[edge.from].push(edge.to);
            transpose[edge.to].push(edge.from);
        });

        const visited = Array(n).fill(false);
        const finishOrder: number[] = [];
        const steps: KosarajuStep[] = [];

        // Step 1: DFS on original graph
        const dfs1 = (v: number, path: number[] = []) => {
            visited[v] = true;
            path.push(v);

            steps.push({
                phase: 'dfs1',
                action: 'visit',
                vertex: v,
                visited: [...visited],
                path: [...path],
                message: `DFS1: Visiting vertex ${v}`
            });

            for (const neighbor of adj[v]) {
                if (!visited[neighbor]) {
                    dfs1(neighbor, [...path]);
                }
            }

            finishOrder.push(v);
            steps.push({
                phase: 'dfs1',
                action: 'finish',
                vertex: v,
                visited: [...visited],
                finishOrder: [...finishOrder],
                message: `DFS1: Finished vertex ${v}, adding to finish order`
            });
        };

        // Execute first DFS
        for (let i = 0; i < n; i++) {
            if (!visited[i]) {
                dfs1(i);
            }
        }

        steps.push({
            phase: 'transpose',
            finishOrder: [...finishOrder],
            message: `Phase 1 complete. Finish order: [${finishOrder.join(', ')}]. Now reversing graph...`
        });

        // Step 2: DFS on transpose graph
        visited.fill(false);
        const sccs: number[][] = [];

        const dfs2 = (v: number, currentSCC: number[]) => {
            visited[v] = true;
            currentSCC.push(v);

            steps.push({
                phase: 'dfs2',
                action: 'visit',
                vertex: v,
                visited: [...visited],
                currentSCC: [...currentSCC],
                sccs: sccs.map(scc => [...scc]),
                message: `DFS2: Adding vertex ${v} to current SCC`
            });

            for (const neighbor of transpose[v]) {
                if (!visited[neighbor]) {
                    dfs2(neighbor, currentSCC);
                }
            }
        };

        // Process vertices in reverse finish order
        while (finishOrder.length > 0) {
            const v = finishOrder.pop();
            if (v !== undefined && !visited[v]) {
                const currentSCC: number[] = [];

                steps.push({
                    phase: 'dfs2',
                    action: 'start_scc',
                    vertex: v,
                    message: `Starting new SCC from vertex ${v}`
                });

                dfs2(v, currentSCC);
                sccs.push(currentSCC);

                steps.push({
                    phase: 'dfs2',
                    action: 'complete_scc',
                    scc: [...currentSCC],
                    sccs: sccs.map(scc => [...scc]),
                    message: `SCC complete: [${currentSCC.join(', ')}]`
                });
            }
        }

        return { sccs, steps };
    };

    // Simple SCC finding (for comparison)
    const findSCCsSimple = (): number[][] => {
        const n = graph.nodes.length;
        const adj: number[][] = Array(n).fill(null).map(() => []);

        graph.edges.forEach(edge => {
            adj[edge.from].push(edge.to);
        });

        const canReach = (start: number, target: number): boolean => {
            const visited = Array(n).fill(false);
            const stack: number[] = [start];

            while (stack.length > 0) {
                const current = stack.pop();
                if (current === undefined) continue;
                if (current === target) return true;
                if (visited[current]) continue;

                visited[current] = true;
                stack.push(...adj[current]);
            }
            return false;
        };

        const sccs: number[][] = [];
        const assigned = Array(n).fill(false);

        for (let i = 0; i < n; i++) {
            if (assigned[i]) continue;

            const scc: number[] = [i];
            assigned[i] = true;

            for (let j = i + 1; j < n; j++) {
                if (!assigned[j] && canReach(i, j) && canReach(j, i)) {
                    scc.push(j);
                    assigned[j] = true;
                }
            }

            sccs.push(scc);
        }

        return sccs;
    };

    useEffect(() => {
        if (algorithm === 'kosaraju') {
            const result = kosarajuSCC();
            setSCCs(result.sccs);
            setKosarajuSteps(result.steps);
        } else {
            const result = findSCCsSimple();
            setSCCs(result);
            setKosarajuSteps([]);
        }
        setCurrentStep(0);
        setIsAnimating(false);
    }, [graph, algorithm]);

    const addEdge = (from: number, to: number) => {
        const edgeExists = graph.edges.some(edge => edge.from === from && edge.to === to);
        if (!edgeExists && from !== to) {
            setGraph(prev => ({
                ...prev,
                edges: [...prev.edges, { from, to }]
            }));
        }
    };

    const removeEdge = (from: number, to: number) => {
        setGraph(prev => ({
            ...prev,
            edges: prev.edges.filter(edge => !(edge.from === from && edge.to === to))
        }));
    };

    const getNodeColor = (nodeId: number): string => {
        if (algorithm === 'kosaraju' && isAnimating && kosarajuSteps[currentStep]) {
            const step = kosarajuSteps[currentStep];
            if (step.vertex === nodeId) {
                return '#FFD700'; // Gold for current vertex
            }
            if (step.visited && step.visited[nodeId]) {
                return '#90EE90'; // Light green for visited
            }
        }

        const sccIndex = sccs.findIndex(scc => scc.includes(nodeId));
        return sccIndex !== -1 ? colors[sccIndex % colors.length] : '#DDD';
    };

    const getEdgeColor = (edge: Edge): string => {
        if (algorithm === 'kosaraju' && isAnimating && kosarajuSteps[currentStep]) {
            const step = kosarajuSteps[currentStep];
            if (step.phase === 'transpose') {
                return '#999'; // Gray during transpose phase
            }
        }

        const fromSCC = sccs.findIndex(scc => scc.includes(edge.from));
        const toSCC = sccs.findIndex(scc => scc.includes(edge.to));

        if (fromSCC === toSCC && fromSCC !== -1) {
            return colors[fromSCC % colors.length];
        }

        return '#666';
    };

    const startAnimation = () => {
        if (algorithm === 'kosaraju' && kosarajuSteps.length > 0) {
            setIsAnimating(true);
            setCurrentStep(0);
        }
    };

    const nextStep = () => {
        if (currentStep < kosarajuSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsAnimating(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const resetAnimation = () => {
        setCurrentStep(0);
        setIsAnimating(false);
    };

    // Predefined examples
    const examples: Record<string, Graph> = {
        simple: {
            nodes: [
                { id: 0, x: 100, y: 100, label: '0' },
                { id: 1, x: 200, y: 100, label: '1' },
                { id: 2, x: 150, y: 200, label: '2' }
            ],
            edges: [
                { from: 0, to: 1 },
                { from: 1, to: 2 },
                { from: 2, to: 0 }
            ]
        },
        multiple: {
            nodes: [
                { id: 0, x: 100, y: 100, label: '0' },
                { id: 1, x: 200, y: 100, label: '1' },
                { id: 2, x: 100, y: 200, label: '2' },
                { id: 3, x: 350, y: 100, label: '3' },
                { id: 4, x: 450, y: 100, label: '4' },
                { id: 5, x: 400, y: 200, label: '5' }
            ],
            edges: [
                { from: 0, to: 1 },
                { from: 1, to: 2 },
                { from: 2, to: 0 },
                { from: 3, to: 4 },
                { from: 4, to: 5 },
                { from: 5, to: 3 },
                { from: 1, to: 3 }
            ]
        },
        complex: {
            nodes: [
                { id: 0, x: 100, y: 100, label: '0' },
                { id: 1, x: 200, y: 100, label: '1' },
                { id: 2, x: 300, y: 100, label: '2' },
                { id: 3, x: 400, y: 100, label: '3' },
                { id: 4, x: 150, y: 200, label: '4' },
                { id: 5, x: 250, y: 200, label: '5' }
            ],
            edges: [
                { from: 0, to: 1 },
                { from: 1, to: 2 },
                { from: 2, to: 0 },
                { from: 1, to: 4 },
                { from: 4, to: 5 },
                { from: 5, to: 1 },
                { from: 2, to: 3 }
            ]
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Strongly Connected Components (SCC) Demo
            </h2>

            {/* Algorithm Selector */}
            <div className="mb-6">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setAlgorithm('kosaraju')}
                        className={`px-4 py-2 rounded-lg font-medium ${algorithm === 'kosaraju'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Kosaraju's Algorithm
                    </button>
                    <button
                        onClick={() => setAlgorithm('simple')}
                        className={`px-4 py-2 rounded-lg font-medium ${algorithm === 'simple'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Simple Method
                    </button>
                </div>

                {/* Example Graphs */}
                <div className="flex gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-600 mr-2">Examples:</span>
                    {Object.entries(examples).map(([key, example]) => (
                        <button
                            key={key}
                            onClick={() => setGraph(example)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graph Visualization */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Directed Graph</h3>
                    <svg width="500" height="300" className="border border-gray-300 bg-white rounded">
                        {/* Edges with arrowheads */}
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#666"
                                />
                            </marker>
                        </defs>

                        {graph.edges.map((edge, index) => {
                            const fromNode = graph.nodes.find(n => n.id === edge.from);
                            const toNode = graph.nodes.find(n => n.id === edge.to);

                            if (!fromNode || !toNode) return null;

                            // Calculate edge position to avoid overlap with nodes
                            const dx = toNode.x - fromNode.x;
                            const dy = toNode.y - fromNode.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const unitX = dx / length;
                            const unitY = dy / length;

                            const startX = fromNode.x + unitX * 25;
                            const startY = fromNode.y + unitY * 25;
                            const endX = toNode.x - unitX * 25;
                            const endY = toNode.y - unitY * 25;

                            return (
                                <line
                                    key={index}
                                    x1={startX}
                                    y1={startY}
                                    x2={endX}
                                    y2={endY}
                                    stroke={getEdgeColor(edge)}
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                    className="cursor-pointer hover:stroke-red-500"
                                    onClick={() => removeEdge(edge.from, edge.to)}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {graph.nodes.map(node => (
                            <g key={node.id}>
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r="20"
                                    fill={getNodeColor(node.id)}
                                    stroke="#333"
                                    strokeWidth="2"
                                    className="cursor-pointer"
                                />
                                <text
                                    x={node.x}
                                    y={node.y + 5}
                                    textAnchor="middle"
                                    className="text-sm font-bold fill-black pointer-events-none"
                                >
                                    {node.label}
                                </text>
                            </g>
                        ))}
                    </svg>

                    {/* Edge Controls */}
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Add directed edges (click edges to remove):
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                            {graph.nodes.map(fromNode =>
                                graph.nodes.map(toNode => {
                                    if (fromNode.id === toNode.id) return null;
                                    const edgeExists = graph.edges.some(edge =>
                                        edge.from === fromNode.id && edge.to === toNode.id
                                    );

                                    return (
                                        <button
                                            key={`${fromNode.id}-${toNode.id}`}
                                            onClick={() => addEdge(fromNode.id, toNode.id)}
                                            disabled={edgeExists}
                                            className={`px-2 py-1 text-xs rounded ${edgeExists
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                                }`}
                                        >
                                            {fromNode.id}→{toNode.id}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Analysis Panel */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">SCC Analysis</h3>

                    {/* Results */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-lg">Strongly Connected Components:</h4>
                        <p className="text-sm text-gray-600 mb-2">
                            Total SCCs: <span className="font-bold">{sccs.length}</span>
                        </p>

                        {sccs.map((scc, index) => (
                            <div key={index} className="mb-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    ></div>
                                    <span className="font-medium">SCC {index + 1}:</span>
                                    <span>[{scc.join(', ')}]</span>
                                    <span className="text-gray-500">({scc.length} nodes)</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Kosaraju Animation Controls */}
                    {algorithm === 'kosaraju' && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-lg mb-2">Kosaraju's Algorithm Steps</h4>

                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={startAnimation}
                                    disabled={isAnimating}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                                >
                                    Start Animation
                                </button>

                                <button
                                    onClick={prevStep}
                                    disabled={!isAnimating || currentStep === 0}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={nextStep}
                                    disabled={!isAnimating || currentStep >= kosarajuSteps.length - 1}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    Next
                                </button>

                                <button
                                    onClick={resetAnimation}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Reset
                                </button>
                            </div>

                            {isAnimating && currentStep < kosarajuSteps.length && (
                                <div className="bg-white p-3 rounded border">
                                    <p className="text-sm">
                                        <span className="font-bold">Step {currentStep + 1}:</span>{' '}
                                        {kosarajuSteps[currentStep].message}
                                    </p>

                                    {kosarajuSteps[currentStep].phase && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            <p><strong>Phase:</strong> {kosarajuSteps[currentStep].phase === 'dfs1' ? 'First DFS (Original Graph)' :
                                                kosarajuSteps[currentStep].phase === 'transpose' ? 'Graph Transpose' :
                                                    'Second DFS (Transpose Graph)'}</p>
                                            {kosarajuSteps[currentStep].finishOrder && (
                                                <p><strong>Finish Order:</strong> [{kosarajuSteps[currentStep].finishOrder!.join(', ')}]</p>
                                            )}
                                            {kosarajuSteps[currentStep].currentSCC && (
                                                <p><strong>Current SCC:</strong> [{kosarajuSteps[currentStep].currentSCC!.join(', ')}]</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isAnimating && (
                                <div className="text-sm text-gray-600">
                                    <p>Click "Start Animation" to see how Kosaraju's algorithm finds SCCs step by step.</p>
                                    <p className="mt-2">
                                        <strong>Legend:</strong>
                                        <br />• Gray nodes: Unvisited
                                        <br />• Gold node: Currently processing
                                        <br />• Light green: Visited in current phase
                                        <br />• Colored nodes: Assigned to SCCs
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {algorithm === 'simple' && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-lg mb-2">Simple Method</h4>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>For each pair of vertices (u,v), check if:</p>
                                <ul className="list-disc list-inside ml-4">
                                    <li>u can reach v (using DFS/BFS)</li>
                                    <li>v can reach u (using DFS/BFS)</li>
                                </ul>
                                <p>If both conditions are true, u and v are in the same SCC.</p>
                                <p className="text-red-600 font-medium">
                                    Time Complexity: O(V²(V+E)) - Much slower than Kosaraju's O(V+E)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Algorithm Explanation */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">How Kosaraju's Algorithm Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2">Phase 1: First DFS</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Perform DFS on original graph</li>
                            <li>Record finish times for each vertex</li>
                            <li>Vertices finished later are "exits" from SCCs</li>
                            <li>This gives us the order to process SCCs</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Phase 2: Graph Transpose</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Reverse all edge directions</li>
                            <li>This preserves SCCs but reverses dependencies</li>
                            <li>SCCs remain the same in transposed graph</li>
                            <li>But the "exit order" becomes "entry order"</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Phase 3: Second DFS</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Process vertices in reverse finish order</li>
                            <li>Each DFS tree found is one SCC</li>
                            <li>Starting from "exits" ensures we find complete SCCs</li>
                            <li>Time complexity: O(V + E)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Applications */}
            <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Real-World Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2">Deadlock Detection</h4>
                        <p>In operating systems, processes waiting for resources form a directed graph. SCCs with more than one vertex indicate deadlocks.</p>

                        <h4 className="font-semibold mb-2 mt-3">Web Page Analysis</h4>
                        <p>Web pages that link to each other form SCCs, representing communities or related content clusters.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Social Networks</h4>
                        <p>People who mutually follow each other (directly or indirectly) form strongly connected groups with mutual influence.</p>

                        <h4 className="font-semibold mb-2 mt-3">Circuit Analysis</h4>
                        <p>Electronic circuits with feedback loops can be analyzed using SCCs to identify oscillatory or unstable behavior.</p>
                    </div>
                </div>
            </div>

            {/* Key Properties */}
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Key Properties of SCCs</h3>
                <div className="text-sm space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold">Mutual Reachability</h4>
                            <p>Every vertex in an SCC can reach every other vertex in the same SCC through directed paths.</p>

                            <h4 className="font-semibold mt-3">Maximality</h4>
                            <p>Cannot add more vertices to an SCC while maintaining strong connectivity.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Condensation Graph is DAG</h4>
                            <p>When SCCs are collapsed into single nodes, the resulting graph has no cycles.</p>

                            <h4 className="font-semibold mt-3">Partition Property</h4>
                            <p>SCCs partition the vertex set - each vertex belongs to exactly one SCC.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SCCDemo;