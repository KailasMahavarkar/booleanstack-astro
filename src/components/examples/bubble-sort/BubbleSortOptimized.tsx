// filename: BubbleSortOptimized.tsx
import React, { useState } from 'react';

export default function BubbleSortOptimized() {
  const [array, setArray] = useState([45, 23, 67, 12, 89, 34, 56]);
  const [currentI, setCurrentI] = useState<number | null>(null);
  const [currentJ, setCurrentJ] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [passCount, setPassCount] = useState(0);
  const [swapCount, setSwapCount] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [optimizationUsed, setOptimizationUsed] = useState(false);
  const [lastSwapIndex, setLastSwapIndex] = useState<number | null>(null);

  const reset = () => {
    setCurrentI(null);
    setCurrentJ(null);
    setSortedIndices(new Set());
    setIsRunning(false);
    setIsPaused(false);
    setPassCount(0);
    setSwapCount(0);
    setComparisonCount(0);
    setOptimizationUsed(false);
    setLastSwapIndex(null);
  };

  const generateArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    reset();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSortOptimized = async () => {
    setIsRunning(true);
    setIsPaused(false);
    const arr = [...array];
    let n = arr.length;
    let swaps = 0;
    let comparisons = 0;
    let passes = 0;
    const sorted = new Set<number>();

    for (let i = 0; i < n - 1; i++) {
      passes++;
      setCurrentI(i);
      let swapped = false;
      let newLastSwap = -1;

      for (let j = 0; j < n - i - 1; j++) {
        setCurrentJ(j);
        comparisons++;
        setComparisonCount(comparisons);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          swaps++;
          setSwapCount(swaps);
          swapped = true;
          newLastSwap = j;
          setLastSwapIndex(j);
          await sleep(speed);
        }
      }

      sorted.add(n - i - 1);
      setSortedIndices(new Set(sorted));
      setPassCount(passes);

      if (!swapped) {
        setOptimizationUsed(true);
        for (let k = 0; k < n; k++) {
          sorted.add(k);
        }
        setSortedIndices(new Set(sorted));
        break;
      }

      if (newLastSwap !== -1 && newLastSwap < n - i - 2) {
        n = newLastSwap + 1;
        setOptimizationUsed(true);
      }
    }

    setCurrentI(null);
    setCurrentJ(null);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Optimized Bubble Sort</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={generateArray}
            disabled={isRunning}
            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            New Array
          </button>
          <button
            onClick={bubbleSortOptimized}
            disabled={isRunning}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Optimized Sort
          </button>
          <button
            onClick={reset}
            disabled={isRunning}
            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium dark:text-white">Speed:</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm dark:text-gray-300">{speed}ms</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {array.map((num, index) => {
            let bgColor = 'bg-blue-200 dark:bg-blue-800';
            let textColor = 'text-gray-900 dark:text-gray-100';
            let borderColor = 'border-transparent';
            let scale = 'scale-100';

            if (sortedIndices.has(index)) {
              bgColor = 'bg-green-500 dark:bg-green-600';
              textColor = 'text-white';
            } else if (index === currentJ || index === currentJ! + 1) {
              bgColor = 'bg-yellow-400 dark:bg-yellow-500';
              textColor = 'text-gray-900';
              borderColor = 'border-yellow-600';
              scale = 'scale-110';
            } else if (index === lastSwapIndex) {
              bgColor = 'bg-orange-400 dark:bg-orange-500';
              textColor = 'text-white';
            }

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center w-14 h-20 rounded-lg ${bgColor} ${textColor} ${scale} transition-all duration-300 shadow-lg border-2 ${borderColor}`}
              >
                <div className="font-bold text-xl">{num}</div>
                <div className="text-xs opacity-75 mt-1">[{index}]</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Passes</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{passCount}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Comparisons</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{comparisonCount}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg">
            <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Swaps</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{swapCount}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg">
            <div className="text-xs font-medium text-green-700 dark:text-green-300">Sorted</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{sortedIndices.size}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 rounded-lg">
            <div className="text-xs font-medium text-pink-700 dark:text-pink-300">Optimized</div>
            <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">{optimizationUsed ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Optimizations Applied</h2>
        <div className="space-y-3 dark:text-gray-300">
          <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100">1. Early Termination</h3>
            <p className="text-sm text-green-800 dark:text-green-200">If no swaps occur in a pass, the array is already sorted</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">2. Reduced Range</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">After each pass, the largest unsorted element is in its final position</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">3. Last Swap Position</h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">Elements after the last swap are already sorted</p>
          </div>
        </div>
      </div>
    </div>
  );
}