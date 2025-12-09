import {
    type Node,
    type Edge,
} from 'reactflow'

// Configuration interfaces
export interface IGraphConfig {
    // Node configuration
    nodeRadius?: number; // radius of the node
    nodeShape?: 'circle' | 'rect' | 'diamond' | 'hexagon'; // shape of the node
    nodeBorderWidth?: number; // width of the border of the node
    nodeCornerRadius?: number; // corner radius of the node for rect shape

    // Edge configuration
    edgeWidth?: number; // width of the edge
    highlightEdgeWidth?: number; // width of the highlighted edge
    edgeType?: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier'; // type of the edge
    arrowSize?: number; // size of the arrow
    selfLoopRadius?: number; // radius of the self loop
    animated?: boolean; // whether the edge is animated

    // Label configuration
    labelFontSize?: number; // font size of the label
    labelFontFamily?: string; // font family of the label
    labelFontWeight?: string | number; // font weight of the label
    weightFontSize?: number; // font size of the weight
    weightPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center'; // position of the weight

    // Display options
    showNodeWeights?: boolean; // whether to show the weights of the nodes
    showEdgeWeights?: boolean; // whether to show the weights of the edges
    showEdgeLabels?: boolean; // whether to show the labels of the edges
    showGrid?: boolean; // whether to show the grid
    showMiniMap?: boolean; // whether to show the mini map
    showControls?: boolean; // whether to show the controls

    // Colors
    colors?: {
        nodeBackgroundColor?: string; // background color of the node
        nodeTextColor?: string; // text color of the node
        nodeStrokeColor?: string; // stroke color of the node
        nodeHighlightBackgroundColor?: string
        nodeHighlightTextColor?: string; // text color of the highlighted node
        nodeHighlightStrokeColor?: string; // stroke color of the highlighted node
        nodeHoverBackgroundColor?: string
        nodeHoverStrokeColor?: string; // stroke color of the hovered node

        edgeColor?: string
        edgeHighlightColor?: string; // color of the highlighted edge       
        edgeHoverColor?: string; // color of the hovered edge   
        edgeLabelBackgroundColor?: string
        edgeLabelTextColor?: string; // text color of the label of the edge
        edgeLabelStrokeColor?: string; // stroke color of the label of the edge

        arrowColor?: string; // color of the arrow
        arrowHighlightColor?: string; // color of the highlighted arrow
        selfLoopColor?: string; // color of the self loop
        selfLoopHighlightColor?: string; // color of the highlighted self loop

        backgroundPatternColor?: string; // color of the background pattern
        backgroundColor?: string; // color of the background
        gridColor?: string; // color of the grid
        miniMapNodeColor?: string; // color of the node in the mini map
        miniMapMaskColor?: string; // color of the mask in the mini map

        depthColorMap?: Record<number, string>; // depth color map
    }

    // Layout options
    layoutDirection?: 'TB' | 'BT' | 'LR' | 'RL'; // direction of the layout
    nodeSpacing?: { x: number; y: number }; // spacing of the nodes
    rankSpacing?: number; // spacing of the ranks

    // Interaction options
    draggable?: boolean; // whether the nodes are draggable
    connectable?: boolean; // whether the edges are connectable
    deletable?: boolean; // whether the nodes are deletable
    zoomable?: boolean; // whether the graph is zoomable
    pannable?: boolean; // whether the graph is pannable
    selectable?: boolean; // whether the nodes are selectable
}

export interface IGraphNode {
    id: string; // id of the node   
    label: string; // label of the node
    x?: number; // x position of the node
    y?: number; // y position of the node
    weight?: number; // weight of the node
    color?: string; // color of the node
    bgColor?: string; // background color of the node
    strokeColor?: string; // stroke color of the node
    depth?: number; // depth of the node
    shape?: 'circle' | 'rect' | 'diamond' | 'hexagon'; // shape of the node
    size?: { width: number; height: number }; // size of the node
    data?: unknown; // data of the node
}

export interface IGraphEdge {
    id: string; // id of the edge   
    source: string; // source of the edge
    target: string; // target of the edge
    weight?: number; // weight of the edge
    color?: string; // color of the edge
    bgColor?: string; // background color of the edge
    strokeColor?: string; // stroke color of the edge
    label?: string; // label of the edge
    animated?: boolean; // whether the edge is animated
    type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier'; // type of the edge
    data?: unknown; // data of the edge
}

export interface IGraphFlowProps {
    nodes: IGraphNode[]; // nodes of the graph
    edges: IGraphEdge[]; // edges of the graph
    directed?: boolean; // whether the graph is directed
    width?: number | string; // width of the graph
    height?: number | string; // height of the graph    
    highlightPath?: string[]; // path of the highlighted nodes
    config?: IGraphConfig; // config of the graph
    onNodeClick?: (node: IGraphNode) => void; // callback when a node is clicked
    onEdgeClick?: (edge: IGraphEdge) => void; // callback when a edge is clicked        
    onNodesChange?: (nodes: Node[]) => void; // callback when the nodes are changed
    onEdgesChange?: (edges: Edge[]) => void; // callback when the edges are changed
    className?: string; // class name of the graph
    style?: React.CSSProperties; // style of the graph
}