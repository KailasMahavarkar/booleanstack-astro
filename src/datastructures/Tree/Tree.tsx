import { Plus } from "lucide-react";
import React from "react";
import { useState } from "react";

interface TreeNodeConfig {
    verticalSpacing?: number;
    horizontalSpacing?: number;
    expandable?: boolean;
    isFullyExpanded?: boolean;
    delta?: number;
    size?: number;
    expandableIconSize?: number;
    showExpandIcon?: boolean;
    showLevelColorWithOverride?: boolean;
    colors: {
        backgroundColor: string;
        textColor: string;
        expandableIconColor: string;
        expandableIconBackgroundColor: string;
        parentPathColor: string;
        leftChildPathColor: string;
        rightChildPathColor: string;
        leafBackgroundColor: string;
        leafTextColor: string;
        depthColorMap?: Record<number, string>;
    }
}

export interface TreeNodeData {
    value: number;
    children: TreeNodeData[];
    currentDepth?: number;
    xPosition?: number;
    yPosition?: number;
    isLeaf?: boolean;
    isPreviouslyExpanded?: boolean;
    highlightLeftChildPath?: boolean;
    highlightRightChildPath?: boolean;
    highLightParentPath?: boolean;
    visited?: boolean;
    config?: TreeNodeConfig,
}


// calculateSubtreeWidth: measures needed width to avoid overlap
function calculateSubtreeWidth(node: TreeNodeData, spacing: number, size: number): number {
    if (!node.children || node.children.length === 0) return size;
    const widths = node.children.map(child => calculateSubtreeWidth(child, spacing, size));
    return widths.reduce((sum, w) => sum + w, 0) + spacing * (widths.length - 1);
}

function getNodeClasses(isLeaf: boolean, config: TreeNodeData['config'], currentDepth: number) {
    if (!config) return "";
    const commonClasses = 'rounded-full flex justify-center items-center shadow-md cursor-pointer select-none';
    if (!config) return commonClasses;
    const bgClasses = isLeaf ? config.colors.leafBackgroundColor : config.colors.backgroundColor;
    const textClasses = config.colors.textColor;

    const colorMap: Record<number, string> = {
        0: "bg-red-600 hover:bg-red-700",
        1: "bg-blue-600 hover:bg-blue-700",
        2: "bg-green-600 hover:bg-green-700",
        3: "bg-pink-600 hover:bg-pink-700",
        4: "bg-yellow-600 hover:bg-yellow-700",
    }
    if (!config.showLevelColorWithOverride) return `${bgClasses} ${textClasses} ${commonClasses}`;

    const depthColorMap = config.colors.depthColorMap || colorMap;
    const depthColorMapSize = Object.keys(depthColorMap).length;
    const depthColorClasses = depthColorMap[currentDepth % depthColorMapSize];
    return `${depthColorClasses} ${commonClasses}`;
}



