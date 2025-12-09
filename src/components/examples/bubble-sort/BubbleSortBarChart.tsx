// filename: BubbleSortBarChart.tsx
import React, { useState, useEffect } from 'react';

export default function BubbleSortBarChart() {
  const [array, setArray] = useState([40, 25, 60, 15, 50, 30, 70, 20]);
  const [comparing, setComparing] = useState<[number, number] | null>(null);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [passCount, setPassCount] = useState(0);
  const [swapCount, setSwapCount] = useState(0);

  const reset = () => {
    setComparing(null);
    setSorted([]);
    setIsAnimating(false);
    setPassCount(0);
    setSwapCount(0);
  };

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 10);
    setArray(newArray);
    reset();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;
    let totalSwaps = 0;

    for (let i = 0; i < n - 1; i++) {
      setPassCount(i + 1);
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          totalSwaps++;
          setSwapCount(totalSwaps);
          swapped = true;
          await sleep(speed);
        }
      }

      setSorted(prev => [...prev, n - i - 1]);
      setComparing(null);

      if (!swapped) {
        setSorted(Array.from({ length: n }, (_, idx) => idx));
        break;
      }
    }

    setIsAnimating(false);
    setComparing(null);
  };

  const maxValue = Math.max(...array);

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Bubble Sort - Bar Chart Visualization</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={bubbleSort}
            disabled={isAnimating}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnimating ? 'Sorting...' : 'Start Sort'}
          </button>
          <button
            onClick={reset}
            disabled={isAnimating}
            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Reset
          </button>
          <button
            onClick={generateRandomArray}
            disabled={isAnimating}
            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            New Array
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
              disabled={isAnimating}
              className="w-32"
            />
            <span className="text-sm dark:text-gray-300">{speed}ms</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6" style={{ minHeight: '300px' }}>
          <div className="flex items-end justify-center gap-2 h-64">
            {array.map((value, index) => {
              const height = (value / maxValue) * 100;
              let bgColor = 'bg-blue-500 dark:bg-blue-600';

              if (sorted.includes(index)) {
                bgColor = 'bg-green-500 dark:bg-green-600';
              } else if (comparing && (comparing[0] === index || comparing[1] === index)) {
                bgColor = 'bg-red-500 dark:bg-red-600';
              }

              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="text-xs font-bold dark:text-white">{value}</div>
                  <div
                    className={`w-12 ${bgColor} rounded-t transition-all duration-300 flex items-end justify-center pb-1`}
                    style={{ height: `${height}%`, minHeight: '20px' }}
                  >
                    <span className="text-xs text-white font-medium">{index}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pass</div>
            <div className="text-2xl font-bold dark:text-white">{passCount}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Swaps</div>
            <div className="text-2xl font-bold dark:text-white">{swapCount}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Array Size</div>
            <div className="text-2xl font-bold dark:text-white">{array.length}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Sorted</div>
            <div className="text-2xl font-bold dark:text-white">{sorted.length}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 text-sm dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Sorted</span>
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Complexity Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-gray-300">
          <div>
            <div className="font-bold text-lg mb-2">Best Case</div>
            <div className="text-2xl font-mono text-green-600 dark:text-green-400">O(n)</div>
            <div className="text-sm mt-1">Already sorted array</div>
          </div>
          <div>
            <div className="font-bold text-lg mb-2">Average Case</div>
            <div className="text-2xl font-mono text-yellow-600 dark:text-yellow-400">O(n²)</div>
            <div className="text-sm mt-1">Random order</div>
          </div>
          <div>
            <div className="font-bold text-lg mb-2">Worst Case</div>
            <div className="text-2xl font-mono text-red-600 dark:text-red-400">O(n²)</div>
            <div className="text-sm mt-1">Reverse sorted</div>
          </div>
        </div>
      </div>
    </div>
  );
}