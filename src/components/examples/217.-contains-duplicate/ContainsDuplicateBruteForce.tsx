// filename: ContainsDuplicateBruteForce.tsx
import React, { useState } from 'react';

export default function ContainsDuplicateBruteForce() {
  const [array, setArray] = useState([3, 1, 4, 1, 5, 9]);
  const [outerIndex, setOuterIndex] = useState<number | null>(null);
  const [innerIndex, setInnerIndex] = useState<number | null>(null);
  const [duplicateFound, setDuplicateFound] = useState<boolean | null>(null);
  const [duplicateValue, setDuplicateValue] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [inputValue, setInputValue] = useState('3,1,4,1,5,9');

  const reset = () => {
    setOuterIndex(null);
    setInnerIndex(null);
    setDuplicateFound(null);
    setDuplicateValue(null);
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
    setComparisonCount(0);
  };

  const startAlgorithm = () => {
    reset();
    const newSteps: string[] = [];
    let comparisons = 0;

    newSteps.push('Start brute force: compare each element with every other element');

    let found = false;
    for (let i = 0; i < array.length && !found; i++) {
      for (let j = i + 1; j < array.length && !found; j++) {
        comparisons++;
        if (array[i] === array[j]) {
          newSteps.push(`Compare array[${i}]=${array[i]} with array[${j}]=${array[j]}: MATCH! Duplicate found.`);
          found = true;
        } else {
          newSteps.push(`Compare array[${i}]=${array[i]} with array[${j}]=${array[j]}: Different`);
        }
      }
    }

    if (!found) {
      newSteps.push('Checked all pairs. No duplicates found.');
    }

    newSteps.push(`Total comparisons: ${comparisons}`);
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Start brute force')) {
      return;
    }

    if (step.includes('No duplicates found')) {
      setDuplicateFound(false);
      setOuterIndex(null);
      setInnerIndex(null);
      return;
    }

    if (step.includes('Total comparisons')) {
      const countMatch = step.match(/Total comparisons: (\d+)/);
      if (countMatch) {
        setComparisonCount(parseInt(countMatch[1]));
      }
      return;
    }

    const compareMatch = step.match(/array\[(\d+)\]=(\d+) with array\[(\d+)\]=(\d+)/);
    if (compareMatch) {
      const i = parseInt(compareMatch[1]);
      const j = parseInt(compareMatch[3]);
      setOuterIndex(i);
      setInnerIndex(j);

      if (step.includes('MATCH')) {
        setDuplicateFound(true);
        setDuplicateValue(array[i]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const applyArray = () => {
    const newArray = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (newArray.length > 0) {
      setArray(newArray);
      reset();
    }
  };

  const generateRandomArray = () => {
    const length = 5 + Math.floor(Math.random() * 4);
    const newArray = Array.from({ length }, () => Math.floor(Math.random() * 8) + 1);
    setArray(newArray);
    setInputValue(newArray.join(','));
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Contains Duplicate - Brute Force Approach</h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <label htmlFor="arrayInput" className="font-medium dark:text-white">
                Array:
              </label>
              <input
                id="arrayInput"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3,1,4,1,5,9"
              />
            </div>
            <button
              onClick={applyArray}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={generateRandomArray}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Random
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={startAlgorithm}
              disabled={steps.length > 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Start Algorithm
            </button>
            <button
              onClick={nextStep}
              disabled={steps.length === 0 || isComplete}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${steps.length === 0 || isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next Step →
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100">
            {currentStep < steps.length ? steps[currentStep] : "Click 'Start Algorithm' to begin"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {array.map((num, index) => {
            let bgColor = 'bg-gray-200 dark:bg-gray-700';
            let textColor = 'text-gray-900 dark:text-white';
            let border = 'border-2 border-transparent';
            let scale = 'scale-100';

            if (outerIndex !== null && innerIndex !== null) {
              if (index === outerIndex) {
                bgColor = 'bg-blue-500';
                textColor = 'text-white';
                border = 'border-2 border-blue-700';
                scale = 'scale-110';
                if (duplicateFound) {
                  bgColor = 'bg-red-500';
                  border = 'border-2 border-red-700';
                }
              } else if (index === innerIndex) {
                bgColor = 'bg-purple-500';
                textColor = 'text-white';
                border = 'border-2 border-purple-700';
                scale = 'scale-110';
                if (duplicateFound) {
                  bgColor = 'bg-red-500';
                  border = 'border-2 border-red-700';
                }
              } else if (index < outerIndex) {
                bgColor = 'bg-gray-300 dark:bg-gray-600';
                textColor = 'text-gray-500 dark:text-gray-400';
              }
            }

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-md ${bgColor} ${textColor} ${border} ${scale} transition-all duration-300`}
              >
                <div className="font-bold text-lg">{num}</div>
                <div className="text-xs opacity-70">[{index}]</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-200">Outer Loop (i)</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {outerIndex !== null ? outerIndex : '-'}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-700 dark:text-purple-200">Inner Loop (j)</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {innerIndex !== null ? innerIndex : '-'}
            </div>
          </div>
        </div>

        {comparisonCount > 0 && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Comparisons Made</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{comparisonCount}</div>
          </div>
        )}

        {duplicateFound !== null && (
          <div className={`p-4 rounded-lg ${duplicateFound ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
            <div className={`font-bold text-lg ${duplicateFound ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
              {duplicateFound ? `✗ Duplicate Found: ${duplicateValue}` : '✓ No Duplicates'}
            </div>
          </div>
        )}
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 dark:text-white">Algorithm Explanation</h3>
        <p className="mb-3 dark:text-gray-300">
          The brute force approach compares every element with every other element:
        </p>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Use nested loops to compare each pair of elements</li>
          <li>Outer loop (i) goes from 0 to n-1</li>
          <li>Inner loop (j) goes from i+1 to n</li>
          <li>Compare array[i] with array[j]</li>
          <li>If they match, we found a duplicate - return true</li>
          <li>If no matches found after all comparisons, return false</li>
        </ol>
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-md">
          <p className="font-semibold text-red-800 dark:text-red-200">Time Complexity: O(n²) - Very inefficient!</p>
          <p className="font-semibold text-green-800 dark:text-green-200">Space Complexity: O(1) - No extra space needed</p>
        </div>
        <p className="mt-3 text-sm dark:text-gray-400 italic">
          Note: This is the least efficient approach but requires no extra space.
        </p>
      </div>
    </div>
  );
}