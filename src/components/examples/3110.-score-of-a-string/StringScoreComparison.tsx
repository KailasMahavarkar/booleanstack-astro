// filename: StringScoreComparison.tsx
import React, { useState } from 'react';

export default function StringScoreComparison() {
  const [strings, setStrings] = useState(['hello', 'world', 'abc']);
  const [newString, setNewString] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [currentStringIndex, setCurrentStringIndex] = useState<number | null>(null);
  const [currentPairIndex, setCurrentPairIndex] = useState<number | null>(null);

  const calculateScore = (str: string): number => {
    let score = 0;
    for (let i = 0; i < str.length - 1; i++) {
      score += Math.abs(str.charCodeAt(i) - str.charCodeAt(i + 1));
    }
    return score;
  };

  const addString = () => {
    if (newString.length >= 2 && !strings.includes(newString)) {
      setStrings([...strings, newString]);
      setNewString('');
    }
  };

  const removeString = (index: number) => {
    setStrings(strings.filter((_, i) => i !== index));
  };

  const animateCalculation = async () => {
    setCalculating(true);
    for (let strIdx = 0; strIdx < strings.length; strIdx++) {
      setCurrentStringIndex(strIdx);
      for (let pairIdx = 0; pairIdx < strings[strIdx].length - 1; pairIdx++) {
        setCurrentPairIndex(pairIdx);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setCurrentPairIndex(null);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    setCurrentStringIndex(null);
    setCalculating(false);
  };

  const sortedStrings = [...strings].sort((a, b) => calculateScore(a) - calculateScore(b));
  const maxScore = Math.max(...strings.map(calculateScore));
  const minScore = Math.min(...strings.map(calculateScore));

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">String Score Comparison</h1>

        {/* Add String Control */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              value={newString}
              onChange={(e) => setNewString(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
              placeholder="Enter string (min 2 chars)"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
            />
            <button
              onClick={addString}
              disabled={newString.length < 2}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                newString.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Add String
            </button>
            <button
              onClick={animateCalculation}
              disabled={calculating || strings.length === 0}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                calculating || strings.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Animate Calculation
            </button>
          </div>
        </div>

        {/* Strings Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {strings.map((str, strIdx) => {
            const score = calculateScore(str);
            const isHighlighted = currentStringIndex === strIdx;
            
            return (
              <div
                key={strIdx}
                className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 transition-all ${
                  isHighlighted ? 'border-yellow-500 shadow-lg' : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="font-mono text-lg dark:text-white">{str}</div>
                  <button
                    onClick={() => removeString(strIdx)}
                    disabled={calculating}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {str.split('').map((char, charIdx) => (
                    <div
                      key={charIdx}
                      className={`flex flex-col items-center justify-center w-10 h-10 rounded text-xs transition-all ${
                        isHighlighted && currentPairIndex !== null && (charIdx === currentPairIndex || charIdx === currentPairIndex + 1)
                          ? 'bg-yellow-300 dark:bg-yellow-600 text-gray-900'
                          : 'bg-gray-200 dark:bg-gray-600 dark:text-white'
                      }`}
                    >
                      <div className="font-bold">{char}</div>
                      <div className="text-xs">{char.charCodeAt(0)}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium dark:text-gray-300">Score:</div>
                  <div className={`text-xl font-bold ${
                    score === maxScore ? 'text-red-600 dark:text-red-400' :
                    score === minScore ? 'text-green-600 dark:text-green-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {score}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sorted Ranking */}
        {strings.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-red-50 dark:from-green-900 dark:to-red-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Ranking (Lowest to Highest Score)</h3>
            <div className="space-y-2">
              {sortedStrings.map((str, idx) => {
                const score = calculateScore(str);
                const percentage = maxScore > minScore ? ((score - minScore) / (maxScore - minScore)) * 100 : 50;
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold dark:text-white">{idx + 1}</div>
                    <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono dark:text-white">{str}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
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
        <h2 className="text-xl font-bold mb-4 dark:text-white">About This Visualization</h2>
        <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
          <li>Compare scores of multiple strings side by side</li>
          <li>Lower scores indicate characters that are closer together in ASCII values</li>
          <li>Higher scores indicate larger jumps between adjacent characters</li>
          <li>The ranking shows strings ordered from lowest to highest score</li>
        </ul>
      </div>
    </div>
  );
}