const TreeNode = ({
    value,
    children,
    currentDepth,
    xPosition = 0,
    yPosition = 0,
    isLeaf = false,
    isPreviouslyExpanded = false,
    highlightLeftChildPath = false,
    highlightRightChildPath = false,
    visited = false,
    config = {
        verticalSpacing: 120,
        horizontalSpacing: 120,
        delta: 0,
        expandable: true,
        isFullyExpanded: true,
        size: 60,
        expandableIconSize: 10,
        showExpandIcon: true,
        colors: {
            backgroundColor: "bg-red-600",
            textColor: "text-white",
            expandableIconColor: "text-black",
            expandableIconBackgroundColor: "bg-white",
            parentPathColor: "red",
            leftChildPathColor: "blue",
            rightChildPathColor: "green",
            leafBackgroundColor: "bg-green-600",
            leafTextColor: "text-white",
            depthColorMap: {
                0: "bg-red-600",
                1: "bg-blue-600",
                2: "bg-green-600",
                3: "bg-yellow-600",
                4: "bg-purple-600",
            },
        }
    },
}: TreeNodeData) => {
    const [isExpanded, setIsExpanded] = useState(isPreviouslyExpanded || (config.isFullyExpanded ?? true));
    const H_SPACING = config.horizontalSpacing!;
    const V_SPACING = config.verticalSpacing!;
    const NODE_SIZE = config.size!;
    // calculate widths for each child subtree
    const childWidths = children.map(child =>
        calculateSubtreeWidth(child, H_SPACING, NODE_SIZE)
    );

    const totalWidth = childWidths.reduce((sum, w) => sum + w, 0) + H_SPACING * (childWidths.length - 1);
    let currX = xPosition - totalWidth / 2;

    const positionedChildren: TreeNodeData[] = children.map((child, idx) => {
        const isSpecialCaseForLeft = children.length === 1 && children[0].children.length === 0;

        const w = childWidths[idx];
        const childX = currX + w / 2;
        currX += w + H_SPACING;
        return {
            ...child,
            config,
            xPosition: isSpecialCaseForLeft ? childX - H_SPACING + w : childX,
            yPosition: yPosition + V_SPACING,
            currentDepth: (currentDepth ?? 0) + 1,
            isLeaf: child.children.length === 0,
            isPreviouslyExpanded: child.isPreviouslyExpanded,
            highLightParentPath: child.highLightParentPath,
        };
    });


    const getExpandableStatus = (): boolean => {
        if (!config.isFullyExpanded && !config.expandable) return false;
        if (config.expandable && !isExpanded) return false;
        if (config.expandable && isExpanded) return true;
        return true;
    }

    const getExpandableIconStatus = (): boolean => {
        // if its fully expanded but not expandable then icon is hidden
        if (config.isFullyExpanded && !config.expandable) return false;

        // if its expandable and not expanded then icon is shown
        if (config.expandable && !isExpanded) return true;

        // if its expandable and expanded then icon is hidden
        if (config.expandable && isExpanded) return false;
        return false;
    }


    const handleNodeClick = () => {
        if (config.expandable) {
            setIsExpanded(prev => !prev);
        }
    }

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: `${yPosition}px`,
                    left: `${xPosition}px`,
                    transform: 'translate(-50%, -50%)',
                    width: `${config.size}px`,
                    height: `${config.size}px`,
                    border: visited ? '1px solid yellow' : 'none',
                }}
                className={getNodeClasses(isLeaf, config, currentDepth || 0)}
                onClick={handleNodeClick}
            >
                {value}
                {
                    config.showExpandIcon && getExpandableIconStatus() && !isLeaf && (
                        <>
                            <Plus
                                width={config.expandableIconSize ?? 10}
                                height={config.expandableIconSize ?? 10}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: (config.size ?? 60) / 2 - (config.expandableIconSize ?? 10) / 2,
                                    transform: 'translate(0, 50%)',
                                }}
                                className="border-[1px] border-black bg-white text-black rounded-full opacity-60"
                            />
                        </>
                    )
                }
            </div>

            {getExpandableStatus() && positionedChildren.length > 0 && positionedChildren.map((child, index) => {
                if (!child.xPosition) return null;

                let strokeColor = 'black';
                if (child.highLightParentPath) {
                    strokeColor = config.colors.parentPathColor;
                } else {
                    if (highlightLeftChildPath && index === 0) strokeColor = config.colors.leftChildPathColor;
                    if (highlightRightChildPath && index === positionedChildren.length - 1) strokeColor = config.colors.rightChildPathColor;
                }

                return (
                    <React.Fragment key={`${child.value}-${index}`}>
                        <svg
                            style={{
                                position: 'absolute',
                                overflow: 'visible',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: -1
                            }}
                        >
                            <line
                                x1={xPosition}
                                y1={yPosition}
                                x2={child.xPosition}
                                y2={child.yPosition}
                                stroke={strokeColor}
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <TreeNode
                            key={`${child.value}-${index}`}
                            {...child}
                        />
                    </React.Fragment>
                )
            })}
        </>
    );
};

export default TreeNode;