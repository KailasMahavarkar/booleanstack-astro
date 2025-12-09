import React, { useState } from 'react'
import RecursiveVisualizerFlow from './Recviz'
import { type IRecursiveCall } from './type'


// Sample recursive call data for various algorithms
const generateFactorialCalls = (n: number): IRecursiveCall[] => {
    const calls: IRecursiveCall[] = []
    let stepCounter = 1

    const trace = (n: number, depth: number, parentId?: string): string => {
        const id = `factorial_${n}`
        const callStep = stepCounter++

        calls.push({
            id,
            functionName: 'factorial',
            args: n.toString(),
            parentId,
            depth,
            callStep,
            returnStep: undefined,
            returnValue: undefined
        })

        if (n <= 1) {
            const call = calls.find(c => c.id === id)!
            call.returnStep = stepCounter++
            call.returnValue = 1
            return id
        }

        trace(n - 1, depth + 1, id)

        const call = calls.find(c => c.id === id)!
        const childCall = calls.find(c => c.parentId === id)!
        call.returnStep = stepCounter++
        call.returnValue = n * (childCall.returnValue as number)

        return id
    }

    trace(n, 0)
    return calls
}

const generateFibonacciCalls = (n: number): IRecursiveCall[] => {
    const calls: IRecursiveCall[] = []
    let stepCounter = 1
    let idCounter = 0

    const trace = (n: number, depth: number, parentId?: string): string => {
        const id = `fib_${n}_${++idCounter}`
        const callStep = stepCounter++

        calls.push({
            id,
            functionName: 'fibonacci',
            args: n.toString(),
            parentId,
            depth,
            callStep,
            returnStep: undefined,
            returnValue: undefined
        })

        if (n <= 1) {
            const call = calls.find(c => c.id === id)!
            call.returnStep = stepCounter++
            call.returnValue = n
            return id
        }

        trace(n - 1, depth + 1, id)
        trace(n - 2, depth + 1, id)

        const call = calls.find(c => c.id === id)!
        const childCalls = calls.filter(c => c.parentId === id)
        call.returnStep = stepCounter++
        call.returnValue = childCalls.reduce((sum, c) => sum + (c.returnValue as number), 0)

        return id
    }

    trace(n, 0)
    return calls
}

const generateMergeSortCalls = (arr: number[]): IRecursiveCall[] => {
    const calls: IRecursiveCall[] = []
    let stepCounter = 1
    let idCounter = 0

    const trace = (arr: number[], depth: number, parentId?: string): string => {
        const id = `mergeSort_${++idCounter}`
        const callStep = stepCounter++

        calls.push({
            id,
            functionName: 'mergeSort',
            args: `[${arr.join(', ')}]`,
            parentId,
            depth,
            callStep,
            returnStep: undefined,
            returnValue: undefined
        })

        if (arr.length <= 1) {
            const call = calls.find(c => c.id === id)!
            call.returnStep = stepCounter++
            call.returnValue = `[${arr.join(', ')}]`
            return id
        }

        const mid = Math.floor(arr.length / 2)
        const left = arr.slice(0, mid)
        const right = arr.slice(mid)

        trace(left, depth + 1, id)
        trace(right, depth + 1, id)

        // Simulate merge
        const leftSorted = [...left].sort((a, b) => a - b)
        const rightSorted = [...right].sort((a, b) => a - b)
        const merged = [...leftSorted, ...rightSorted].sort((a, b) => a - b)

        const call = calls.find(c => c.id === id)!
        call.returnStep = stepCounter++
        call.returnValue = `[${merged.join(', ')}]`

        return id
    }

    trace(arr, 0)
    return calls
}

