// filename: TwoSumInteractive.tsx
import React, { useState } from 'react';
import { Play, RotateCcw, Trash2, Plus } from 'lucide-react';

interface TestCase {
  array: number[];
  target: number;
  expected: [number, number] | null;
}

export default function TwoSumInteractive() {
  const [array, setArray] = useState<number[]>([2, 7, 11, 15]);
  const [target, setTarget] = useState<number>(9);
  const [leftPointer, setLeftPointer] = useState<number>(0);
  const [rightPointer, setRightPointer] = useState<number>(array.length - 1);
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<[number, number] | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<string>('');

  const predefinedTests: TestCase[] = [
    { array: [2, 7, 11, 15], target: 9, expected: [1, 2] },
    { array: [2, 3, 4], target: 6, expected: [1, 3] },
    { array: [-1, 0], target: -1, expected: [1, 2] },
    { array: [1, 2, 3, 4, 5, 6, 7], target: 13, expected: [6, 7] },
  ];

  const handleStart = () => {
    setIsStarted(true);
    setLeftPointer(0);
    setRightPointer(array.length - 1);
    setHistory(['Game started! Use the buttons to move pointers.']);
    setResult(null);
    setAttempts(0);
  };

  const handleReset = () => {
    setIsStarted(false);
    setLeftPointer(0);
    setRightPointer(array.length - 1);
    setHistory([]);
    setResult(null);
    setAttempts(0);
  };

  const checkSum = () => {
    if (!isStarted || leftPointer >= rightPointer) return;

    const sum = array[leftPointer] + array[rightPointer];
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (sum === target) {
      setResult([leftPointer + 1, rightPointer + 1]);
      setHistory([...history, `✅ Success! Found ${array[leftPointer]} + ${array[rightPointer]} = ${target}. Solution: [${leftPointer + 1}, ${rightPointer + 1}] in ${newAttempts} attempts!`]);
    } else if (sum < target) {
      setHistory([...history, `${array[leftPointer]} + ${array[rightPointer]} = ${sum} < ${target}. Try moving left pointer right.`]);
    } else {
      setHistory([...history, `${array[leftPointer]} + ${array[rightPointer]} = ${sum} > ${target}. Try moving right pointer left.`]);
    }
  };

  const moveLeft = () => {
    if (!isStarted || leftPointer >= rightPointer - 1) return;
    const newLeft = leftPointer + 1;
    setLeftPointer(newLeft);
    setHistory([...history, `Moved left pointer to index ${newLeft} (value: ${array[newLeft]})`]);
  };

  const moveRight = () => {
    if (!isStarted || rightPointer <= leftPointer + 1) return;
    const newRight = rightPointer - 1;
    setRightPointer(newRight);
    setHistory([...history, `Moved right pointer to index ${newRight} (value: ${array[newRight]})`]);
  };

  const loadTestCase = (testCase: TestCase) => {
    setArray(testCase.array);
    setTarget(testCase.target);
    handleReset();
  };

  const addValue = () => {
    const value = parseInt(newValue);
    if (!isNaN(value)) {
      const newArray = [...array, value].sort((a, b) => a - b);
      setArray(newArray);
      setNewValue('');
      handleReset();
    }
  };

  const removeValue = (index: number) => {
    const newArray = array.filter((_, i) => i !== index);
    setArray(newArray);
    handleReset();
  };

  const getCurrentSum = () => {
    if (!isStarted) return null;
    return array[leftPointer] + array[rightPointer];
  };

  const currentSum = getCurrentSum();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Two Sum II - Interactive Practice
      </h1>

      {/* Test Cases */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Quick Test Cases:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {predefinedTests.map((test, idx) => (
            <button
              key={idx}
              onClick={() => loadTestCase(test)}
              className="btn btn-sm btn-outline"
            >
              [{test.array.join(', ')}], {test.target}
            </button>
          ))}
        </div>
      </div>

      {/* Array Editor */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Array Editor</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {array.map((num, idx) => (
            <div key={idx} className="relative group">
              <div className="w-14 h-14 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg font-bold text-gray-900 dark:text-white">
                {num}
              </div>
              <button
                onClick={() => removeValue(idx)}
                className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addValue()}
              placeholder="Add"
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button onClick={addValue} className="btn btn-sm btn-circle btn-success">
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target:</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Game Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleStart}
            disabled={isStarted}
            className="btn btn-success"
          >
            <Play size={20} /> Start Game
          </button>
          <button
            onClick={handleReset}
            className="btn btn-error"
          >
            <RotateCcw size={20} /> Reset
          </button>
          <div className="divider divider-horizontal"></div>
          <button
            onClick={moveLeft}
            disabled={!isStarted || leftPointer >= rightPointer - 1 || result !== null}
            className="btn btn-primary"
          >
            Move Left →
          </button>
          <button
            onClick={moveRight}
            disabled={!isStarted || rightPointer <= leftPointer + 1 || result !== null}
            className="btn btn-secondary"
          >
            ← Move Right
          </button>
          <button
            onClick={checkSum}
            disabled={!isStarted || leftPointer >= rightPointer || result !== null}
            className="btn btn-accent"
          >
            Check Sum
          </button>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {array.map((num, idx) => {
            let className = 'w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300';
            let bgColor = 'bg-white dark:bg-gray-800';
            let borderColor = 'border-gray-300 dark:border-gray-600';
            let textColor = 'text-gray-900 dark:text-white';

            if (isStarted) {
              if (result && (idx === leftPointer || idx === rightPointer)) {
                bgColor = 'bg-green-500';
                borderColor = 'border-green-700';
                textColor = 'text-white';
              } else if (idx === leftPointer) {
                bgColor = 'bg-blue-500';
                borderColor = 'border-blue-700';
                textColor = 'text-white';
              } else if (idx === rightPointer) {
                bgColor = 'bg-red-500';
                borderColor = 'border-red-700';
                textColor = 'text-white';
              } else if (idx > leftPointer && idx < rightPointer) {
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
                  <div className="text-xs opacity-70">{idx}</div>
                </div>
                {isStarted && idx === leftPointer && (
                  <div className="badge badge-primary badge-sm">Left</div>
                )}
                {isStarted && idx === rightPointer && (
                  <div className="badge badge-secondary badge-sm">Right</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      {isStarted && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Left Value</div>
              <div className="stat-value text-blue-600 dark:text-blue-400">{array[leftPointer]}</div>
              <div className="stat-desc">Index: {leftPointer}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Right Value</div>
              <div className="stat-value text-red-600 dark:text-red-400">{array[rightPointer]}</div>
              <div className="stat-desc">Index: {rightPointer}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Current Sum</div>
              <div className="stat-value text-purple-600 dark:text-purple-400">{currentSum}</div>
              <div className="stat-desc">Target: {target}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Attempts</div>
              <div className="stat-value text-orange-600 dark:text-orange-400">{attempts}</div>
              <div className="stat-desc">Checks made</div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">History</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No actions yet. Start the game!</p>
          ) : (
            history.map((entry, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm ${
                  entry.includes('✅')
                    ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {entry}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100">How to Play</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>Click "Start Game" to begin</li>
          <li>Use "Move Left →" to move the left pointer right</li>
          <li>Use "← Move Right" to move the right pointer left</li>
          <li>Click "Check Sum" to verify if current sum equals target</li>
          <li>Try to find the solution in minimum attempts!</li>
        </ol>
      </div>
    </div>
  );
}