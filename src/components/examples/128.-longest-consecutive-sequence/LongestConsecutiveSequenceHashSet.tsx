// filename: LongestConsecutiveSequenceHashSet.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
  description: string;
  currentNum: number | null;
  visited: Set<number>;
  currentSequence: number[];
  longestSequence: number[];
  maxLength: number;
  checking: number | null;
}

export default function LongestConsecutiveSequenceHashSet() {
  const [inputArray, setInputArray] = useState<number[]>([100, 4, 200, 1, 3, 2]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [inputValue, setInputValue] = useState('100, 4, 200, 1, 3, 2');

  const generateSteps = (arr: number[]) => {
    const newSteps: Step[] = [];
    const numSet = new Set(arr);
    let longestSequence: number[] = [];
    let maxLength = 0;

    newSteps.push({
      description: 'Initialize: Create a HashSet from the array for O(1) lookups',
      currentNum: null,
      visited: new Set(),
      currentSequence: [],
      longestSequence: [],
      maxLength: 0,
      checking: null,
    });

    for (const num of arr) {
      newSteps.push({
        description: `Checking if ${num} is the start of a sequence (${num - 1} not in set)`,
        currentNum: num,
        visited: new Set(newSteps[newSteps.length - 1].visited),
        currentSequence: [],
        longestSequence: [...longestSequence],
        maxLength,
        checking: num - 1,
      });

      if (!numSet.has(num - 1)) {
        newSteps.push({
          description: `${num} is the start of a sequence! Begin counting consecutive numbers`,
          currentNum: num,
          visited: new Set(newSteps[newSteps.length - 1].visited),
          currentSequence: [num],
          longestSequence: [...longestSequence],
          maxLength,
          checking: null,
        });

        let currentNum = num;
        let currentSequence = [num];
        const visited = new Set(newSteps[newSteps.length - 1].visited);
        visited.add(num);

        while (numSet.has(currentNum + 1)) {
          currentNum += 1;
          currentSequence.push(currentNum);
          visited.add(currentNum);

          newSteps.push({
            description: `Found ${currentNum} in set, extending sequence`,
            currentNum: num,
            visited: new Set(visited),
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence],
            maxLength,
            checking: currentNum,
          });
        }

        const length = currentSequence.length;
        if (length > maxLength) {
          maxLength = length;
          longestSequence = [...currentSequence];

          newSteps.push({
            description: `New longest sequence found! Length: ${maxLength}`,
            currentNum: num,
            visited: new Set(visited),
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence],
            maxLength,
            checking: null,
          });
        }
      } else {
        newSteps.push({
          description: `${num} is not the start (${num - 1} exists), skip it`,
          currentNum: null,
          visited: new Set(newSteps[newSteps.length - 1].visited),
          currentSequence: [],
          longestSequence: [...longestSequence],
          maxLength,
          checking: null,
        });
      }
    }

    newSteps.push({
      description: `Complete! Longest consecutive sequence has length ${maxLength}`,
      currentNum: null,
      visited: new Set(),
      currentSequence: [],
      longestSequence: [...longestSequence],
      maxLength,
      checking: null,
    });

    return newSteps;
  };

  const handleStart = () => {
    const steps = generateSteps(inputArray);
    setSteps(steps);
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
    setSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const arr = e.target.value
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    setInputArray(arr);
    handleReset();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Longest Consecutive Sequence - HashSet Approach
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-300">Array:</label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100, 4, 200, 1, 3, 2"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={steps.length > 0}
            className="btn btn-primary btn-sm disabled:opacity-50"
          >
            Start
          </button>

          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || steps.length === 0}
            className="btn btn-outline btn-sm disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={steps.length === 0 || currentStepIndex >= steps.length - 1}
            className="btn btn-success btn-sm disabled:opacity-50"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex >= steps.length - 1 || steps.length === 0}
            className="btn btn-outline btn-sm disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>

          <button onClick={handleReset} className="btn btn-outline btn-sm">
            <RotateCcw size={16} />
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Speed:</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="range range-xs range-primary w-24"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {currentStep?.description || 'Click "Start" to begin visualization'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        {inputArray.map((num, idx) => {
          let bgColor = 'bg-gray-200 dark:bg-gray-600';
          let textColor = 'text-gray-900 dark:text-white';
          let border = 'border-2 border-transparent';

          if (currentStep) {
            if (currentStep.currentNum === num) {
              bgColor = 'bg-blue-500 dark:bg-blue-600';
              textColor = 'text-white';
              border = 'border-2 border-blue-700';
            } else if (currentStep.visited.has(num)) {
              bgColor = 'bg-purple-300 dark:bg-purple-700';
              textColor = 'text-gray-900 dark:text-white';
            } else if (currentStep.checking === num) {
              bgColor = 'bg-yellow-300 dark:bg-yellow-600';
              textColor = 'text-gray-900 dark:text-white';
            } else if (currentStep.currentSequence.includes(num)) {
              bgColor = 'bg-green-400 dark:bg-green-600';
              textColor = 'text-white';
            } else if (currentStep.longestSequence.includes(num)) {
              bgColor = 'bg-green-200 dark:bg-green-800';
              textColor = 'text-gray-900 dark:text-white';
            }
          }

          return (
            <div
              key={idx}
              className={`flex items-center justify-center w-16 h-16 rounded-lg ${bgColor} ${textColor} ${border} font-bold text-lg transition-all duration-300`}
            >
              {num}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
          <div className="card-body p-4">
            <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Current Sequence</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStep?.currentSequence.length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {currentStep?.currentSequence.join(', ') || '-'}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
          <div className="card-body p-4">
            <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Max Length</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentStep?.maxLength || 0}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
          <div className="card-body p-4">
            <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Longest Sequence</h3>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {currentStep?.longestSequence.join(', ') || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Algorithm Explanation</h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Time Complexity:</strong> O(n) - Each number is visited at most twice</p>
          <p><strong>Space Complexity:</strong> O(n) - HashSet stores all numbers</p>
          <div className="mt-2">
            <p className="font-semibold">Key Insight:</p>
            <p>Only start counting from numbers that are the beginning of a sequence (num-1 not in set)</p>
          </div>
        </div>
      </div>
    </div>
  );
}