const RecursiveVisualizerExamples: React.FC = () => {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<'factorial' | 'fibonacci' | 'mergesort'>('factorial')
    const [inputValue, setInputValue] = useState<number>(5)
    const [visualizerType, setVisualizerType] = useState<'flow' | 'tree'>('flow')

    const getCalls = (): IRecursiveCall[] => {
        switch (selectedAlgorithm) {
            case 'factorial':
                return generateFactorialCalls(Math.min(inputValue, 7))
            case 'fibonacci':
                return generateFibonacciCalls(Math.min(inputValue, 6))
            case 'mergesort':
                return generateMergeSortCalls([3, 1, 4, 1, 5, 9, 2, 6].slice(0, inputValue))
            default:
                return []
        }
    }

    const calls = getCalls()

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Recursive Function Visualizers
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Compare two different visualization approaches: React Flow for smooth animations and curved edges,
                        or your existing Tree component for a simpler tree structure.
                    </p>

                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Visualizer Type Selector */}
                        <div className="flex gap-4 items-center">
                            <label className="text-sm font-medium text-gray-700">Visualizer Type:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setVisualizerType('flow')}
                                    className={`px-4 py-2 rounded transition ${visualizerType === 'flow'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    React Flow (Smooth)
                                </button>
                                <button
                                    onClick={() => setVisualizerType('tree')}
                                    className={`px-4 py-2 rounded transition ${visualizerType === 'tree'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Tree Component (Simple)
                                </button>
                            </div>
                        </div>

                        {/* Algorithm Selector */}
                        <div className="flex gap-4 items-center">
                            <label className="text-sm font-medium text-gray-700">Algorithm:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedAlgorithm('factorial')}
                                    className={`px-4 py-2 rounded transition ${selectedAlgorithm === 'factorial'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Factorial
                                </button>
                                <button
                                    onClick={() => setSelectedAlgorithm('fibonacci')}
                                    className={`px-4 py-2 rounded transition ${selectedAlgorithm === 'fibonacci'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Fibonacci
                                </button>
                                <button
                                    onClick={() => setSelectedAlgorithm('mergesort')}
                                    className={`px-4 py-2 rounded transition ${selectedAlgorithm === 'mergesort'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Merge Sort
                                </button>
                            </div>
                        </div>

                        {/* Input Value */}
                        <div className="flex gap-4 items-center">
                            <label className="text-sm font-medium text-gray-700">
                                Input {selectedAlgorithm === 'mergesort' ? 'Array Size' : 'Value'}:
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedAlgorithm === 'mergesort' ? 8 : 7}
                                value={inputValue}
                                onChange={(e) => setInputValue(parseInt(e.target.value) || 1)}
                                className="px-3 py-1 border border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-500">
                                (Max: {selectedAlgorithm === 'mergesort' ? 8 : 7})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visualization */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        {visualizerType === 'flow' ? 'React Flow Visualization' : 'Tree Component Visualization'}
                    </h2>


                    <RecursiveVisualizerFlow
                        calls={calls}
                        width="100%"
                        height="800px"
                        autoPlay={false}
                        playSpeed={1000}
                        title={`${selectedAlgorithm}(${inputValue})`}
                        edgeType="simplebezier"
                        horizontalSpacing={250}
                        verticalSpacing={250}
                        nodeWidth={180}
                        nodeHeight={100}
                    />
                </div>

                {/* Comparison */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <h3 className="font-semibold text-blue-900 mb-2">React Flow Version</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✅ Smooth animations with requestAnimationFrame</li>
                            <li>✅ Curved bezier edges</li>
                            <li>✅ Built-in zoom/pan controls</li>
                            <li>✅ Better performance for large graphs</li>
                            <li>✅ Mini-map support</li>
                            <li>⚠️ Requires react-flow-renderer dependency</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <h3 className="font-semibold text-green-900 mb-2">Tree Component Version</h3>
                        <ul className="text-sm text-green-800 space-y-1">
                            <li>✅ Uses your existing Tree component</li>
                            <li>✅ No additional dependencies</li>
                            <li>✅ Simpler implementation</li>
                            <li>✅ Good for smaller trees</li>
                            <li>⚠️ Straight line edges</li>
                            <li>⚠️ May lag with many nodes</li>
                        </ul>
                    </div>
                </div>

                {/* Installation */}
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Installation</h3>
                    <pre className="text-sm overflow-x-auto">
                        {`# For React Flow version:
npm install reactflow

# For Tree component version:
# No additional dependencies needed - uses your existing Tree component

# Import usage:
import RecursiveVisualizerFlow from './RecursiveVisualizerFlow'
import RecursiveTreeVisualizer from './RecursiveTreeVisualizer'

// Generate calls data
const calls: IRecursiveCall[] = [
    {
        id: 'call1',
        functionName: 'factorial',
        args: '4',
        parentId: undefined,
        depth: 0,
        callStep: 1,
        returnStep: 8,
        returnValue: 24
    },
    // ... more calls
]

// Use either visualizer
<RecursiveVisualizerFlow calls={calls} />
// or
<RecursiveTreeVisualizer calls={calls} />`}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default RecursiveVisualizerExamples