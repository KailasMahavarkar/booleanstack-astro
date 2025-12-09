export interface IMemoryCell {
    address: string; // address of the memory cell
    value: string | number | null; // value of the memory cell  
    type: "stack" | "heap" | "global" | "code"; // type of the memory cell
    variable?: string; // variable name
    size: number; // size of the memory cell
    allocated: boolean; // whether the memory cell is allocated
    highlighted?: boolean; // whether the memory cell is highlighted
    referenced?: boolean; // whether the memory cell is referenced
}

export interface IMemoryVisualizerProps {
    memoryData: IMemoryCell[]; // memory data of the memory visualizer
    width?: number | string; // width of the memory visualizer
    height?: number | string; // height of the memory visualizer
    cellWidth?: number; // width of the cell
    cellHeight?: number; // height of the cell
    showAddresses?: boolean; // whether to show the addresses
    showTypes?: boolean; // whether to show the types
    showReferences?: boolean; // whether to show the references
    onCellClick?: (cell: IMemoryCell) => void; // callback when a cell is clicked
    title?: string; // title of the memory visualizer
}