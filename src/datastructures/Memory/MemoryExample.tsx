import React, { useState } from 'react'
import MemoryVisualizer from './MemoryVisualizer'
import  { type IMemoryCell } from './type'

const MemoryVisualizerExample: React.FC = () => {
    // Sample memory data
    const [memoryData, setMemoryData] = useState<IMemoryCell[]>([
        // Stack memory cells
        { address: '0x1000', value: 42, type: 'stack', variable: 'count', size: 4, allocated: true },
        { address: '0x1004', value: 3.14, type: 'stack', variable: 'pi', size: 8, allocated: true },
        { address: '0x100C', value: 100, type: 'stack', variable: 'temp', size: 4, allocated: true },
        { address: '0x1010', value: null, type: 'stack', size: 4, allocated: false },
        { address: '0x1014', value: -15, type: 'stack', variable: 'offset', size: 4, allocated: true, highlighted: true },

        // Heap memory cells
        { address: '0x2000', value: 'Hello', type: 'heap', variable: 'str1', size: 6, allocated: true },
        { address: '0x2006', value: 'World', type: 'heap', variable: 'str2', size: 6, allocated: true },
        { address: '0x200C', value: null, type: 'heap', size: 8, allocated: false },
        { address: '0x2014', value: 256, type: 'heap', variable: 'buffer', size: 256, allocated: true, referenced: true },
        { address: '0x2114', value: null, type: 'heap', size: 8, allocated: false },

        // Global memory cells
        { address: '0x3000', value: 1000, type: 'global', variable: 'MAX_SIZE', size: 4, allocated: true },
        { address: '0x3004', value: 1, type: 'global', variable: 'isEnabled', size: 1, allocated: true },
        { address: '0x3005', value: 0xFF, type: 'global', variable: 'flags', size: 1, allocated: true },
        { address: '0x3006', value: null, type: 'global', size: 2, allocated: false },

        // Code memory cells
        { address: '0x4000', value: 0x90, type: 'code', variable: 'main', size: 1, allocated: true },
        { address: '0x4001', value: 0x55, type: 'code', size: 1, allocated: true },
        { address: '0x4002', value: 0x89, type: 'code', size: 1, allocated: true },
        { address: '0x4003', value: 0xE5, type: 'code', variable: 'func1', size: 1, allocated: true },
    ])


    const handleCellClick = (cell: IMemoryCell) => {
        console.log('Cell clicked:', cell)
        // Example: Toggle highlight on click
        setMemoryData(prev =>
            prev.map(c =>
                c.address === cell.address
                    ? { ...c, highlighted: !c.highlighted }
                    : c
            )
        )
    }

    // Example of adding new memory cell
    const addRandomCell = () => {
        const types: Array<'stack' | 'heap' | 'global' | 'code'> = ['stack', 'heap', 'global', 'code']
        const newCell: IMemoryCell = {
            address: `0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`,
            value: Math.random() > 0.3 ? Math.floor(Math.random() * 1000) : null,
            type: types[Math.floor(Math.random() * types.length)],
            size: Math.floor(Math.random() * 8) + 1,
            allocated: Math.random() > 0.3,
            variable: Math.random() > 0.5 ? `var${memoryData.length}` : undefined,
        }
        setMemoryData(prev => [...prev, newCell])
    }

    // Example of clearing unallocated cells
    const clearUnallocated = () => {
        setMemoryData(prev => prev.filter(cell => cell.allocated))
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Memory Visualizer Example
                    </h1>

                    {/* Controls */}
                    <div className="flex gap-4 flex-wrap mb-4">
                        <button
                            onClick={addRandomCell}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Add Random Cell
                        </button>
                        <button
                            onClick={clearUnallocated}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Clear Unallocated
                        </button>
                        <button
                            onClick={() => setMemoryData(prev =>
                                prev.map(c => ({ ...c, highlighted: false }))
                            )}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Clear Highlights
                        </button>
                    </div>

                    {/* Info */}
                    <div className="text-sm text-gray-600">
                        Total Cells: {memoryData.length} |
                        Allocated: {memoryData.filter(c => c.allocated).length} |
                        Free: {memoryData.filter(c => !c.allocated).length}
                    </div>
                </div>

                {/* Memory Visualizer with different configurations */}
                <div className="space-y-6">
                    {/* Default configuration */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Default Configuration
                        </h2>
                        <MemoryVisualizer
                            memoryData={memoryData}
                            onCellClick={handleCellClick}
                            title="System Memory Layout"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MemoryVisualizerExample
