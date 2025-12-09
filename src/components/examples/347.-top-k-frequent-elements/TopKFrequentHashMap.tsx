// filename: TopKFrequentHashMap.tsx
import React, { useState } from 'react';

interface FrequencyEntry {
  num: number;
  count: number;
  isTopK: boolean;
}

export default function TopKFrequentHashMap() {
  const [array, setArray] = useState<number[]>([1, 1, 1, 2, 2, 3, 4, 4, 4, 4]);
  const [k, setK] = useState(2);
  const [frequencyMap, setFrequencyMap] = useState<Map<number, number>>(new Map());
  const [sortedFrequencies, setSortedFrequencies] = useState<FrequencyEntry[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const reset = () => {
    setFrequencyMap(new Map());
    setSortedFrequencies([]);
    setResult([]);
    setCurrentStep(0);
    setCurrentIndex(null);
    setSteps([]);
    setIsComplete(false);
  };

  const startVisualization = () => {
    reset();
    const newSteps: string[] = [];
    newSteps.push('Initialize: Create empty frequency map');
    
    array.forEach((num, idx) => {
      newSteps.push(`Processing element ${num} at index ${idx}`);
    });
    
    newSteps.push('Build frequency map complete');
    newSteps.push('Sort elements by frequency');
    newSteps.push(`Select top ${k} elements`);
    
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Initialize')) {
      setFrequencyMap(new Map());
      return;
    }

    if (step.includes('Processing element')) {
      const match = step.match(/element (\d+) at index (\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        const idx = parseInt(match[2]);
        setCurrentIndex(idx);
        
        const newMap = new Map(frequencyMap);
        newMap.set(num, (newMap.get(num) || 0) + 1);
        setFrequencyMap(newMap);
      }
      return;
    }

    if (step.includes('Build frequency map complete')) {
      setCurrentIndex(null);
      return;
    }

    if (step.includes('Sort elements')) {
      const sorted: FrequencyEntry[] = Array.from(frequencyMap.entries())
        .map(([num, count]) => ({ num, count, isTopK: false }))
        .sort((a, b) => b.count - a.count);
      setSortedFrequencies(sorted);
      return;
    }

    if (step.includes('Select top')) {
      const topK = sortedFrequencies.slice(0, k);
      const updatedSorted = sortedFrequencies.map((entry, idx) => ({
        ...entry,
        isTopK: idx < k
      }));
      setSortedFrequencies(updatedSorted);
      setResult(topK.map(e => e.num));
      return;
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length > 0) {
      setArray(values);
      reset();
    }
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setK(value);
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Top K Frequent Elements - HashMap Approach</h1>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">Array:</label>
              <input
                type="text"
                value={array.join(', ')}
                onChange={handleArrayChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1, 1, 1, 2, 2, 3"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">K:</label>
              <input
                type="number"
                value={k}
                onChange={handleKChange}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={startVisualization}
              disabled={steps.length > 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Start
            </button>
            <button
              onClick={nextStep}
              disabled={steps.length === 0 || isComplete}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${steps.length === 0 || isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next Step
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Reset
            </button>
          </div>

          <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100">
            {currentStep < steps.length ? steps[currentStep] : "Click 'Start' to begin"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Input Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 flex items-center justify-center rounded-md font-bold transition-all ${
                    currentIndex === idx
                      ? 'bg-yellow-400 text-gray-900 scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Frequency Map</h3>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(frequencyMap.entries()).map(([num, count]) => (
                <div
                  key={num}
                  className="p-3 bg-purple-100 dark:bg-purple-900 rounded-md flex justify-between items-center"
                >
                  <span className="font-bold text-purple-900 dark:text-purple-100">{num}:</span>
                  <span className="text-purple-700 dark:text-purple-200">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sortedFrequencies.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Sorted by Frequency</h3>
            <div className="flex flex-wrap gap-2">
              {sortedFrequencies.map((entry, idx) => (
                <div
                  key={entry.num}
                  className={`p-4 rounded-md transition-all ${
                    entry.isTopK
                      ? 'bg-green-500 text-white scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="font-bold text-lg">{entry.num}</div>
                  <div className="text-sm">Count: {entry.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Result: Top {k} Frequent Elements</h3>
            <div className="flex gap-2">
              {result.map((num, idx) => (
                <div key={idx} className="px-4 py-2 bg-green-600 text-white rounded-md font-bold">
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Algorithm Explanation</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Create a HashMap to count the frequency of each element</li>
          <li>Iterate through the array and update the frequency count</li>
          <li>Sort the elements by their frequency in descending order</li>
          <li>Return the first k elements from the sorted list</li>
          <li><strong>Time Complexity:</strong> O(n log n) - dominated by sorting</li>
          <li><strong>Space Complexity:</strong> O(n) - for the HashMap</li>
        </ol>
      </div>
    </div>
  );
}