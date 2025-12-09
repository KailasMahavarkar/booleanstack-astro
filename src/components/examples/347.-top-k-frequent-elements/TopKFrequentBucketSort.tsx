// filename: TopKFrequentBucketSort.tsx
import React, { useState } from 'react';

interface BucketItem {
  frequency: number;
  numbers: number[];
}

export default function TopKFrequentBucketSort() {
  const [array, setArray] = useState<number[]>([1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5]);
  const [k, setK] = useState(2);
  const [frequencyMap, setFrequencyMap] = useState<Map<number, number>>(new Map());
  const [buckets, setBuckets] = useState<BucketItem[]>([]);
  const [currentBucketIndex, setCurrentBucketIndex] = useState<number | null>(null);
  const [result, setResult] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const reset = () => {
    setFrequencyMap(new Map());
    setBuckets([]);
    setCurrentBucketIndex(null);
    setResult([]);
    setCurrentStep(0);
    setSteps([]);
    setIsComplete(false);
    setProcessingIndex(null);
  };

  const startVisualization = () => {
    reset();
    const newSteps: string[] = [];
    
    newSteps.push('Step 1: Build frequency map');
    array.forEach((num, idx) => {
      newSteps.push(`Count element ${num} at index ${idx}`);
    });
    
    newSteps.push('Step 2: Create buckets (index = frequency)');
    newSteps.push('Step 3: Place numbers into buckets by frequency');
    newSteps.push(`Step 4: Traverse buckets from right to left to get top ${k} elements`);
    
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
      setFrequencyMap(new Map());
      setProcessingIndex(null);
      return;
    }

    if (step.includes('Count element')) {
      const match = step.match(/element (\d+) at index (\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        const idx = parseInt(match[2]);
        setProcessingIndex(idx);
        
        const newMap = new Map(frequencyMap);
        newMap.set(num, (newMap.get(num) || 0) + 1);
        setFrequencyMap(newMap);
      }
      return;
    }

    if (step.includes('Create buckets')) {
      setProcessingIndex(null);
      const newBuckets: BucketItem[] = Array.from({ length: array.length + 1 }, (_, i) => ({
        frequency: i,
        numbers: []
      }));
      setBuckets(newBuckets);
      return;
    }

    if (step.includes('Place numbers into buckets')) {
      const newBuckets: BucketItem[] = Array.from({ length: array.length + 1 }, (_, i) => ({
        frequency: i,
        numbers: []
      }));
      
      frequencyMap.forEach((count, num) => {
        newBuckets[count].numbers.push(num);
      });
      
      setBuckets(newBuckets);
      return;
    }

    if (step.includes('Traverse buckets')) {
      const res: number[] = [];
      let count = 0;
      
      for (let i = buckets.length - 1; i >= 0 && count < k; i--) {
        if (buckets[i].numbers.length > 0) {
          for (const num of buckets[i].numbers) {
            if (count < k) {
              res.push(num);
              count++;
            }
          }
          setCurrentBucketIndex(i);
          break;
        }
      }
      
      setResult(res);
      
      setTimeout(() => {
        if (res.length < k) {
          let idx = currentBucketIndex !== null ? currentBucketIndex - 1 : buckets.length - 1;
          while (idx >= 0 && res.length < k) {
            if (buckets[idx].numbers.length > 0) {
              setCurrentBucketIndex(idx);
              for (const num of buckets[idx].numbers) {
                if (res.length < k) {
                  res.push(num);
                }
              }
              setResult([...res]);
            }
            idx--;
          }
        }
      }, 100);
      
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
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Top K Frequent Elements - Bucket Sort</h1>
        
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
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Input Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 flex items-center justify-center rounded-md font-bold transition-all ${
                    processingIndex === idx
                      ? 'bg-yellow-400 text-gray-900 scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {frequencyMap.size > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Frequency Map</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(frequencyMap.entries()).map(([num, count]) => (
                  <div
                    key={num}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-md text-purple-900 dark:text-purple-100"
                  >
                    <span className="font-bold">{num}</span>: {count}
                  </div>
                ))}
              </div>
            </div>
          )}

          {buckets.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Buckets (Index = Frequency)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {buckets.slice().reverse().map((bucket, reverseIdx) => {
                  const idx = buckets.length - 1 - reverseIdx;
                  if (bucket.numbers.length === 0 && idx > 0) return null;
                  
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-md border-2 transition-all ${
                        currentBucketIndex === idx
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px]">
                          Frequency {idx}:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {bucket.numbers.length > 0 ? (
                            bucket.numbers.map((num, numIdx) => (
                              <div
                                key={numIdx}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md font-bold"
                              >
                                {num}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">empty</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
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
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Bucket Sort Approach</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Build a frequency map of all elements</li>
          <li>Create buckets where index represents frequency (0 to n)</li>
          <li>Place each number into the bucket corresponding to its frequency</li>
          <li>Traverse buckets from right to left (highest frequency first)</li>
          <li>Collect k elements from the buckets</li>
          <li><strong>Time Complexity:</strong> O(n) - linear time!</li>
          <li><strong>Space Complexity:</strong> O(n) - for buckets and frequency map</li>
        </ol>
      </div>
    </div>
  );
}