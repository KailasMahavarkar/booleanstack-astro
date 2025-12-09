import React, { useState } from 'react'
import GraphFlow from './Graph'
import { type IGraphNode, type IGraphEdge, type IGraphConfig } from './type';

// Sample graph data generators
const generateSimpleGraph = (): { nodes: IGraphNode[], edges: IGraphEdge[] } => ({
    nodes: [
        { id: 'A', label: 'A', x: 100, y: 100, weight: 5 },
        { id: 'B', label: 'B', x: 300, y: 100, weight: 3 },
        { id: 'C', label: 'C', x: 200, y: 250, weight: 7 },
        { id: 'D', label: 'D', x: 400, y: 250, weight: 2 },
    ],
    edges: [
        { id: 'e1', source: 'A', target: 'B', weight: 4, label: 'AB' },
        { id: 'e2', source: 'A', target: 'C', weight: 2, label: 'AC' },
        { id: 'e3', source: 'B', target: 'D', weight: 5, label: 'BD' },
        { id: 'e4', source: 'C', target: 'D', weight: 1, label: 'CD' },
        { id: 'e5', source: 'B', target: 'A', weight: 3, label: 'BA' }, // Bidirectional
    ]
})

const generateTreeGraph = (): { nodes: IGraphNode[], edges: IGraphEdge[] } => ({
    nodes: [
        { id: '1', label: 'Root', x: 300, y: 50, depth: 0, weight: 10 },
        { id: '2', label: 'L1', x: 150, y: 150, depth: 1, weight: 5 },
        { id: '3', label: 'R1', x: 450, y: 150, depth: 1, weight: 8 },
        { id: '4', label: 'L1.1', x: 75, y: 250, depth: 2, weight: 3 },
        { id: '5', label: 'L1.2', x: 225, y: 250, depth: 2, weight: 4 },
        { id: '6', label: 'R1.1', x: 375, y: 250, depth: 2, weight: 6 },
        { id: '7', label: 'R1.2', x: 525, y: 250, depth: 2, weight: 7 },
    ],
    edges: [
        { id: 't1', source: '1', target: '2' },
        { id: 't2', source: '1', target: '3' },
        { id: 't3', source: '2', target: '4' },
        { id: 't4', source: '2', target: '5' },
        { id: 't5', source: '3', target: '6' },
        { id: 't6', source: '3', target: '7' },
    ]
})

const generateNetworkGraph = (): { nodes: IGraphNode[], edges: IGraphEdge[] } => ({
    nodes: [
        { id: 'server', label: 'Server', x: 300, y: 50, shape: 'rect', bgColor: '#ef4444' },
        { id: 'db', label: 'Database', x: 300, y: 350, shape: 'diamond', bgColor: '#3b82f6' },
        { id: 'client1', label: 'Client 1', x: 100, y: 200, shape: 'circle', bgColor: '#10b981' },
        { id: 'client2', label: 'Client 2', x: 500, y: 200, shape: 'circle', bgColor: '#10b981' },
        { id: 'cache', label: 'Cache', x: 300, y: 200, shape: 'hexagon', bgColor: '#f59e0b' },
    ],
    edges: [
        { id: 'n1', source: 'client1', target: 'server', type: 'smoothstep', animated: true },
        { id: 'n2', source: 'client2', target: 'server', type: 'smoothstep', animated: true },
        { id: 'n3', source: 'server', target: 'cache', type: 'straight' },
        { id: 'n4', source: 'server', target: 'db', type: 'simplebezier' },
        { id: 'n5', source: 'cache', target: 'db', type: 'step' },
        { id: 'n6', source: 'cache', target: 'cache', label: 'refresh' }, // Self-loop
    ]
})

