// filename: TwoSumComparison.tsx
import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface HashMapStep {
  index: number;
  value: number;
  complement: number;
  hashMap: Record<number, number>;
  found: boolean;
  message: string;
}

interface TwoPointerStep {
  left: number;
  right: number;
  sum: number;
  message: string;
  found: boolean;
}

export default function TwoSumComparison() {
  const [array, setArray] = useState<number[]>([2, 7, 11, 15]);
  const [target, setTarget] = useState<number>(9);
  const [hashMapSteps, setHashMapSteps] = useState<HashMapStep[]>([]);
  const [twoPointerSteps, setTwoPointerSteps] = useState<TwoPointerStep[]>([]);
  const [currentHashMapStep, setCurrentHashMapStep] = useState<number>(-1);
  const [currentTwoPointerStep, setCurrentTwoPointerStep] = useState<number>(-1);
  const [activeAlgorithm, setActiveAlgorithm] = useState<'hashmap' | 'twopointer' | null>(null);

  const generateHashMapSteps = () => {
    const steps: HashMapStep[] = [];
    const map: Record<number, number> = {};

    for (let i = 0; i < array.length; i++) {
      const complement = target - array[i];
      
      if (map[complement] !== undefined) {
        steps.push({
          index: i,
          value: array[i],
          complement,
          hashMap: { ...map },
          found: true,
          message: `Found! ${complement} exists in hash map at index ${map[complement]}. Solution: [${map[complement]}, ${i}]`
        });
        break;
      } else {
        steps.push({
          index: i,
          value: array[i],
          complement,
          hashMap: { ...map },
          found: false,
          message: `Check ${array[i]}: complement ${complement} not in map. Add ${array[i]} -> ${i} to hash map.`
        });
        map[array[i]] = i;
      }
    }

    return steps;
  };

  const generateTwoPointerSteps = () => {
    const steps: TwoPointerStep[] = [];
    let left = 0;
    let right = array.length - 1;

    steps.push({
      left,
      right,
      sum: array[left] + array[right],
      message: `Initialize: left=0, right=${array.length - 1}`,
      found: false
    });

    while (left < right) {
      const sum = array[left] + array[right];

      if (sum === target) {
        steps.push({
          left,
          right,
          sum,
          message: `Found! ${array[left]} + ${array[right]} = ${target}`,
          found: true
        });
        break;
      } else if (sum < target) {
        steps.push({
          left,
          right,
          sum,
          message: `${sum} < ${target}, move left pointer`,
          found: false
        });
        left++;
      } else {
        steps.push({
          left,
          right,
          sum,
          message: `${sum} > ${target}, move right pointer`,
          found: false
        });
        right--;
      }
    }

    return steps;
  };

  const handleStartHashMap = () => {
    const steps = generateHashMapSteps();
    setHashMapSteps(steps);
    setCurrentHashMapStep(0);
    setActiveAlgorithm('hashmap');
  };

  const handleStartTwoPointer = () => {
    const steps = generateTwoPointerSteps();
    setTwoPointerSteps(steps);
    setCurrentTwoPointerStep(0);
    setActiveAlgorithm('twopointer');
  };

  const handleNextHashMap = () => {
    if (currentHashMapStep < hashMapSteps.length - 1) {
      setCurrentHashMapStep(currentHashMapStep + 1);
    }
  };

  const handleNextTwoPointer = () => {
    if (currentTwoPointerStep < twoPointerSteps.length - 1) {
      setCurrentTwoPointerStep(currentTwoPointerStep + 1);
    }
  };

  const handleReset = () => {
    setHashMapSteps([]);
    setTwoPointerSteps([]);
    setCurrentHashMapStep(-1);
    setCurrentTwoPointerStep(-1);
    setActiveAlgorithm(null);
  };

  const currentHashMap = currentHashMapStep >= 0 ? hashMapSteps[currentHashMapStep] : null;
  const currentTwoPointer = currentTwoPointerStep >= 0 ? twoPointerSteps[currentTwoPointerStep] : null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Two Sum: Hash Map vs Two Pointers
      </h1>

      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Array (comma-separated)
            </label>
            <input
              type="text"
              value={array.join(',')}
              onChange={(e) => {
                const newArray = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                if (newArray.length > 0) {
                  setArray(newArray.sort((a, b) => a - b));
                  handleReset();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Target
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="btn btn-error">
            <RotateCcw size={20} /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hash Map Approach */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hash Map Approach</h2>
            <div className="flex gap-2">
              <button
                onClick={handleStartHashMap}
                disabled={hashMapSteps.length > 0}
                className="btn btn-sm btn-success"
              >
                <Play size={16} /> Start
              </button>
              <button
                onClick={handleNextHashMap}
                disabled={currentHashMapStep >= hashMapSteps.length - 1}
                className="btn btn-sm btn-primary"
              >
                Next
              </button>
            </div>
          </div>

          {currentHashMap && (
            <div className="alert alert-info mb-4">
              <span className="text-xs">{currentHashMap.message}</span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Array:</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, idx) => {
                let bgColor = 'bg-white dark:bg-gray-800';
                let borderColor = 'border-gray-300 dark:border-gray-600';
                let textColor = 'text-gray-900 dark:text-white';

                if (currentHashMap) {
                  if (currentHashMap.found && (currentHashMap.hashMap[currentHashMap.complement] === idx || idx === currentHashMap.index)) {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                    borderColor = 'border-green-700';
                  } else if (idx === currentHashMap.index) {
                    bgColor = 'bg-blue-500';
                    textColor = 'text-white';
                    borderColor = 'border-blue-700';
                  } else if (idx < currentHashMap.index) {
                    bgColor = 'bg-gray-200 dark:bg-gray-600';
                    textColor = 'text-gray-500 dark:text-gray-400';
                  }
                }

                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} transition-all`}
                  >
                    <div className="font-bold">{num}</div>
                    <div className="text-xs">{idx}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Hash Map:</h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 min-h-[100px]">
              {currentHashMap && Object.keys(currentHashMap.hashMap).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(currentHashMap.hashMap).map(([key, value]) => (
                    <div key={key} className="badge badge-lg bg-purple-500 text-white">
                      {key} → {value}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Empty</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Time:</strong> O(n) | <strong>Space:</strong> O(n)<br />
              Works on unsorted arrays
            </p>
          </div>
        </div>

        {/* Two Pointer Approach */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Two Pointer Approach</h2>
            <div className="flex gap-2">
              <button
                onClick={handleStartTwoPointer}
                disabled={twoPointerSteps.length > 0}
                className="btn btn-sm btn-success"
              >
                <Play size={16} /> Start
              </button>
              <button
                onClick={handleNextTwoPointer}
                disabled={currentTwoPointerStep >= twoPointerSteps.length - 1}
                className="btn btn-sm btn-primary"
              >
                Next
              </button>
            </div>
          </div>

          {currentTwoPointer && (
            <div className="alert alert-info mb-4">
              <span className="text-xs">{currentTwoPointer.message}</span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sorted Array:</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, idx) => {
                let bgColor = 'bg-white dark:bg-gray-800';
                let borderColor = 'border-gray-300 dark:border-gray-600';
                let textColor = 'text-gray-900 dark:text-white';

                if (currentTwoPointer) {
                  if (currentTwoPointer.found && (idx === currentTwoPointer.left || idx === currentTwoPointer.right)) {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                    borderColor = 'border-green-700';
                  } else if (idx === currentTwoPointer.left) {
                    bgColor = 'bg-blue-500';
                    textColor = 'text-white';
                    borderColor = 'border-blue-700';
                  } else if (idx === currentTwoPointer.right) {
                    bgColor = 'bg-red-500';
                    textColor = 'text-white';
                    borderColor = 'border-red-700';
                  } else if (idx > currentTwoPointer.left && idx < currentTwoPointer.right) {
                    bgColor = 'bg-yellow-100 dark:bg-yellow-900';
                  } else {
                    bgColor = 'bg-gray-200 dark:bg-gray-600';
                    textColor = 'text-gray-500 dark:text-gray-400';
                  }
                }

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} transition-all`}
                    >
                      <div className="font-bold">{num}</div>
                      <div className="text-xs">{idx}</div>
                    </div>
                    {currentTwoPointer && idx === currentTwoPointer.left && (
                      <div className="badge badge-xs badge-primary">L</div>
                    )}
                    {currentTwoPointer && idx === currentTwoPointer.right && (
                      <div className="badge badge-xs badge-secondary">R</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Pointers:</h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 min-h-[100px]">
              {currentTwoPointer ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Left:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{currentTwoPointer.left} (val: {array[currentTwoPointer.left]})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Right:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{currentTwoPointer.right} (val: {array[currentTwoPointer.right]})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sum:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{currentTwoPointer.sum}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Not started</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-md">
            <p className="text-xs text-green-900 dark:text-green-100">
              <strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)<br />
              Requires sorted array
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">When to Use Each Approach?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-purple-50 dark:bg-purple-900">
            <div className="card-body">
              <h3 className="card-title text-purple-900 dark:text-purple-100">Hash Map</h3>
              <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>Array is unsorted</li>
                <li>Need to find all pairs (not just one)</li>
                <li>Space is not a constraint</li>
                <li>Single pass solution needed</li>
              </ul>
            </div>
          </div>
          <div className="card bg-green-50 dark:bg-green-900">
            <div className="card-body">
              <h3 className="card-title text-green-900 dark:text-green-100">Two Pointers</h3>
              <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>Array is already sorted</li>
                <li>Space optimization is critical</li>
                <li>Follow-up requires O(1) space</li>
                <li>Problem guarantees sorted input</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}