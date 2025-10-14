import React from 'react'

const DPEntry = () => {
    return (
        <div className="w-full">
            <div className='mb-6'>
                <h1 className="text-2xl font-bold text-base-content mb-4">Dynamic Programming</h1>
                <div className='mb-4'>
                    <h2 className="text-lg font-semibold text-base-content mb-2">DP Algorithms</h2>
                    <p className="text-base-content/80">
                        Dynamic programming is a method for solving complex problems by breaking them down 
                        into simpler subproblems and storing the results of these subproblems to avoid 
                        redundant calculations.
                    </p>
                </div>
            </div>
            
            <div className="bg-base-100 rounded-lg p-8">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-base-content mb-2">Coming Soon!</h3>
                        <p className="text-base-content/60 mb-4">
                            Dynamic programming demos are under development. We're working on interactive 
                            visualizations for classic DP problems.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="bg-base-200 rounded-lg p-4">
                            <h4 className="font-semibold text-base-content mb-2">Planned Demos:</h4>
                            <ul className="text-sm text-base-content/70 space-y-1">
                                <li>• Fibonacci with Memoization</li>
                                <li>• Longest Common Subsequence</li>
                                <li>• Knapsack Problem</li>
                                <li>• Edit Distance</li>
                            </ul>
                        </div>
                        <div className="bg-base-200 rounded-lg p-4">
                            <h4 className="font-semibold text-base-content mb-2">Features:</h4>
                            <ul className="text-sm text-base-content/70 space-y-1">
                                <li>• Step-by-step visualization</li>
                                <li>• DP table visualization</li>
                                <li>• Recursion tree display</li>
                                <li>• Performance comparison</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DPEntry;