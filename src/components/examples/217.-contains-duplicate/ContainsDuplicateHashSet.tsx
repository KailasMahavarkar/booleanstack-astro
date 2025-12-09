// filename: ContainsDuplicateHashSet.tsx
import React, { useState } from 'react';

export default function ContainsDuplicateHashSet() {
  const [array, setArray] = useState([1, 2, 3, 4, 5, 6, 7, 3, 9]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [seenSet, setSeenSet] = useState<Set<number>>(new Set());
  const [duplicateFound, setDuplicateFound] = useState<boolean | null>(null);
  const [duplicateValue, setDuplicateValue] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('1,2,3,4,5,6,7,3,9');

  const reset = () => {
    setCurrentIndex(null);
    setSeenSet(new Set());
    setDuplicateFound(null);
    setDuplicateValue(null);
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const startAlgorithm = () => {
    reset();
    const newSteps: string[] = [];
    const seen = new Set<number>();

    newSteps.push('Initialize empty hash set to track seen numbers');

    for (let i = 0; i < array.length; i++) {
      const num = array[i];
      if (seen.has(num)) {
        newSteps.push(`Check ${num} at index ${i}: Already in set! Duplicate found.`);
        break;
      } else {
        newSteps.push(`Check ${num} at index ${i}: Not in set. Add to set.`);
        seen.add(num);
      }
    }

    if (seen.size === array.length) {
      newSteps.push('Checked all elements. No duplicates found.');
    }

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
      return;
    }

    if (step.includes('No duplicates found')) {
      setDuplicateFound(false);
      setCurrentIndex(array.length - 1);
      return;
    }

    const indexMatch = step.match(/index (\d+)/);
    if (indexMatch) {
      const index = parseInt(indexMatch[1]);
      setCurrentIndex(index);

      if (step.includes('Duplicate found')) {
        setDuplicateFound(true);
        setDuplicateValue(array[index]);
      } else {
        const newSeen = new Set(seenSet);
        newSeen.add(array[index]);
        setSeenSet(newSeen);
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
    const length = 8 + Math.floor(Math.random() * 5);
    const newArray = Array.from({ length }, () => Math.floor(Math.random() * 10) + 1);
    setArray(newArray);
    setInputValue(newArray.join(','));
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Contains Duplicate - Hash Set Approach</h2>
        
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
                placeholder="e.g., 1,2,3,4,5"
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

            if (currentIndex !== null) {
              if (index < currentIndex) {
                bgColor = 'bg-gray-300 dark:bg-gray-600';
                textColor = 'text-gray-500 dark:text-gray-400';
              } else if (index === currentIndex) {
                if (duplicateFound) {
                  bgColor = 'bg-red-500';
                  textColor = 'text-white';
                  border = 'border-2 border-red-700';
                } else {
                  bgColor = 'bg-yellow-400';
                  textColor = 'text-gray-900';
                  border = 'border-2 border-yellow-600';
                }
              }
            }

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-md ${bgColor} ${textColor} ${border} transition-all duration-300`}
              >
                <div className="font-bold text-lg">{num}</div>
                <div className="text-xs opacity-70">[{index}]</div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-2 dark:text-white">Hash Set Contents:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(seenSet).length === 0 ? (
              <span className="text-gray-500 dark:text-gray-400 italic">Empty</span>
            ) : (
              Array.from(seenSet).map((num) => (
                <div
                  key={num}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md font-medium"
                >
                  {num}
                </div>
              ))
            )}
          </div>
        </div>

        {duplicateFound !== null && (
          <div className={`mt-4 p-4 rounded-lg ${duplicateFound ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
            <div className={`font-bold text-lg ${duplicateFound ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
              {duplicateFound ? `✗ Duplicate Found: ${duplicateValue}` : '✓ No Duplicates'}
            </div>
          </div>
        )}
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 dark:text-white">Algorithm Explanation</h3>
        <p className="mb-3 dark:text-gray-300">
          The hash set approach uses a Set data structure to track numbers we've already seen:
        </p>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Initialize an empty hash set</li>
          <li>Iterate through each element in the array</li>
          <li>For each element, check if it exists in the set</li>
          <li>If yes, we found a duplicate - return true</li>
          <li>If no, add the element to the set and continue</li>
          <li>If we finish the loop without finding duplicates, return false</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="font-semibold dark:text-blue-100">Time Complexity: O(n)</p>
          <p className="font-semibold dark:text-blue-100">Space Complexity: O(n)</p>
        </div>
      </div>
    </div>
  );
}