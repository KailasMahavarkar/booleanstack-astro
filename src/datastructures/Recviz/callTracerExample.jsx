import React, { useState } from 'react'
import RecursiveVisualizerFlow from './Recviz'
import { generateCalls, examples } from './callTracer.js'

/**
 * Example demonstrating how to use the callTracer utility
 */
const CallTracerExample = () => {
    const [calls, setCalls] = useState([])
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [executionKey, setExecutionKey] = useState(0)
    const [code, setCode] = useState(
`function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
    )
    const [functionName, setFunctionName] = useState('fibonacci')
    const [args, setArgs] = useState('3')

    const handleExecute = () => {
        try {
            // Parse arguments
            const parsedArgs = JSON.parse(`[${args}]`)
            
            // Generate calls from the code
            const { result: res, calls: callData, error: err } = generateCalls(
                code,
                functionName,
                parsedArgs
            )
            
            if (err) {
                setError(err)
                setCalls([])
                setResult(null)
            } else {
                setCalls(callData)
                setResult(res)
                setError(null)
                // Increment key to force re-render of visualization
                setExecutionKey(prev => prev + 1)
            }
        } catch (e) {
            setError(e.message)
        }
    }

    const loadExample = (exampleName) => {
        const exampleConfigs = {
            fibonacci: {
                code: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
                name: 'fibonacci',
                args: '4'
            },
            factorial: {
                code: `function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
                name: 'factorial',
                args: '5'
            },
            power: {
                code: `function power(base, exp) {
    if (exp === 0) return 1;
    if (exp === 1) return base;
    return base * power(base, exp - 1);
}`,
                name: 'power',
                args: '2, 4'
            },
            gcd: {
                code: `function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}`,
                name: 'gcd',
                args: '48, 18'
            }
        }

        const config = exampleConfigs[exampleName]
        if (config) {
            setCode(config.code)
            setFunctionName(config.name)
            setArgs(config.args)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Call Tracer Utility</h2>
                <p className="text-gray-600 mb-4">
                    Write JavaScript code with a recursive function and visualize its execution
                </p>

                {/* Example buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => loadExample('fibonacci')}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        Fibonacci
                    </button>
                    <button
                        onClick={() => loadExample('factorial')}
                        className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                        Factorial
                    </button>
                    <button
                        onClick={() => loadExample('power')}
                        className="px-3 py-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                    >
                        Power
                    </button>
                    <button
                        onClick={() => loadExample('gcd')}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                    >
                        GCD
                    </button>
                </div>

                {/* Code editor */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            JavaScript Code:
                        </label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-48 p-3 font-mono text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your recursive function here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Function Name:
                            </label>
                            <input
                                type="text"
                                value={functionName}
                                onChange={(e) => setFunctionName(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., fibonacci"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Arguments (comma-separated):
                            </label>
                            <input
                                type="text"
                                value={args}
                                onChange={(e) => setArgs(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 5"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
                    >
                        Execute & Visualize
                    </button>
                </div>

                {/* Result/Error display */}
                {result !== null && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-medium text-green-800">
                            Result: <span className="font-mono">{JSON.stringify(result)}</span>
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-800">
                            Error: {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Visualization */}
            {calls.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <RecursiveVisualizerFlow
                        key={executionKey}
                        calls={calls}
                        height="600px"
                        verticalSpacing={200}
                        title={`${functionName}(${args}) - Call Graph`}
                        autoPlay={false}
                        playSpeed={1000}
                    />
                </div>
            )}

            {/* Usage Documentation */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Usage Guide</h3>
                
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2">Method 1: Using generateCalls()</h4>
                        <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`import { generateCalls } from './callTracer.js'

const code = \`
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
\`

const { result, calls, error } = generateCalls(code, 'fibonacci', [5])

// Use 'calls' with RecursiveVisualizerFlow
<RecursiveVisualizerFlow calls={calls} />`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Method 2: Using traceFunction()</h4>
                        <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`import { traceFunction } from './callTracer.js'

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const { result, calls } = traceFunction(fibonacci, 'fibonacci', [5])
<RecursiveVisualizerFlow calls={calls} />`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Method 3: Using Pre-built Examples</h4>
                        <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`import { examples } from './callTracer.js'

const { result, calls } = examples.fibonacci(5)
<RecursiveVisualizerFlow calls={calls} />`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CallTracerExample

