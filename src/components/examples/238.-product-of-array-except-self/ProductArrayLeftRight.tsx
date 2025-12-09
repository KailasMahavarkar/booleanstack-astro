// filename: ProductArrayLeftRight.tsx
import React, { useState } from 'react';

export default function ProductArrayLeftRight() {
  const [array, setArray] = useState([1, 2, 3, 4]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [leftProducts, setLeftProducts] = useState<number[]>([]);
  const [rightProducts, setRightProducts] = useState<number[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [phase, setPhase] = useState<'idle' | 'left' | 'right' | 'multiply' | 'complete'>('idle');
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const reset = () => {
    setCurrentIndex(null);
    setLeftProducts([]);
    setRightProducts([]);
    setResult([]);
    setPhase('idle');
    setSteps([]);
    setCurrentStep(0);
  };

  const startVisualization = () => {
    reset();
    const n = array.length;
    const newSteps: string[] = [];
    
    newSteps.push('Initialize: We will compute left and right products separately');
    
    // Left products
    for (let i = 0; i < n; i++) {
      if (i === 0) {
        newSteps.push(`Left[${i}] = 1 (no elements to the left)`);
      } else {
        newSteps.push(`Left[${i}] = Left[${i-1}] × array[${i-1}] = ${i > 1 ? leftProducts[i-1] : 1} × ${array[i-1]}`);
      }
    }
    
    // Right products
    for (let i = n - 1; i >= 0; i--) {
      if (i === n - 1) {
        newSteps.push(`Right[${i}] = 1 (no elements to the right)`);
      } else {
        newSteps.push(`Right[${i}] = Right[${i+1}] × array[${i+1}]`);
      }
    }
    
    // Multiply
    for (let i = 0; i < n; i++) {
      newSteps.push(`Result[${i}] = Left[${i}] × Right[${i}]`);
    }
    
    newSteps.push('Complete! Result contains product of all elements except self');
    
    setSteps(newSteps);
    setPhase('left');
    setCurrentIndex(0);
    setLeftProducts([1]);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setPhase('complete');
      return;
    }

    const n = array.length;
    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Left[')) {
      const match = step.match(/Left\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]);
        setCurrentIndex(idx);
        setPhase('left');
        
        const newLeft = [...leftProducts];
        if (idx === 0) {
          newLeft[0] = 1;
        } else {
          newLeft[idx] = newLeft[idx - 1] * array[idx - 1];
        }
        setLeftProducts(newLeft);
      }
    } else if (step.includes('Right[')) {
      const match = step.match(/Right\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]);
        setCurrentIndex(idx);
        setPhase('right');
        
        const newRight = [...rightProducts];
        if (idx === n - 1) {
          newRight[idx] = 1;
        } else {
          newRight[idx] = (newRight[idx + 1] || 1) * array[idx + 1];
        }
        setRightProducts(newRight);
      }
    } else if (step.includes('Result[')) {
      const match = step.match(/Result\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]);
        setCurrentIndex(idx);
        setPhase('multiply');
        
        const newResult = [...result];
        newResult[idx] = (leftProducts[idx] || 1) * (rightProducts[idx] || 1);
        setResult(newResult);
      }
    } else if (step.includes('Complete')) {
      setPhase('complete');
      setCurrentIndex(null);
    }
  };

  const handleArrayChange = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    const newArray = [...array];
    newArray[index] = num;
    setArray(newArray);
    reset();
  };

  const addElement = () => {
    setArray([...array, 1]);
    reset();
  };

  const removeElement = () => {
    if (array.length > 2) {
      setArray(array.slice(0, -1));
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Product of Array Except Self - Left/Right Method</h2>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={startVisualization}
            disabled={phase !== 'idle'}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${phase !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Visualization
          </button>
          <button
            onClick={nextStep}
            disabled={phase === 'idle' || phase === 'complete'}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${phase === 'idle' || phase === 'complete' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next Step
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
          >
            Reset
          </button>
          <button
            onClick={addElement}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
          >
            Add Element
          </button>
          <button
            onClick={removeElement}
            disabled={array.length <= 2}
            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white ${array.length <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Remove Element
          </button>
        </div>

        <div className="text-sm bg-blue-50 dark:bg-blue-900 p-3 rounded-md font-medium text-blue-900 dark:text-blue-100 mb-4">
          {currentStep < steps.length ? steps[currentStep] : 'Click "Start Visualization" to begin'}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Input Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, index) => (
                <div key={index} className="flex flex-col items-center">
                  <input
                    type="number"
                    value={num}
                    onChange={(e) => handleArrayChange(index, e.target.value)}
                    disabled={phase !== 'idle'}
                    className={`w-16 h-16 text-center border-2 rounded-md font-bold text-lg ${
                      currentIndex === index && phase !== 'idle'
                        ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } text-gray-900 dark:text-white`}
                  />
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Left Products</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 flex items-center justify-center border-2 rounded-md font-bold text-lg ${
                    leftProducts[index] !== undefined
                      ? currentIndex === index && phase === 'left'
                        ? 'border-green-500 bg-green-100 dark:bg-green-900 text-gray-900 dark:text-white'
                        : 'border-green-300 bg-green-50 dark:bg-green-800 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {leftProducts[index] !== undefined ? leftProducts[index] : '-'}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Right Products</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 flex items-center justify-center border-2 rounded-md font-bold text-lg ${
                    rightProducts[index] !== undefined
                      ? currentIndex === index && phase === 'right'
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-900 text-gray-900 dark:text-white'
                        : 'border-purple-300 bg-purple-50 dark:bg-purple-800 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {rightProducts[index] !== undefined ? rightProducts[index] : '-'}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Result (Left × Right)</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 flex items-center justify-center border-2 rounded-md font-bold text-lg ${
                    result[index] !== undefined
                      ? currentIndex === index && phase === 'multiply'
                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white'
                        : 'border-blue-300 bg-blue-50 dark:bg-blue-800 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {result[index] !== undefined ? result[index] : '-'}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Algorithm Explanation</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Left Products:</strong> For each index i, store the product of all elements to its left</li>
          <li><strong>Right Products:</strong> For each index i, store the product of all elements to its right</li>
          <li><strong>Final Result:</strong> Multiply left[i] × right[i] to get the product of all elements except array[i]</li>
          <li><strong>Time Complexity:</strong> O(n) - three passes through the array</li>
          <li><strong>Space Complexity:</strong> O(n) - for left and right arrays</li>
        </ol>
      </div>
    </div>
  );
}