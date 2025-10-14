import { useState } from "react";
import DPVisualizer, { type DPCell } from "./DPVisualizer";

const DPExample: React.FC = () => {
    const [mode, setMode] = useState<'1d' | '2d' | 'knapsack' | 'edit'>('2d');
    const [highlightedCells, setHighlightedCells] = useState<[number, number][] | number[]>([]);
    const [computedCells, setComputedCells] = useState<[number, number][] | number[]>([]);
    const [showOrder, setShowOrder] = useState(false);

    // 2D DP example (Longest Common Subsequence)
    const data2D = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1],
        [0, 1, 1, 1, 2, 2],
        [0, 1, 1, 2, 2, 2],
        [0, 1, 2, 2, 2, 3]
    ];

    // 1D DP example (Fibonacci)
    const data1D = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

    // Knapsack DP example
    const knapsackData = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 2, 3, 3, 3, 3, 3],
        [0, 0, 2, 3, 3, 5, 6, 6]
    ];

    // Edit Distance DP example
    const editData = [
        [0, 1, 2, 3, 4],
        [1, 1, 2, 3, 4],
        [2, 2, 1, 2, 3],
        [3, 2, 2, 2, 3],
        [4, 3, 3, 3, 2]
    ];

    const getDataForMode = () => {
        switch (mode) {
            case '1d': return data1D;
            case 'knapsack': return knapsackData;
            case 'edit': return editData;
            default: return data2D;
        }
    };

    const getLabelsForMode = () => {
        switch (mode) {
            case '1d':
                return {
                    row: [],
                    col: ['F(0)', 'F(1)', 'F(2)', 'F(3)', 'F(4)', 'F(5)', 'F(6)', 'F(7)', 'F(8)', 'F(9)', 'F(10)', 'F(11)']
                };
            case 'knapsack':
                return {
                    row: ['0', '1kg', '2kg', '3kg', '4kg'],
                    col: ['0', '1', '2', '3', '4', '5', '6', '7']
                };
            case 'edit':
                return {
                    row: ['ε', 'S', 'U', 'N', 'D'],
                    col: ['ε', 'M', 'O', 'N', 'D']
                };
            default:
                return {
                    row: ['ε', 'A', 'B', 'C', 'D'],
                    col: ['ε', 'X', 'Y', 'Z', 'W', 'X']
                };
        }
    };

    const getTitleForMode = () => {
        switch (mode) {
            case '1d': return 'Fibonacci Sequence (1D DP)';
            case 'knapsack': return '0/1 Knapsack Problem (2D DP)';
            case 'edit': return 'Edit Distance (2D DP)';
            default: return 'Longest Common Subsequence (2D DP)';
        }
    };

    const handleCellClick = (cell: DPCell, isShiftClick?: boolean) => {
        console.log('Cell clicked:', cell, 'Shift held:', isShiftClick);

        if (mode === '1d') {
            if (isShiftClick) {
                // Add to existing selection or remove if already selected
                setHighlightedCells((prev) => {
                    const currentIndex = cell.col;
                    // Type guard to check if prev is number array (1D mode)
                    if (Array.isArray(prev) && prev.length > 0 && typeof prev[0] === 'number') {
                        const numberArray = prev as number[];
                        if (numberArray.includes(currentIndex)) {
                            // Remove if already selected
                            return numberArray.filter(index => index !== currentIndex);
                        } else {
                            // Add to selection
                            return [...numberArray, currentIndex];
                        }
                    } else {
                        // Initialize as number array
                        return [currentIndex];
                    }
                });
            } else {
                // Replace selection with single cell
                setHighlightedCells([cell.col]);
            }
        } else {
            if (isShiftClick) {
                // Add to existing selection or remove if already selected
                setHighlightedCells((prev) => {
                    const currentCell: [number, number] = [cell.row, cell.col];
                    // Type guard to check if prev is tuple array (2D mode)
                    if (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) {
                        const tupleArray = prev as [number, number][];
                        const existingIndex = tupleArray.findIndex(([r, c]) => r === cell.row && c === cell.col);

                        if (existingIndex !== -1) {
                            // Remove if already selected
                            return tupleArray.filter((_, index) => index !== existingIndex);
                        } else {
                            // Add to selection
                            return [...tupleArray, currentCell];
                        }
                    } else {
                        // Initialize as tuple array
                        return [currentCell];
                    }
                });
            } else {
                // Replace selection with single cell
                setHighlightedCells([[cell.row, cell.col]]);
            }
        }
    };

    const simulateComputation = () => {
        if (mode === '1d') {
            const computed = Array.from({ length: Math.min(8, data1D.length) }, (_, i) => i);
            setComputedCells(computed);
        } else {
            const data = getDataForMode();
            const computed: [number, number][] = [];

            // Simulate row-by-row computation
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (Array.isArray(row)) {
                    for (let j = 0; j < row.length; j++) {
                        if (i + j < 8) { // Limit animation
                            computed.push([i, j]);
                        }
                    }
                }
            }
            setComputedCells(computed);
        }
    };

    const clearHighlights = () => {
        setHighlightedCells([]);
        setComputedCells([]);
    };

    const labels = getLabelsForMode();

    return (
        <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                    {(['1d', '2d', 'knapsack', 'edit'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setMode(type);
                                clearHighlights();
                            }}
                            className={`px-4 py-2 rounded capitalize ${mode === type ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            style={{
                                backgroundColor: mode === type ? 'blue' : 'gray',
                                color: 'white'
                            }}
                        >
                            {type === '1d' ? '1D DP' : type === '2d' ? 'LCS' : type === 'knapsack' ? 'Knapsack' : 'Edit Dist'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={simulateComputation}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Simulate Computation
                    </button>
                    <button
                        onClick={clearHighlights}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear
                    </button>
                    <label className="flex items-center gap-2 px-3 py-2  rounded">
                        <input
                            type="checkbox"
                            checked={showOrder}
                            onChange={(e) => setShowOrder(e.target.checked)}
                        />
                        Show Order
                    </label>
                </div>
            </div>

            <div className="text-sm text-gray-600">
                <p>• Click cells to highlight • Hold Shift+click for multi-select • Drag to pan • Mouse wheel to zoom • Use controls to resize</p>
            </div>

            <div className="h-96 border border-gray-300">
                <DPVisualizer
                    data={getDataForMode()}
                    cellWidth={mode === '1d' ? 50 : 60}
                    cellHeight={40}
                    highlightedCells={highlightedCells}
                    computedCells={computedCells}
                    onCellClick={handleCellClick}
                    rowLabels={labels.row}
                    colLabels={labels.col}
                    title={getTitleForMode()}
                    showIndices={true}
                    showComputationOrder={showOrder}
                />
            </div>
        </div>
    );
};

export default DPExample;