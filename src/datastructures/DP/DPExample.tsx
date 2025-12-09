import React from 'react'
import DPVisualizer from './DP'
import type { IDPColor } from './type'


const customColors: Record<string, IDPColor> = {
    '0,0': {
        color: '#ffd93d',
        label: 'Origin'
    },
    '4,4': {
        color: '#6bcf7f',
        label: 'Target'
    }
}


const DPVisualizerExample: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Dynamic Programming Visualizer Examples
                    </h1>
                    <div className="text-sm text-gray-600">
                        Click cells to highlight them. Shift+click to mark as computed.
                    </div>
                </div>

                {/* 1D DP Example - Fibonacci */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        1D DP Array - Fibonacci Sequence (Auto-wrapped at 10 per row)
                    </h2>
                    <DPVisualizer
                        data={[1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765,
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 9999999999,
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        ]}
                        height="100%"
                        // width="100%"
                        // height="300px"
                        cellWidth={100}
                        cellHeight={50}
                        highlightedCells={[]}
                        computedCells={[
                            0, 2, 15, 19
                        ]}
                        onCellClick={() => { }}
                        title="Fibonacci Numbers (20 elements)"
                        showIndices={false}
                        showComputationOrder={true}
                        maxColsPerRow={5}
                    />
                </div>

                {/* 2D DP Example - LCS */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        2D DP Array - Longest Common Subsequence
                    </h2>
                    <DPVisualizer
                        data={[[0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 1, 1, 2, 2], [0, 1, 2, 2, 2], [0, 1, 2, 2, 3]]}
                        // width="100%"
                        height="100%"
                        cellWidth={70}
                        cellHeight={45}
                        highlightedCells={[]}
                        computedCells={[
                            [1, 1], [1, 2], [2, 1], [2, 2], [3, 3]
                        ]}
                        onCellClick={() => { }}
                        // rowLabels={['', 'A', 'B', 'C', 'D']}
                        // colLabels={['', 'B', 'C', 'D', 'E']}
                        title="LCS Dynamic Programming Table"
                        showIndices={true}
                        showComputationOrder={true}
                        cellColors={customColors}
                    />
                </div>




            </div>
        </div>
    )
}

export default DPVisualizerExample
