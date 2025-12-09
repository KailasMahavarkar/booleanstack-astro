// filename: BubbleSortComparison.tsx
import React, { useState } from 'react';

export default function BubbleSortComparison() {
  const [inputArray, setInputArray] = useState([64, 34, 25, 12, 22, 11, 90, 88]);
  const [basicArray, setBasicArray] = useState<number[]>([]);
  const [optimizedArray, setOptimizedArray] = useState<number[]>([]);
  
  const [basicState, setBasicState] = useState({
    currentJ: null as number | null,
    sortedUntil: -1,
    passes: 0,
    comparisons: 0,
    swaps: 0,
    isComplete: false,
  });

  const [optimizedState, setOptimizedState] = useState({
    currentJ: null as number | null,
    sortedIndices: new Set<number>(),
    passes: 0,
    comparisons: 0,
    swaps: 0,
    isComplete: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);

  const reset = () => {
    setBasicArray([]);
    setOptimizedArray([]);
    setBasicState({
      currentJ: null,
      sortedUntil: -1,
      passes: 0,
      comparisons: 0,
      swaps: 0,
      isComplete: false,
    });
    setOptimizedState({
      currentJ: null,
      sortedIndices: new Set(),
      passes: 0,
      comparisons: 0,
      swaps: 0,
      isComplete: false,
    });
    setIsRunning(false);
  };

  const generateArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1);
    setInputArray(newArray);
    reset();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runBasicBubbleSort = async (arr: number[]) => {
    const array = [...arr];
    let passes = 0;
    let comparisons = 0;
    let swaps = 0;
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
      passes++;
      for (let j = 0; j < n - i - 1; j++) {
        setBasicState(prev => ({ ...prev, currentJ: j }));
        comparisons++;
        await sleep(speed);

        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          swaps++;
          setBasicArray([...array]);
          await sleep(speed);
        }

        setBasicState(prev => ({
          ...prev,
          passes,
          comparisons,
          swaps,
        }));
      }
      setBasicState(prev => ({ ...prev, sortedUntil: n - i - 1 }));
    }

    setBasicState(prev => ({ ...prev, currentJ: null, isComplete: true, sortedUntil: 0 }));
  };

  const runOptimizedBubbleSort = async (arr: number[]) => {
    const array = [...arr];
    let passes = 0;
    let comparisons = 0;
    let swaps = 0;
    let n = array.length;
    const sorted = new Set<number>();

    for (let i = 0; i < n - 1; i++) {
      passes++;
      let swapped = false;
      let lastSwap = -1;

      for (let j = 0; j < n - i - 1; j++) {
        setOptimizedState(prev => ({ ...prev, currentJ: j }));
        comparisons++;
        await sleep(speed);

        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          swaps++;
          swapped = true;
          lastSwap = j;
          setOptimizedArray([...array]);
          await sleep(speed);
        }

        setOptimizedState(prev => ({
          ...prev,
          passes,
          comparisons,
          swaps,
        }));
      }

      sorted.add(n - i - 1);
      setOptimizedState(prev => ({ ...prev, sortedIndices: new Set(sorted) }));

      if (!swapped) {
        for (let k = 0; k < n; k++) sorted.add(k);
        setOptimizedState(prev => ({ ...prev, sortedIndices: new Set(sorted) }));
        break;
      }

      if (lastSwap !== -1 && lastSwap < n - i - 2) {
        n = lastSwap + 1;
      }
    }

    setOptimizedState(prev => ({ ...prev, currentJ: null, isComplete: true }));
  };

  const startComparison = async () => {
    setIsRunning(true);
    setBasicArray([...inputArray]);
    setOptimizedArray([...inputArray]);
    
    await Promise.all([
      runBasicBubbleSort(inputArray),
      runOptimizedBubbleSort(inputArray),
    ]);
    
    setIsRunning(false);
  };

  const handleArrayInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length > 0) {
      setInputArray(values);
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Bubble Sort: Basic vs Optimized</h1>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={generateArray}
              disabled={isRunning}
              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Generate Random
            </button>
            <button
              onClick={startComparison}
              disabled={isRunning || inputArray.length === 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isRunning || inputArray.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRunning ? 'Running...' : 'Start Comparison'}
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
                max="800"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isRunning}
                className="w-32"
              />
              <span className="text-sm dark:text-gray-300">{speed}ms</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium dark:text-white">Input Array:</label>
            <input
              type="text"
              value={inputArray.join(', ')}
              onChange={handleArrayInput}
              disabled={isRunning}
              placeholder="e.g., 64, 34, 25, 12"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3 text-red-700 dark:text-red-400">Basic Bubble Sort</h2>
            
            <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[80px]">
              {basicArray.map((num, index) => {
                let bgColor = 'bg-red-200 dark:bg-red-800';
                let textColor = 'text-gray-900 dark:text-gray-100';

                if (basicState.sortedUntil >= 0 && index >= basicState.sortedUntil) {
                  bgColor = 'bg-green-500 dark:bg-green-600';
                  textColor = 'text-white';
                } else if (index === basicState.currentJ || index === basicState.currentJ! + 1) {
                  bgColor = 'bg-yellow-400 dark:bg-yellow-500';
                  textColor = 'text-gray-900';
                }

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg ${bgColor} ${textColor} transition-all duration-300 shadow-md`}
                  >
                    <div className="font-bold">{num}</div>
                    <div className="text-xs opacity-75">{index}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-red-50 dark:bg-red-900 p-2 rounded text-center">
                <div className="font-semibold text-red-900 dark:text-red-100">{basicState.passes}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Passes</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-2 rounded text-center">
                <div className="font-semibold text-red-900 dark:text-red-100">{basicState.comparisons}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Comparisons</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-2 rounded text-center">
                <div className="font-semibold text-red-900 dark:text-red-100">{basicState.swaps}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Swaps</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3 text-green-700 dark:text-green-400">Optimized Bubble Sort</h2>
            
            <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[80px]">
              {optimizedArray.map((num, index) => {
                let bgColor = 'bg-green-200 dark:bg-green-800';
                let textColor = 'text-gray-900 dark:text-gray-100';

                if (optimizedState.sortedIndices.has(index)) {
                  bgColor = 'bg-green-500 dark:bg-green-600';
                  textColor = 'text-white';
                } else if (index === optimizedState.currentJ || index === optimizedState.currentJ! + 1) {
                  bgColor = 'bg-yellow-400 dark:bg-yellow-500';
                  textColor = 'text-gray-900';
                }

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg ${bgColor} ${textColor} transition-all duration-300 shadow-md`}
                  >
                    <div className="font-bold">{num}</div>
                    <div className="text-xs opacity-75">{index}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-green-50 dark:bg-green-900 p-2 rounded text-center">
                <div className="font-semibold text-green-900 dark:text-green-100">{optimizedState.passes}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Passes</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-2 rounded text-center">
                <div className="font-semibold text-green-900 dark:text-green-100">{optimizedState.comparisons}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Comparisons</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-2 rounded text-center">
                <div className="font-semibold text-green-900 dark:text-green-100">{optimizedState.swaps}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Swaps</div>
              </div>
            </div>
          </div>
        </div>

        {basicState.isComplete && optimizedState.isComplete && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Performance Comparison</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold dark:text-blue-200">Passes Saved:</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">{basicState.passes - optimizedState.passes}</span>
              </div>
              <div>
                <span className="font-semibold dark:text-blue-200">Comparisons Saved:</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">{basicState.comparisons - optimizedState.comparisons}</span>
              </div>
              <div>
                <span className="font-semibold dark:text-blue-200">Efficiency Gain:</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">
                  {((1 - optimizedState.comparisons / basicState.comparisons) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Key Differences</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Basic Version</h3>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
              <li>Always completes n-1 passes</li>
              <li>No early termination</li>
              <li>Fixed number of comparisons</li>
              <li>Simple but inefficient</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Optimized Version</h3>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
              <li>Stops early if sorted</li>
              <li>Tracks last swap position</li>
              <li>Reduces comparison range</li>
              <li>More efficient on partially sorted data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}