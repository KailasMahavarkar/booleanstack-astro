import { useMemo } from 'react';

export interface GraphConfig {
    nodeRadius?: number;
    edgeWidth?: number;
    highlightEdgeWidth?: number;
    arrowSize?: number;
    selfLoopRadius?: number;
    labelFontSize?: number;
    weightFontSize?: number;
    showNodeWeights?: boolean;
    showEdgeWeights?: boolean;
    showEdgeLabels?: boolean;
    colors?: {
        nodeBackgroundColor: string;
        nodeTextColor: string;
        nodeStrokeColor: string;
        nodeHighlightBackgroundColor: string;
        nodeHighlightTextColor: string;
        nodeHighlightStrokeColor: string;
        edgeColor: string;
        edgeHighlightColor: string;
        edgeLabelBackgroundColor: string;
        edgeLabelTextColor: string;
        edgeLabelStrokeColor: string;
        arrowColor: string;
        arrowHighlightColor: string;
        selfLoopColor: string;
        selfLoopHighlightColor: string;
        svgBackgroundColor: string;
        svgBorderColor: string;
        depthColorMap?: Record<number, string>;
    }
}

export interface GraphNode {
    id: string;
    label: string;
    x: number;
    y: number;
    weight?: number;
    color?: string;
    bgColor?: string;
    strokeColor?: string;
    depth?: number;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    weight?: number;
    color?: string;
    bgColor?: string;
    strokeColor?: string;
    label?: string;
}

const defaultColors: GraphConfig['colors'] = {
    nodeBackgroundColor: "#69b3a2",
    nodeTextColor: "#333",
    nodeStrokeColor: "#fff",
    nodeHighlightBackgroundColor: "#ff6b6b",
    nodeHighlightTextColor: "#fff",
    nodeHighlightStrokeColor: "#fff",
    edgeColor: "#666",
    edgeHighlightColor: "#ff6b6b",
    edgeLabelBackgroundColor: "white",
    edgeLabelTextColor: "#333",
    edgeLabelStrokeColor: "#666",
    arrowColor: "#666",
    arrowHighlightColor: "#ff6b6b",
    selfLoopColor: "#666",
    selfLoopHighlightColor: "#ff6b6b",
    svgBackgroundColor: "white",
    svgBorderColor: "#d1d5db",
    depthColorMap: {
        0: "#ef4444",
        1: "#3b82f6",
        2: "#10b981",
        3: "#f59e0b",
        4: "#8b5cf6",
    },
};

const defaultConfig: GraphConfig = {
    nodeRadius: 20,
    edgeWidth: 2,
    highlightEdgeWidth: 3,
    arrowSize: 6,
    selfLoopRadius: 30,
    labelFontSize: 12,
    weightFontSize: 10,
    showNodeWeights: true,
    showEdgeWeights: true,
    showEdgeLabels: true,
};

export interface UseGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    directed?: boolean;
    highlightPath?: string[];
    config?: GraphConfig;
}

