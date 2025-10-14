import React, { useState } from 'react';
import MemoryVisualizer from './MemoryVisualizer';

interface MemoryCell {
    address: string;
    value: string | number | null;
    type: 'stack' | 'heap' | 'global' | 'code';
    variable?: string;
    size: number;
    allocated: boolean;
    highlighted?: boolean;
    referenced?: boolean;
}

const MemoryExample: React.FC = () => {
    const [mode, setMode] = useState<'simple' | 'complex' | 'leak' | 'fragmentation'>('simple');
    const [, setHighlightedCells] = useState<MemoryCell[]>([]);

    // Simple memory layout example
    const simpleMemoryData: MemoryCell[] = [
        // Stack variables
        { address: '0x1000', value: 42, type: 'stack', variable: 'x', size: 4, allocated: true },
        { address: '0x1004', value: 3.14, type: 'stack', variable: 'pi', size: 8, allocated: true },
        { address: '0x100C', value: 'Hello', type: 'stack', variable: 'str', size: 6, allocated: true },
        { address: '0x1012', value: null, type: 'stack', variable: 'ptr', size: 8, allocated: true },
        
        // Heap allocations
        { address: '0x2000', value: 100, type: 'heap', variable: 'arr[0]', size: 4, allocated: true },
        { address: '0x2004', value: 200, type: 'heap', variable: 'arr[1]', size: 4, allocated: true },
        { address: '0x2008', value: 300, type: 'heap', variable: 'arr[2]', size: 4, allocated: true },
        { address: '0x200C', value: null, type: 'heap', size: 4, allocated: false },
        
        // Global variables
        { address: '0x3000', value: 0, type: 'global', variable: 'globalCounter', size: 4, allocated: true },
        { address: '0x3004', value: 'Global', type: 'global', variable: 'globalString', size: 7, allocated: true },
        
        // Code section
        { address: '0x4000', value: 'func1', type: 'code', variable: 'main()', size: 16, allocated: true },
        { address: '0x4010', value: 'func2', type: 'code', variable: 'helper()', size: 12, allocated: true },
    ];

    // Complex memory layout with references
    const complexMemoryData: MemoryCell[] = [
        // Stack with pointers
        { address: '0x1000', value: '0x2000', type: 'stack', variable: 'ptr1', size: 8, allocated: true, referenced: true },
        { address: '0x1008', value: '0x2008', type: 'stack', variable: 'ptr2', size: 8, allocated: true, referenced: true },
        { address: '0x1010', value: 42, type: 'stack', variable: 'value', size: 4, allocated: true },
        
        // Heap with complex structure
        { address: '0x2000', value: 10, type: 'heap', variable: 'node1.data', size: 4, allocated: true, highlighted: true },
        { address: '0x2004', value: '0x2008', type: 'heap', variable: 'node1.next', size: 8, allocated: true, referenced: true },
        { address: '0x2008', value: 20, type: 'heap', variable: 'node2.data', size: 4, allocated: true },
        { address: '0x200C', value: '0x2010', type: 'heap', variable: 'node2.next', size: 8, allocated: true, referenced: true },
        { address: '0x2010', value: 30, type: 'heap', variable: 'node3.data', size: 4, allocated: true },
        { address: '0x2014', value: null, type: 'heap', variable: 'node3.next', size: 8, allocated: true },
        
        // Global variables
        { address: '0x3000', value: '0x2000', type: 'global', variable: 'head', size: 8, allocated: true, referenced: true },
        { address: '0x3008', value: 3, type: 'global', variable: 'count', size: 4, allocated: true },
        
        // Code section
        { address: '0x4000', value: 'func1', type: 'code', variable: 'createNode()', size: 20, allocated: true },
        { address: '0x4014', value: 'func2', type: 'code', variable: 'traverse()', size: 16, allocated: true },
    ];

    // Memory leak example
    const leakMemoryData: MemoryCell[] = [
        // Stack variables
        { address: '0x1000', value: '0x2000', type: 'stack', variable: 'ptr1', size: 8, allocated: true, referenced: true },
        { address: '0x1008', value: '0x2008', type: 'stack', variable: 'ptr2', size: 8, allocated: true, referenced: true },
        { address: '0x1010', value: null, type: 'stack', variable: 'ptr1', size: 8, allocated: true }, // ptr1 reassigned
        
        // Leaked memory (no references)
        { address: '0x2000', value: 100, type: 'heap', variable: 'leaked1', size: 4, allocated: true, highlighted: true },
        { address: '0x2004', value: 200, type: 'heap', variable: 'leaked2', size: 4, allocated: true, highlighted: true },
        { address: '0x2008', value: 300, type: 'heap', variable: 'valid', size: 4, allocated: true },
        
        // More leaked memory
        { address: '0x200C', value: '0x2010', type: 'heap', variable: 'leaked_ptr', size: 8, allocated: true, highlighted: true },
        { address: '0x2010', value: 400, type: 'heap', variable: 'leaked_data', size: 4, allocated: true, highlighted: true },
        
        // Global variables
        { address: '0x3000', value: '0x2008', type: 'global', variable: 'valid_ptr', size: 8, allocated: true, referenced: true },
        
        // Code section
        { address: '0x4000', value: 'func1', type: 'code', variable: 'allocate()', size: 16, allocated: true },
        { address: '0x4010', value: 'func2', type: 'code', variable: 'forget()', size: 12, allocated: true },
    ];

    // Memory fragmentation example
    const fragmentationMemoryData: MemoryCell[] = [
        // Stack variables
        { address: '0x1000', value: '0x2000', type: 'stack', variable: 'ptr1', size: 8, allocated: true, referenced: true },
        { address: '0x1008', value: '0x2008', type: 'stack', variable: 'ptr2', size: 8, allocated: true, referenced: true },
        { address: '0x1010', value: '0x2010', type: 'stack', variable: 'ptr3', size: 8, allocated: true, referenced: true },
        
        // Fragmented heap
        { address: '0x2000', value: 100, type: 'heap', variable: 'block1', size: 4, allocated: true },
        { address: '0x2004', value: null, type: 'heap', size: 4, allocated: false }, // Free space
        { address: '0x2008', value: 200, type: 'heap', variable: 'block2', size: 4, allocated: true },
        { address: '0x200C', value: null, type: 'heap', size: 4, allocated: false }, // Free space
        { address: '0x2010', value: 300, type: 'heap', variable: 'block3', size: 4, allocated: true },
        { address: '0x2014', value: null, type: 'heap', size: 4, allocated: false }, // Free space
        { address: '0x2018', value: 400, type: 'heap', variable: 'block4', size: 4, allocated: true },
        { address: '0x201C', value: null, type: 'heap', size: 4, allocated: false }, // Free space
        
        // Global variables
        { address: '0x3000', value: 4, type: 'global', variable: 'allocated_blocks', size: 4, allocated: true },
        { address: '0x3004', value: 4, type: 'global', variable: 'free_blocks', size: 4, allocated: true },
        
        // Code section
        { address: '0x4000', value: 'func1', type: 'code', variable: 'allocate()', size: 16, allocated: true },
        { address: '0x4010', value: 'func2', type: 'code', variable: 'free()', size: 12, allocated: true },
    ];

    const getMemoryDataForMode = (): MemoryCell[] => {
        switch (mode) {
            case 'complex': return complexMemoryData;
            case 'leak': return leakMemoryData;
            case 'fragmentation': return fragmentationMemoryData;
            default: return simpleMemoryData;
        }
    };

    const getTitleForMode = (): string => {
        switch (mode) {
            case 'complex': return 'Complex Memory Layout (Linked List)';
            case 'leak': return 'Memory Leak Detection';
            case 'fragmentation': return 'Memory Fragmentation';
            default: return 'Simple Memory Layout';
        }
    };

    const handleCellClick = (cell: MemoryCell) => {
        console.log('Memory cell clicked:', cell);
        setHighlightedCells([cell]);
    };

    const clearHighlights = () => {
        setHighlightedCells([]);
    };

    const memoryData = getMemoryDataForMode();

    return (
        <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                    {(['simple', 'complex', 'leak', 'fragmentation'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setMode(type);
                                clearHighlights();
                            }}
                            className={`px-4 py-2 rounded capitalize ${mode === type ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {type === 'simple' ? 'Simple' : 
                             type === 'complex' ? 'Linked List' : 
                             type === 'leak' ? 'Memory Leak' : 'Fragmentation'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={clearHighlights}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear Highlights
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-600">
                <p>• Click memory cells to highlight • Zoom and resize with controls • Colors indicate memory type and status</p>
                {mode === 'leak' && (
                    <p className="text-red-600">⚠️ Red highlighted cells show memory leaks (allocated but not referenced)</p>
                )}
                {mode === 'fragmentation' && (
                    <p className="text-orange-600">⚠️ Gray cells show free memory fragments</p>
                )}
            </div>

            <div className="h-96 border border-gray-300">
                <MemoryVisualizer
                    memoryData={memoryData}
                    width={800}
                    height={400}
                    cellWidth={80}
                    cellHeight={40}
                    showAddresses={true}
                    showTypes={true}
                    showReferences={true}
                    onCellClick={handleCellClick}
                    title={getTitleForMode()}
                />
            </div>

            <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Memory Layout Explanation:</h3>
                <ul className="text-sm space-y-1">
                    <li><span className="font-mono bg-green-100 px-1">Stack</span> - Local variables, function parameters</li>
                    <li><span className="font-mono bg-red-100 px-1">Heap</span> - Dynamically allocated memory</li>
                    <li><span className="font-mono bg-blue-100 px-1">Global</span> - Global variables and constants</li>
                    <li><span className="font-mono bg-yellow-100 px-1">Code</span> - Program instructions and functions</li>
                    <li><span className="font-mono bg-yellow-200 px-1">Referenced</span> - Memory cells that are pointed to by pointers</li>
                </ul>
            </div>
        </div>
    );
};

export default MemoryExample; 