import React from 'react';
import { useGraph } from './hooks/useGraph';
import type { GraphConfig, GraphNode, GraphEdge } from './hooks/useGraph';

interface GraphProps extends React.HTMLAttributes<HTMLDivElement> {
    nodes: GraphNode[];
    edges: GraphEdge[];
    directed?: boolean;
    width?: number;
    height?: number;
    highlightPath?: string[];
    config?: GraphConfig;
    onNodeClick?: (node: GraphNode) => void;
    onEdgeClick?: (edge: GraphEdge) => void;
    onSelfLoopClick?: (node: GraphNode) => void;
}

const Graph: React.FC<GraphProps> = ({
    nodes,
    edges,
    directed = false,
    width = 800,
    height = 600,
    highlightPath = [],
    config,
    onNodeClick,
    onEdgeClick,
    onSelfLoopClick,
    ...props
}) => {
    const {
        config: mergedConfig,
        regularEdges,
        selfLoops,
        getEdgePath,
        getSelfLoopPath,
        getEdgeCenter,
        isHighlighted,
        getNodeColors,
    } = useGraph({
        nodes,
        edges,
        directed,
        highlightPath,
        config,
    });

    const { colors } = mergedConfig;

    return (
        <div className="w-full h-full" {...props}>
            <svg
                width={width}
                height={height}
                style={{
                    border: `1px solid ${colors.svgBorderColor}`,
                    backgroundColor: colors.svgBackgroundColor
                }}
            >
                {/* Arrow markers for directed graphs */}
                {directed && (
                    <defs>
                        <marker
                            id="arrow"
                            viewBox="0 -5 10 10"
                            refX={10}
                            refY={0}
                            markerWidth={mergedConfig.arrowSize}
                            markerHeight={mergedConfig.arrowSize}
                            orient="auto"
                        >
                            <path d="M0,-5L10,0L0,5" fill={colors.arrowColor} />
                        </marker>
                        <marker
                            id="arrow-highlight"
                            viewBox="0 -5 10 10"
                            refX={10}
                            refY={0}
                            markerWidth={mergedConfig.arrowSize}
                            markerHeight={mergedConfig.arrowSize}
                            orient="auto"
                        >
                            <path d="M0,-5L10,0L0,5" fill={colors.arrowHighlightColor} />
                        </marker>
                    </defs>
                )}

                {/* Regular edges */}
                {regularEdges.map(edge => {
                    const highlighted = isHighlighted(edge.source, edge.target);
                    const center = getEdgeCenter(edge);

                    return (
                        <g key={edge.id}>
                            <path
                                d={getEdgePath(edge)}
                                stroke={highlighted ? colors.edgeHighlightColor : (edge.color || colors.edgeColor)}
                                strokeWidth={highlighted ? mergedConfig.highlightEdgeWidth! : mergedConfig.edgeWidth!}
                                fill="none"
                                markerEnd={directed ? (highlighted ? "url(#arrow-highlight)" : "url(#arrow)") : ""}
                                style={{ cursor: "pointer" }}
                                onClick={() => onEdgeClick?.(edge)}
                            />

                            {/* Edge weight/label */}
                            {(mergedConfig.showEdgeWeights || mergedConfig.showEdgeLabels) && (edge.weight || edge.label) && (
                                <g>
                                    <rect
                                        x={center.x - 15}
                                        y={center.y - 12}
                                        width={30}
                                        height={20}
                                        rx={5}
                                        ry={5}
                                        fill={edge.bgColor || colors.edgeLabelBackgroundColor}
                                        stroke={edge.strokeColor || colors.edgeLabelStrokeColor}
                                        strokeWidth={1}
                                    />
                                    <text
                                        x={center.x}
                                        y={center.y + 3}
                                        textAnchor="middle"
                                        fontSize={`${mergedConfig.weightFontSize}px`}
                                        fill={edge.color || colors.edgeLabelTextColor}
                                        pointerEvents="none"
                                    >
                                        {edge.weight?.toString() || edge.label}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}

                {/* Self-loops */}
                {selfLoops.map(edge => {
                    const highlighted = isHighlighted(edge.source);
                    return (
                        <path
                            key={edge.id}
                            d={getSelfLoopPath(edge.source)}
                            stroke={highlighted ? colors.selfLoopHighlightColor : (edge.color || colors.selfLoopColor)}
                            strokeWidth={highlighted ? mergedConfig.highlightEdgeWidth! : mergedConfig.edgeWidth!}
                            fill="none"
                            markerEnd={directed ? (highlighted ? "url(#arrow-highlight)" : "url(#arrow)") : ""}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                const node = nodes.find(n => n.id === edge.source);
                                if (node) onSelfLoopClick?.(node);
                            }}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                    const highlighted = highlightPath.includes(node.id);
                    const { nodeBgColor, nodeTextColor, nodeStrokeColor } = getNodeColors(node, highlighted);

                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={mergedConfig.nodeRadius!}
                                fill={nodeBgColor}
                                stroke={nodeStrokeColor}
                                strokeWidth={2}
                                style={{ cursor: "pointer" }}
                                onClick={() => onNodeClick?.(node)}
                            />

                            {/* Node label */}
                            <text
                                x={node.x}
                                y={node.y + 4}
                                textAnchor="middle"
                                fontSize={`${mergedConfig.labelFontSize}px`}
                                fill={nodeTextColor}
                                pointerEvents="none"
                            >
                                {node.label}
                            </text>

                            {/* Node weight */}
                            {mergedConfig.showNodeWeights && node.weight && (
                                <text
                                    x={node.x}
                                    y={node.y - mergedConfig.nodeRadius! - 5}
                                    textAnchor="middle"
                                    fontSize={`${mergedConfig.weightFontSize}px`}
                                    fill="#666"
                                    pointerEvents="none"
                                >
                                    w:{node.weight}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default Graph;