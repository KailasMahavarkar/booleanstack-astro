// filename: TwoSumTwoPointers.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
  left: number;
  right: number;
  sum: number;
  message: string;
  found: boolean;
}

export default function TwoSumTwoPointers() {
  const [array, setArray] = useState<number[]>([2, 7, 11, 15]);
  const [target, setTarget] = useState<number>(9);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);
  const [customArray, setCustomArray] = useState<string>('2,7,11,15');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const generateSteps = () => {
    const newSteps: Step[] = [];
    let left = 0;
    let right = array.length - 1;

    newSteps.push({
      left,
      right,
      sum: array[left] + array[right],
      message: `Initialize: left pointer at index 0, right pointer at index ${array.length - 1}`,
      found: false
    });

    while (left < right) {
      const sum = array[left] + array[right];

      if (sum === target) {
        newSteps.push({
          left,
          right,
          sum,
          message: `Found! ${array[left]} + ${array[right]} = ${target}. Indices: [${left + 1}, ${right + 1}]`,
          found: true
        });
        break;
      } else if (sum < target) {
        newSteps.push({
          left,
          right,
          sum,
          message: `${array[left]} + ${array[right]} = ${sum} < ${target}. Sum too small, move left pointer right.`,
          found: false
        });
        left++;
      } else {
        newSteps.push({
          left,
          right,
          sum,
          message: `${array[left]} + ${array[right]} = ${sum} > ${target}. Sum too large, move right pointer left.`,
          found: false
        });
        right--;
      }
    }

    if (left >= right && !newSteps[newSteps.length - 1].found) {
      newSteps.push({
        left,
        right,
        sum: 0,
        message: 'No solution found.',
        found: false
      });
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  const handleStart = () => {
    generateSteps();
  };

  const handleReset = () => {
    setSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleArrayChange = () => {
    try {
      const newArray = customArray.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      if (newArray.length > 0) {
        setArray(newArray.sort((a, b) => a - b));
        handleReset();
      }
    } catch (e) {
      console.error('Invalid array input');
    }
  };

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Two Sum II - Two Pointers Algorithm
      </h1>

      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Sorted Array (comma-separated)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customArray}
                onChange={(e) => setCustomArray(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., 2,7,11,15"
              />
              <button
                onClick={handleArrayChange}
                className="btn btn-primary"
              >
                Update
              </button>
            </div>
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

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleStart}
            disabled={steps.length > 0}
            className="btn btn-success"
          >
            Start
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep <= 0}
            className="btn btn-outline"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={steps.length === 0 || currentStep >= steps.length - 1}
            className="btn btn-primary"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            className="btn btn-outline"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={handleReset}
            className="btn btn-error"
          >
            <RotateCcw size={20} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Speed:</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="200"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="range range-primary range-sm w-32"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{speed}ms</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="alert alert-info mb-6">
        <span className="text-sm font-medium">
          {currentStepData ? currentStepData.message : 'Click "Start" to begin the visualization'}
        </span>
      </div>

      {/* Array Visualization */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {array.map((num, idx) => {
            let className = 'w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300';
            let bgColor = 'bg-white dark:bg-gray-800';
            let borderColor = 'border-gray-300 dark:border-gray-600';
            let textColor = 'text-gray-900 dark:text-white';

            if (currentStepData) {
              if (idx === currentStepData.left && idx === currentStepData.right) {
                bgColor = currentStepData.found ? 'bg-green-500' : 'bg-purple-500';
                borderColor = 'border-purple-700';
                textColor = 'text-white';
              } else if (idx === currentStepData.left) {
                bgColor = currentStepData.found ? 'bg-green-500' : 'bg-blue-500';
                borderColor = 'border-blue-700';
                textColor = 'text-white';
              } else if (idx === currentStepData.right) {
                bgColor = currentStepData.found ? 'bg-green-500' : 'bg-red-500';
                borderColor = 'border-red-700';
                textColor = 'text-white';
              } else if (idx > currentStepData.left && idx < currentStepData.right) {
                bgColor = 'bg-yellow-100 dark:bg-yellow-900';
                borderColor = 'border-yellow-300 dark:border-yellow-700';
              } else {
                bgColor = 'bg-gray-200 dark:bg-gray-600';
                textColor = 'text-gray-400 dark:text-gray-500';
              }
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`${className} ${bgColor} ${borderColor} ${textColor}`}>
                  <div className="text-xl font-bold">{num}</div>
                  <div className="text-xs opacity-70">idx: {idx}</div>
                </div>
                {currentStepData && idx === currentStepData.left && (
                  <div className="badge badge-primary badge-sm">Left</div>
                )}
                {currentStepData && idx === currentStepData.right && (
                  <div className="badge badge-secondary badge-sm">Right</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current State */}
      {currentStepData && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-200 dark:bg-gray-700">
            <div className="card-body items-center">
              <h3 className="card-title text-sm">Left Pointer</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.left}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Value: {array[currentStepData.left]}</p>
            </div>
          </div>
          <div className="card bg-base-200 dark:bg-gray-700">
            <div className="card-body items-center">
              <h3 className="card-title text-sm">Current Sum</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentStepData.sum}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target: {target}</p>
            </div>
          </div>
          <div className="card bg-base-200 dark:bg-gray-700">
            <div className="card-body items-center">
              <h3 className="card-title text-sm">Right Pointer</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{currentStepData.right}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Value: {array[currentStepData.right]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Explanation */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Algorithm Explanation</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Start with two pointers: <strong>left</strong> at the beginning and <strong>right</strong> at the end</li>
          <li>Calculate the sum of elements at both pointers</li>
          <li>If sum equals target, return the indices (1-indexed)</li>
          <li>If sum is less than target, move left pointer right (increase sum)</li>
          <li>If sum is greater than target, move right pointer left (decrease sum)</li>
          <li>Repeat until pointers meet or solution is found</li>
        </ol>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            <strong>Time Complexity:</strong> O(n) - Single pass through the array<br />
            <strong>Space Complexity:</strong> O(1) - Only two pointers used
          </p>
        </div>
      </div>
    </div>
  );
}