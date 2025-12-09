
export interface IRecursiveCall {
    id: string; // id of the call
    functionName: string; // name of the function
    args: string | unknown[]; // arguments of the call
    parentId?: string; // parent id of the call 
    depth: number; // depth of the call
    callStep: number; // call step
    returnStep?: number; // return step
    returnValue?: unknown; // return value of the call
}

export interface IRecursiveVisualizerProps {
    calls: IRecursiveCall[]; // calls of the recursive visualizer
    width?: number | string; // width of the recursive visualizer   
    height?: number | string; // height of the recursive visualizer
    autoPlay?: boolean; // whether to auto play the recursive visualizer
    playSpeed?: number; // speed of the recursive visualizer
    title?: string; // title of the recursive visualizer
    containerClassName?: string; // class name of the container
    containerStyle?: React.CSSProperties; // style of the container
    showMiniMap?: boolean; // whether to show the mini map
    edgeType?: 'straight' | 'smoothstep' | 'default' | 'simplebezier'; // type of the edge
    horizontalSpacing?: number; // horizontal spacing between nodes
    verticalSpacing?: number; // vertical spacing between nodes
    nodeWidth?: number; // width of the node
    nodeHeight?: number; // height of the node
    controlPosition?: 'bottom-left' | 'bottom-center' | 'bottom-right'; // position of the control
}