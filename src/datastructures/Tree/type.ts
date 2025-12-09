export interface TreeNodeConfig {
    verticalSpacing?: number; // vertical spacing between nodes
    horizontalSpacing?: number; // horizontal spacing between nodes
    expandable?: boolean; // whether the node is expandable
    isFullyExpanded?: boolean; // whether the node is fully expanded
    delta?: number; // delta value for the node
    size?: number; // size of the node
    expandableIconSize?: number; // size of the expandable icon
    showExpandIcon?: boolean; // whether to show the expand icon
    showLevelColorWithOverride?: boolean; // whether to show the level color with override
    colors: {
        backgroundColor: string; // background color of the node
        textColor: string; // text color of the node
        expandableIconColor: string;
        expandableIconBackgroundColor: string; // background color of the expandable icon
        parentPathColor: string;
        leftChildPathColor: string; // color of the left child path
        rightChildPathColor: string; // color of the right child path
        leafBackgroundColor: string
        leafTextColor: string; // text color of the leaf node
        depthColorMap?: Record<number, string>; // depth color map
        strokeColor?: string; // stroke color of the node
    }
}

export interface TreeNodeData {
    value: number; // value of the node
    children: TreeNodeData[]; // children of the node
    currentDepth?: number; // current depth of the node
    xPosition?: number; // x position of the node
    yPosition?: number; // y position of the node
    isLeaf?: boolean; // whether the node is a leaf node
    isPreviouslyExpanded?: boolean; // whether the node is previously expanded
    highlightLeftChildPath?: boolean; // whether to highlight the left child path
    highlightRightChildPath?: boolean; // whether to highlight the right child path
    highLightParentPath?: boolean; // whether to highlight the parent path
    visited?: boolean; // whether the node is visited
    config?: TreeNodeConfig; // config of the node
}
export type ZoomOrigin = 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'; // zoom origin

export interface TreeProps extends TreeNodeData {
    width?: number | string; // width of the tree
    height?: number | string; // height of the tree
    allowCanvas?: boolean; // whether to allow the canvas
    containerClassName?: string; // class name of the container
    containerStyle?: React.CSSProperties; // style of the container
    initialZoom?: number; // initial zoom percentage
    minZoom?: number; // minimum zoom percentage
    maxZoom?: number; // maximum zoom percentage
    zoomStep?: number; // zoom step
}