// Configuration presets
const presets: Record<string, IGraphConfig> = {
    default: {},

    darkMode: {
        colors: {
            nodeBackgroundColor: '#1f2937',
            nodeTextColor: '#f9fafb',
            nodeStrokeColor: '#4b5563',
            nodeHighlightBackgroundColor: '#fbbf24',
            nodeHighlightTextColor: '#111827',
            edgeColor: '#6b7280',
            edgeHighlightColor: '#fbbf24',
            backgroundColor: '#111827',
            backgroundPatternColor: '#374151',
            gridColor: '#374151',
            edgeLabelBackgroundColor: '#1f2937',
            edgeLabelTextColor: '#f9fafb',
        }
    },

    colorful: {
        colors: {
            nodeBackgroundColor: '#fef3c7',
            nodeTextColor: '#92400e',
            nodeStrokeColor: '#f59e0b',
            nodeHighlightBackgroundColor: '#dc2626',
            nodeHighlightTextColor: '#ffffff',
            edgeColor: '#8b5cf6',
            edgeHighlightColor: '#dc2626',
            backgroundColor: '#fef3c7',
            backgroundPatternColor: '#fed7aa',
            depthColorMap: {
                0: '#dc2626',
                1: '#f97316',
                2: '#facc15',
                3: '#84cc16',
                4: '#22c55e',
            }
        }
    },

    minimal: {
        nodeRadius: 25,
        nodeBorderWidth: 1,
        edgeWidth: 1,
        showNodeWeights: false,
        showEdgeWeights: false,
        showGrid: false,
        colors: {
            nodeBackgroundColor: '#ffffff',
            nodeTextColor: '#000000',
            nodeStrokeColor: '#000000',
            edgeColor: '#000000',
            backgroundColor: '#ffffff',
            backgroundPatternColor: '#f0f0f0',
        }
    },

    large: {
        nodeRadius: 40,
        nodeBorderWidth: 3,
        edgeWidth: 3,
        labelFontSize: 18,
        weightFontSize: 14,
        arrowSize: 25,
    },

    animated: {
        animated: true,
        edgeType: 'smoothstep',
        colors: {
            nodeBackgroundColor: '#e0e7ff',
            nodeStrokeColor: '#6366f1',
            edgeColor: '#6366f1',
            nodeHighlightBackgroundColor: '#6366f1',
            nodeHighlightTextColor: '#ffffff',
        }
    }
}

