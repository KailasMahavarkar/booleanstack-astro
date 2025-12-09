// filename: ContainsDuplicateSorting.tsx
import React, { useState } from 'react';

export default function ContainsDuplicateSorting() {
  const [originalArray] = useState([4, 2, 7, 1, 9, 2, 5]);
  const [sortedArray, setSortedArray] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);
  const [duplicateFound, setDuplicateFound] = useState<boolean | null>(null);
  const [duplicateValue, setDuplicateValue] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSorted, setIsSorted] = useState(false);

  const reset = () => {
    setSortedArray([]);
    setCurrentIndex(null);
    setCompareIndex(null);
    setDuplicateFound(null);
    setDuplicateValue(null);
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
    setIsSorted(false);
  };

  const startAlgorithm = () => {
    reset();
    const newSteps: string[] = [];
    const sorted = [...originalArray].sort((a, b) => a - b);

    newSteps.push(`Original array: [${originalArray.join(', ')}]`);
    newSteps.push(`Sorted array: [${sorted.join(', ')}]`);
    newSteps.push('Now check adjacent elements for duplicates');

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] === sorted[i + 1]) {
        newSteps.push(`Compare index ${i} (${sorted[i]}) with index ${i + 1} (${sorted[i + 1]}): DUPLICATE!`);
        break;
      } else {
        newSteps.push(`Compare index ${i} (${sorted[i]}) with index ${i + 1} (${sorted[i + 1]}): Different, continue`);
      }
    }

    if (sorted.length > 1 && sorted[sorted.length - 2] !== sorted[sorted.length - 1]) {
      newSteps.push('Checked all adjacent pairs. No duplicates found.');
    }

    setSteps(newSteps);
    setSortedArray(sorted);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Original array')) {
      return;
    }

    if (step.includes('Sorted array')) {
      setIsSorted(true);
      return;
    }

    if (step.includes('Now check adjacent')) {
      return;
    }

    if (step.includes('No duplicates found')) {
      setDuplicateFound(false);
      setCurrentIndex(sortedArray.length - 2);
      setCompareIndex(sortedArray.length - 1);
      return;
    }

    const indexMatch = step.match(/index (\d+)/);
    if (indexMatch) {
      const index = parseInt(indexMatch[1]);
      setCurrentIndex(index);
      setCompareIndex(index + 1);

      if (step.includes('DUPLICATE')) {
        setDuplicateFound(true);
        setDuplicateValue(sortedArray[index]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Contains Duplicate - Sorting Approach</h2>
        
        <div className="flex flex-col gap-4 mb-6">
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

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Original Array:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {originalArray.map((num, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                >
                  <div className="font-bold text-lg">{num}</div>
                  <div className="text-xs opacity-70">[{index}]</div>
                </div>
              ))}
            </div>
          </div>

          {isSorted && sortedArray.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 dark:text-white">Sorted Array:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {sortedArray.map((num, index) => {
                  let bgColor = 'bg-blue-200 dark:bg-blue-800';
                  let textColor = 'text-gray-900 dark:text-white';
                  let border = 'border-2 border-transparent';

                  if (currentIndex !== null && compareIndex !== null) {
                    if (index === currentIndex || index === compareIndex) {
                      if (duplicateFound) {
                        bgColor = 'bg-red-500';
                        textColor = 'text-white';
                        border = 'border-2 border-red-700';
                      } else {
                        bgColor = 'bg-yellow-400';
                        textColor = 'text-gray-900';
                        border = 'border-2 border-yellow-600';
                      }
                    } else if (index < currentIndex) {
                      bgColor = 'bg-green-200 dark:bg-green-800';
                      textColor = 'text-green-900 dark:text-green-100';
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
            </div>
          )}
        </div>

        {duplicateFound !== null && (
          <div className={`mt-6 p-4 rounded-lg ${duplicateFound ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
            <div className={`font-bold text-lg ${duplicateFound ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
              {duplicateFound ? `✗ Duplicate Found: ${duplicateValue}` : '✓ No Duplicates'}
            </div>
          </div>
        )}
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 dark:text-white">Algorithm Explanation</h3>
        <p className="mb-3 dark:text-gray-300">
          The sorting approach first sorts the array, then checks adjacent elements:
        </p>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Sort the array in ascending order</li>
          <li>Iterate through the sorted array</li>
          <li>Compare each element with its next neighbor</li>
          <li>If any two adjacent elements are equal, we found a duplicate</li>
          <li>If we finish checking all pairs without finding duplicates, return false</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="font-semibold dark:text-blue-100">Time Complexity: O(n log n) - due to sorting</p>
          <p className="font-semibold dark:text-blue-100">Space Complexity: O(1) or O(n) - depending on sort implementation</p>
        </div>
      </div>
    </div>
  );
}