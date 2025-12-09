// filename: StringScoreOptimizer.tsx
import React, { useState } from 'react';

export default function StringScoreOptimizer() {
  const [targetString, setTargetString] = useState('hello');
  const [optimizedString, setOptimizedString] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentSwapIndices, setCurrentSwapIndices] = useState<[number, number] | null>(null);
  const [optimizationSteps, setOptimizationSteps] = useState<Array<{string: string, score: number, action: string}>>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const calculateScore = (str: string): number => {
    let score = 0;
    for (let i = 0; i < str.length - 1; i++) {
      score += Math.abs(str.charCodeAt(i) - str.charCodeAt(i + 1));
    }
    return score;
  };

  const sortStringByAscii = (str: string): string => {
    return str.split('').sort().join('');
  };

  const startOptimization = () => {
    setIsOptimizing(true);
    setOptimizationSteps([]);
    setCurrentStepIndex(0);
    
    const steps: Array<{string: string, score: number, action: string}> = [];
    steps.push({
      string: targetString,
      score: calculateScore(targetString),
      action: 'Original string'
    });

    const sorted = sortStringByAscii(targetString);
    steps.push({
      string: sorted,
      score: calculateScore(sorted),
      action: 'Optimized (sorted alphabetically)'
    });

    setOptimizationSteps(steps);
    setOptimizedString(sorted);
  };

  const nextOptimizationStep = () => {
    if (currentStepIndex < optimizationSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const reset = () => {
    setIsOptimizing(false);
    setOptimizedString('');
    setCurrentSwapIndices(null);
    setOptimizationSteps([]);
    setCurrentStepIndex(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    setTargetString(value);
    reset();
  };

  const currentStep = optimizationSteps[currentStepIndex];
  const originalScore = optimizationSteps.length > 0 ? optimizationSteps[0].score : 0;
  const optimizedScore = optimizationSteps.length > 1 ? optimizationSteps[optimizationSteps.length - 1].score : 0;
  const improvement = originalScore - optimizedScore;
  const improvementPercent = originalScore > 0 ? ((improvement / originalScore) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">String Score Optimizer</h1>

        {/* Control Panel */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="target" className="font-medium dark:text-white">
                  String:
                </label>
                <input
                  id="target"
                  type="text"
                  value={targetString}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  placeholder="Enter lowercase letters"
                />
              </div>
              <button
                onClick={startOptimization}
                disabled={targetString.length < 2 || isOptimizing}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                  targetString.length < 2 || isOptimizing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Optimize
              </button>
              <button
                onClick={nextOptimizationStep}
                disabled={!isOptimizing || currentStepIndex >= optimizationSteps.length - 1}
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                  !isOptimizing || currentStepIndex >= optimizationSteps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Next Step →
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors dark:text-white"
              >
                Reset
              </button>
            </div>

            {currentStep && (
              <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100">
                {currentStep.action}
              </div>
            )}
          </div>
        </div>

        {/* Comparison View */}
        {optimizationSteps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Original String */}
            <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-red-100">Original</h3>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {targetString.split('').map((char, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100 transition-all"
                  >
                    <div className="font-bold">{char}</div>
                    <div className="text-xs">{char.charCodeAt(0)}</div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-sm text-red-700 dark:text-red-300">Score</div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100">{originalScore}</div>
              </div>
            </div>

            {/* Optimized String */}
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-green-900 dark:text-green-100">Optimized</h3>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {(currentStep?.string || '').split('').map((char, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 transition-all"
                  >
                    <div className="font-bold">{char}</div>
                    <div className="text-xs">{char.charCodeAt(0)}</div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-sm text-green-700 dark:text-green-300">Score</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {currentStep?.score || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Improvement Stats */}
        {optimizationSteps.length > 1 && currentStepIndex === optimizationSteps.length - 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Optimization Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">Original Score</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{originalScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">Optimized Score</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{optimizedScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">Improvement</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  -{improvement} ({improvementPercent}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Character Frequency Analysis */}
        {targetString.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Character Analysis</h3>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(targetString.split(''))).sort().map(char => {
                const count = targetString.split('').filter(c => c === char).length;
                return (
                  <div
                    key={char}
                    className="bg-white dark:bg-gray-600 rounded-lg p-3 shadow"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold dark:text-white">{char}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">ASCII: {char.charCodeAt(0)}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">×{count}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Optimization Strategy</h2>
        <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
          <li><strong>Key Insight:</strong> To minimize the score, adjacent characters should have ASCII values as close as possible.</li>
          <li><strong>Optimal Solution:</strong> Sort the string alphabetically. This ensures characters are ordered by their ASCII values.</li>
          <li><strong>Why it works:</strong> Sorting minimizes the differences between consecutive characters.</li>
          <li><strong>Example:</strong> "hello" → "ehllo" reduces jumps between characters significantly.</li>
        </ul>
      </div>
    </div>
  );
}