const GraphFlowExamples: React.FC = () => {
    const [selectedGraph, setSelectedGraph] = useState<'simple' | 'tree' | 'network'>('simple')
    const [selectedPreset, setSelectedPreset] = useState<string>('default')
    const [directed, setDirected] = useState(true)
    const [highlightPath, setHighlightPath] = useState<string[]>([])
    const [customConfig, setCustomConfig] = useState<IGraphConfig>({})

    // Node shape selector
    const [nodeShape, setNodeShape] = useState<'circle' | 'rect' | 'diamond' | 'hexagon'>('circle')
    const [edgeType, setEdgeType] = useState<'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier'>('simplebezier')

    // Display options
    const [showOptions, setShowOptions] = useState({
        showNodeWeights: true,
        showEdgeWeights: true,
        showGrid: true,
        showMiniMap: false,
        showControls: true,
    })

    // Get graph data
    const getGraphData = () => {
        switch (selectedGraph) {
            case 'tree':
                return generateTreeGraph()
            case 'network':
                return generateNetworkGraph()
            case 'simple':
            default:
                return generateSimpleGraph()
        }
    }

    const { nodes, edges } = getGraphData()

    // Build config
    const config: IGraphConfig = {
        ...presets[selectedPreset],
        ...customConfig,
        nodeShape,
        edgeType,
        ...showOptions
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        React Flow Graph Visualizer
                    </h1>
                    <p className="text-gray-600">
                        Fully configurable graph visualization with extensive customization options
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Graph Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Graph Type
                            </label>
                            <div className="flex gap-2">
                                {(['simple', 'tree', 'network'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedGraph(type)}
                                        className={`px-3 py-1 rounded capitalize ${selectedGraph === type
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preset */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color Preset
                            </label>
                            <select
                                value={selectedPreset}
                                onChange={(e) => setSelectedPreset(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {Object.keys(presets).map(preset => (
                                    <option key={preset} value={preset}>
                                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Direction */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Edge Direction
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDirected(true)}
                                    className={`px-3 py-1 rounded ${directed
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Directed
                                </button>
                                <button
                                    onClick={() => setDirected(false)}
                                    className={`px-3 py-1 rounded ${!directed
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Undirected
                                </button>
                            </div>
                        </div>

                        {/* Node Shape */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Node Shape
                            </label>
                            <select
                                value={nodeShape}
                                onChange={(e) => setNodeShape(e.target.value as 'circle' | 'rect' | 'diamond' | 'hexagon')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="circle">Circle</option>
                                <option value="rect">Rectangle</option>
                                <option value="diamond">Diamond</option>
                                <option value="hexagon">Hexagon</option>
                            </select>
                        </div>

                        {/* Edge Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Edge Type
                            </label>
                            <select
                                value={edgeType}
                                onChange={(e) => setEdgeType(e.target.value as 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="default">Default</option>
                                <option value="straight">Straight</option>
                                <option value="step">Step</option>
                                <option value="smoothstep">Smooth Step</option>
                                <option value="simplebezier">Simple Bezier</option>
                            </select>
                        </div>

                        {/* Highlight Path */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Highlight Path
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setHighlightPath([])}
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedGraph === 'simple') {
                                            setHighlightPath(['A', 'B', 'D'])
                                        } else if (selectedGraph === 'tree') {
                                            setHighlightPath(['1', '2', '4'])
                                        } else {
                                            setHighlightPath(['client1', 'server', 'db'])
                                        }
                                    }}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Sample Path
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Display Options</h3>
                        <div className="flex flex-wrap gap-4">
                            {Object.entries(showOptions).map(([key, value]) => (
                                <label key={key} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setShowOptions({
                                            ...showOptions,
                                            [key]: e.target.checked
                                        })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-600">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Graph Visualization */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Graph Visualization
                    </h2>
                    <GraphFlow
                        nodes={nodes}
                        edges={edges}
                        directed={directed}
                        width="100%"
                        height="600px"
                        highlightPath={highlightPath}
                        config={config}
                        onNodeClick={(node) => {
                            console.log('Node clicked:', node)
                            // Toggle highlight
                            if (highlightPath.includes(node.id)) {
                                setHighlightPath(highlightPath.filter(id => id !== node.id))
                            } else {
                                setHighlightPath([...highlightPath, node.id])
                            }
                        }}
                        onEdgeClick={(edge) => {
                            console.log('Edge clicked:', edge)
                        }}
                    />
                </div>

                {/* Custom Config Editor */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Custom Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Size Configuration</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-600">Node Radius</label>
                                    <input
                                        type="number"
                                        value={customConfig.nodeRadius || 30}
                                        onChange={(e) => setCustomConfig({
                                            ...customConfig,
                                            nodeRadius: parseInt(e.target.value)
                                        })}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-600">Edge Width</label>
                                    <input
                                        type="number"
                                        value={customConfig.edgeWidth || 2}
                                        onChange={(e) => setCustomConfig({
                                            ...customConfig,
                                            edgeWidth: parseInt(e.target.value)
                                        })}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-600">Font Size</label>
                                    <input
                                        type="number"
                                        value={customConfig.labelFontSize || 14}
                                        onChange={(e) => setCustomConfig({
                                            ...customConfig,
                                            labelFontSize: parseInt(e.target.value)
                                        })}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Interaction Options</h3>
                            <div className="space-y-2">
                                {['draggable', 'zoomable', 'pannable', 'selectable'].map(option => (
                                    <label key={option} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={customConfig[option as keyof IGraphConfig] !== false}
                                            onChange={(e) => setCustomConfig({
                                                ...customConfig,
                                                [option]: e.target.checked
                                            })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-600 capitalize">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Features</h3>
                    <div className="text-blue-800 space-y-2 text-sm">
                        <p>✅ <b>Fully Configurable:</b> Colors, sizes, shapes, fonts, and more</p>
                        <p>✅ <b>Multiple Node Shapes:</b> Circle, rectangle, diamond, hexagon</p>
                        <p>✅ <b>Multiple Edge Types:</b> Straight, step, smooth step, bezier curves</p>
                        <p>✅ <b>Self-loops Support:</b> Nodes can have edges to themselves</p>
                        <p>✅ <b>Bidirectional Edges:</b> Support for both directed and undirected graphs</p>
                        <p>✅ <b>Interactive:</b> Pan, zoom, drag nodes, click handlers</p>
                        <p>✅ <b>Weights & Labels:</b> Show weights on nodes and edges</p>
                        <p>✅ <b>Highlighting:</b> Highlight paths through the graph</p>
                        <p>✅ <b>Depth Coloring:</b> Color nodes based on depth in tree</p>
                        <p>✅ <b>Mini Map:</b> Optional minimap for navigation</p>
                        <p>✅ <b>Animations:</b> Animated edges option</p>
                        <p>✅ <b>Presets:</b> Dark mode, colorful, minimal, and more</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GraphFlowExamples