export const useGraph = ({ 
    nodes, 
    edges, 
    directed = false, 
    highlightPath = [], 
    config = defaultConfig 
}: UseGraphProps) => {
    // Merge config with defaults
    const mergedConfig = useMemo(() => {
        const merged = { ...defaultConfig, ...config };
        const colors = { ...defaultColors, ...config?.colors };
        return { ...merged, colors };
    }, [config]);

    // Separate edges into regular and self-loops
    const { regularEdges, selfLoops } = useMemo(() => {
        const regular = edges.filter(e => e.source !== e.target);
        const selfLoops = edges.filter(e => e.source === e.target);
        return { regularEdges: regular, selfLoops };
    }, [edges]);

    // Calculate bidirectional offset for directed graphs
    const getBidirectionalOffset = useMemo(() => {
        return (edge: GraphEdge): number => {
            if (!directed) return 0;

            const reverse = regularEdges.find(e =>
                e.source === edge.target && e.target === edge.source
            );

            if (reverse) {
                return edge.source < edge.target ? 15 : -15;
            }
            return 0;
        };
    }, [directed, regularEdges]);

    // Calculate edge path
    const getEdgePath = useMemo(() => {
        return (edge: GraphEdge): string => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return '';

            const offset = getBidirectionalOffset(edge);
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = mergedConfig.nodeRadius!;

            const startX = sourceNode.x + (dx / distance) * radius;
            const startY = sourceNode.y + (dy / distance) * radius;
            const endX = targetNode.x - (dx / distance) * radius;
            const endY = targetNode.y - (dy / distance) * radius;

            if (offset === 0) {
                return `M ${startX} ${startY} L ${endX} ${endY}`;
            } else {
                const perpX = -dy / distance * offset;
                const perpY = dx / distance * offset;
                const midX = (startX + endX) / 2 + perpX;
                const midY = (startY + endY) / 2 + perpY;
                return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
            }
        };
    }, [nodes, getBidirectionalOffset, mergedConfig.nodeRadius]);

    // Calculate self-loop path
    const getSelfLoopPath = useMemo(() => {
        return (nodeId: string): string => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return '';

            const nodeRadius = mergedConfig.nodeRadius!;
            const loopRadius = mergedConfig.selfLoopRadius!;
            const startX = node.x;
            const startY = node.y - nodeRadius;
            const endX = startX + 0.1;
            const endY = startY;

            return `M ${startX} ${startY} A ${loopRadius} ${loopRadius} 0 1 1 ${endX} ${endY}`;
        };
    }, [nodes, mergedConfig.nodeRadius, mergedConfig.selfLoopRadius]);

    // Calculate edge center point
    const getEdgeCenter = useMemo(() => {
        return (edge: GraphEdge): { x: number; y: number } => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return { x: 0, y: 0 };

            const offset = getBidirectionalOffset(edge);

            if (offset === 0) {
                return {
                    x: (sourceNode.x + targetNode.x) / 2,
                    y: (sourceNode.y + targetNode.y) / 2
                };
            } else {
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const perpX = -dy / distance * offset;
                const perpY = dx / distance * offset;

                return {
                    x: (sourceNode.x + targetNode.x) / 2 + perpX * 0.5,
                    y: (sourceNode.y + targetNode.y) / 2 + perpY * 0.5
                };
            }
        };
    }, [nodes, getBidirectionalOffset]);

    // Check if node or edge is highlighted
    const isHighlighted = useMemo(() => {
        return (sourceId: string, targetId?: string): boolean => {
            if (!targetId) return highlightPath.includes(sourceId);

            const sourceIndex = highlightPath.indexOf(sourceId);
            const targetIndex = highlightPath.indexOf(targetId);

            return sourceIndex !== -1 && targetIndex !== -1 &&
                Math.abs(sourceIndex - targetIndex) === 1;
        };
    }, [highlightPath]);

    // Get node colors based on state and depth
    const getNodeColors = useMemo(() => {
        return (node: GraphNode, highlighted: boolean) => {
            const colors = mergedConfig.colors!;
            let nodeBgColor = highlighted ? colors.nodeHighlightBackgroundColor : (node.bgColor || colors.nodeBackgroundColor);
            const nodeTextColor = highlighted ? colors.nodeHighlightTextColor : (node.color || colors.nodeTextColor);
            const nodeStrokeColor = highlighted ? colors.nodeHighlightStrokeColor : (node.strokeColor || colors.nodeStrokeColor);

            // Apply depth-based coloring if available
            if (node.depth !== undefined && colors.depthColorMap && !highlighted) {
                const depthColorMap = colors.depthColorMap;
                const depthColorMapSize = Object.keys(depthColorMap).length;
                const depthColor = depthColorMap[node.depth % depthColorMapSize as keyof typeof depthColorMap];
                if (depthColor) {
                    nodeBgColor = depthColor;
                }
            }

            return { nodeBgColor, nodeTextColor, nodeStrokeColor };
        };
    }, [mergedConfig.colors]);

    return {
        config: mergedConfig,
        regularEdges,
        selfLoops,
        getBidirectionalOffset,
        getEdgePath,
        getSelfLoopPath,
        getEdgeCenter,
        isHighlighted,
        getNodeColors,
    };
};
