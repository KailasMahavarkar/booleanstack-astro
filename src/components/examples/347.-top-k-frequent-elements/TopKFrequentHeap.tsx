// filename: TopKFrequentHeap.tsx
import React, { useState } from 'react';

interface HeapNode {
  num: number;
  freq: number;
}

export default function TopKFrequentHeap() {
  const [array, setArray] = useState<number[]>([1, 1, 1, 2, 2, 3, 4, 4, 4]);
  const [k, setK] = useState(2);
  const [frequencyMap, setFrequencyMap] = useState<Map<number, number>>(new Map());
  const [minHeap, setMinHeap] = useState<HeapNode[]>([]);
  const [currentElement, setCurrentElement] = useState<number | null>(null);
  const [result, setResult] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [heapAction, setHeapAction] = useState<string>('');

  const reset = () => {
    setFrequencyMap(new Map());
    setMinHeap([]);
    setCurrentElement(null);
    setResult([]);
    setCurrentStep(0);
    setSteps([]);
    setIsComplete(false);
    setHeapAction('');
  };

  const startVisualization = () => {
    reset();
    const newSteps: string[] = [];
    
    newSteps.push('Step 1: Build frequency map');
    
    const tempMap = new Map<number, number>();
    array.forEach(num => {
      tempMap.set(num, (tempMap.get(num) || 0) + 1);
    });
    
    newSteps.push('Step 2: Use Min-Heap of size K');
    
    Array.from(tempMap.entries()).forEach(([num, freq]) => {
      newSteps.push(`Process element ${num} with frequency ${freq}`);
    });
    
    newSteps.push('Step 3: Extract result from heap');
    
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Build frequency map')) {
      const tempMap = new Map<number, number>();
      array.forEach(num => {
        tempMap.set(num, (tempMap.get(num) || 0) + 1);
      });
      setFrequencyMap(tempMap);
      setHeapAction('Building frequency map...');
      return;
    }

    if (step.includes('Use Min-Heap')) {
      setMinHeap([]);
      setHeapAction('Initialize Min-Heap of size K');
      return;
    }

    if (step.includes('Process element')) {
      const match = step.match(/element (\d+) with frequency (\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        const freq = parseInt(match[2]);
        setCurrentElement(num);
        
        const newHeap = [...minHeap];
        
        if (newHeap.length < k) {
          newHeap.push({ num, freq });
          newHeap.sort((a, b) => a.freq - b.freq);
          setHeapAction(`Add ${num} (freq: ${freq}) to heap`);
        } else if (freq > newHeap[0].freq) {
          const removed = newHeap[0];
          newHeap[0] = { num, freq };
          newHeap.sort((a, b) => a.freq - b.freq);
          setHeapAction(`Replace ${removed.num} (freq: ${removed.freq}) with ${num} (freq: ${freq})`);
        } else {
          setHeapAction(`Skip ${num} (freq: ${freq}) - frequency too low`);
        }
        
        setMinHeap(newHeap);
      }
      return;
    }

    if (step.includes('Extract result')) {
      setCurrentElement(null);
      setResult(minHeap.map(node => node.num));
      setHeapAction('Heap contains the K most frequent elements!');
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

  const renderHeapTree = () => {
    if (minHeap.length === 0) return null;

    return (
      <div className="flex flex-col items-center gap-4">
        {minHeap.map((node, idx) => (
          <div
            key={idx}
            className={`relative ${idx === 0 ? 'mb-4' : ''}`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-white transition-all ${
                idx === 0 ? 'bg-red-500 text-lg' : 'bg-blue-500'
              }`}>
                <div>{node.num}</div>
                <div className="text-xs">f: {node.freq}</div>
              </div>
              {idx === 0 && (
                <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">Min (root)</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Top K Frequent Elements - Min-Heap</h1>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">Array:</label>
              <input
                type="text"
                value={array.join(', ')}
                onChange={handleArrayChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {heapAction && (
            <div className="text-sm p-3 bg-purple-50 dark:bg-purple-900 rounded-md font-medium text-purple-900 dark:text-purple-100">
              {heapAction}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Input Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 flex items-center justify-center rounded-md font-bold transition-all ${
                    num === currentElement
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
            <div className="space-y-2">
              {Array.from(frequencyMap.entries()).map(([num, freq]) => (
                <div
                  key={num}
                  className={`p-2 rounded-md flex justify-between transition-all ${
                    num === currentElement
                      ? 'bg-yellow-200 dark:bg-yellow-700'
                      : 'bg-purple-100 dark:bg-purple-900'
                  }`}
                >
                  <span className="font-bold text-purple-900 dark:text-purple-100">{num}:</span>
                  <span className="text-purple-700 dark:text-purple-200">{freq}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
              Min-Heap (Size: {minHeap.length}/{k})
            </h3>
            {minHeap.length > 0 ? (
              <div className="space-y-2">
                {minHeap.map((node, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-md ${
                      idx === 0
                        ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500'
                        : 'bg-blue-100 dark:bg-blue-900'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{node.num}</span>
                      <span className="text-sm">freq: {node.freq}</span>
                    </div>
                    {idx === 0 && (
                      <div className="text-xs text-red-700 dark:text-red-300 mt-1">Min Element</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 italic">Empty</div>
            )}
          </div>
        </div>

        {result.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Result: Top {k} Frequent Elements</h3>
            <div className="flex gap-2">
              {result.map((num, idx) => (
                <div key={idx} className="px-4 py-2 bg-green-600 text-white rounded-md font-bold text-lg">
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Min-Heap Approach</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Build a frequency map of all elements</li>
          <li>Create a Min-Heap of size K (smallest frequency at top)</li>
          <li>For each unique element:</li>
          <ul className="list-disc pl-5 mt-2">
            <li>If heap size &lt; K, add the element</li>
            <li>If element's frequency &gt; min frequency in heap, replace min with current element</li>
            <li>Otherwise, skip the element</li>
          </ul>
          <li>The heap will contain the K most frequent elements</li>
          <li><strong>Time Complexity:</strong> O(n log k) - better than sorting when k is small</li>
          <li><strong>Space Complexity:</strong> O(n) - for frequency map, O(k) for heap</li>
        </ol>
      </div>
    </div>
  );
}