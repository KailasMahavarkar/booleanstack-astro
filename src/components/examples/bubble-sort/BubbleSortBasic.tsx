// filename: BubbleSortBasic.tsx
import React, { useState } from 'react';

export default function BubbleSortBasic() {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  const [sortedUntil, setSortedUntil] = useState<number>(array.length);
  const [isComplete, setIsComplete] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [swapCount, setSwapCount] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);

  const reset = () => {
    setCurrentIndex(null);
    setComparingIndex(null);
    setSortedUntil(array.length);
    setIsComplete(false);
    setSteps([]);
    setCurrentStep(0);
    setSwapCount(0);
    setComparisonCount(0);
  };

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    reset();
    setSortedUntil(newArray.length);
  };

  const startSort = () => {
    reset();
    const newSteps: { array: number[]; i: number; j: number; message: string; swapped: boolean }[] = [];
    const arr = [...array];
    let swaps = 0;
    let comparisons = 0;

    for (let i = 0; i < arr.length - 1; i++) {
      let swappedInPass = false;
      for (let j = 0; j < arr.length - i - 1; j++) {
        comparisons++;
        if (arr[j] > arr[j + 1]) {
          newSteps.push({
            array: [...arr],
            i,
            j,
            message: `Comparing ${arr[j]} > ${arr[j + 1]}: Swap needed`,
            swapped: true,
          });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          swappedInPass = true;
        } else {
          newSteps.push({
            array: [...arr],
            i,
            j,
            message: `Comparing ${arr[j]} <= ${arr[j + 1]}: No swap`,
            swapped: false,
          });
        }
      }
      newSteps.push({
        array: [...arr],
        i,
        j: -1,
        message: `Pass ${i + 1} complete. Element ${arr[arr.length - i - 1]} is in final position.`,
        swapped: false,
      });
      if (!swappedInPass) break;
    }

    newSteps.push({
      array: [...arr],
      i: -1,
      j: -1,
      message: `Sorting complete! Total swaps: ${swaps}, Total comparisons: ${comparisons}`,
      swapped: false,
    });

    setSteps(newSteps.map(s => s.message));
    setSwapCount(swaps);
    setComparisonCount(comparisons);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      setCurrentIndex(null);
      setComparingIndex(null);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('complete!')) {
      setIsComplete(true);
      setCurrentIndex(null);
      setComparingIndex(null);
      setSortedUntil(0);
      return;
    }

    const passMatch = step.match(/Pass (\d+) complete/);
    if (passMatch) {
      const passNum = parseInt(passMatch[1]);
      setSortedUntil(array.length - passNum);
      setCurrentIndex(null);
      setComparingIndex(null);
      return;
    }

    const compareMatch = step.match(/Comparing (\d+)/);
    if (compareMatch) {
      const i = Math.floor(currentStep / (array.length - 1));
      const j = currentStep % (array.length - 1);
      setCurrentIndex(j);
      setComparingIndex(j + 1);

      if (step.includes('Swap needed')) {
        const newArray = [...array];
        [newArray[j], newArray[j + 1]] = [newArray[j + 1], newArray[j]];
        setArray(newArray);
      }
    }
  };

  const autoPlay = () => {
    if (steps.length === 0) {
      startSort();
    }
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Bubble Sort Visualizer</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={generateRandomArray}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
          >
            Generate Random Array
          </button>
          <button
            onClick={startSort}
            disabled={steps.length > 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Sort
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
          >
            Reset
          </button>
        </div>

        <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100 mb-6">
          {currentStep < steps.length ? steps[currentStep] : "Click 'Start Sort' to begin"}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {array.map((num, index) => {
            let bgColor = 'bg-gray-200 dark:bg-gray-700';
            let textColor = 'text-gray-900 dark:text-gray-100';
            let scale = 'scale-100';

            if (index >= sortedUntil) {
              bgColor = 'bg-green-500 dark:bg-green-600';
              textColor = 'text-white';
            } else if (index === currentIndex || index === comparingIndex) {
              bgColor = 'bg-yellow-400 dark:bg-yellow-500';
              textColor = 'text-gray-900';
              scale = 'scale-110';
            }

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${bgColor} ${textColor} ${scale} transition-all duration-300 shadow-md`}
              >
                <div className="font-bold text-lg">{num}</div>
                <div className="text-xs opacity-75">{index}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Comparisons</div>
            <div className="text-xl font-bold dark:text-white">{comparisonCount}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Swaps</div>
            <div className="text-xl font-bold dark:text-white">{swapCount}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Index</div>
            <div className="text-xl font-bold dark:text-white">{currentIndex !== null ? currentIndex : '-'}</div>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Sorted Until</div>
            <div className="text-xl font-bold dark:text-white">{sortedUntil < array.length ? sortedUntil : 'All'}</div>
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">How Bubble Sort Works</h2>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Compare adjacent elements in the array</li>
          <li>If they are in wrong order (left &gt; right), swap them</li>
          <li>Continue through the array until the end</li>
          <li>The largest element "bubbles up" to the end</li>
          <li>Repeat for remaining unsorted elements</li>
          <li>Stop when no swaps are needed in a complete pass</li>
        </ol>
      </div>
    </div>
  );
}