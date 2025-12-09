// filename: ProductArrayDivision.tsx
import React, { useState } from 'react';

export default function ProductArrayDivision() {
  const [array, setArray] = useState([2, 3, 4, 5]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [totalProduct, setTotalProduct] = useState<number | null>(null);
  const [result, setResult] = useState<number[]>([]);
  const [zeroCount, setZeroCount] = useState(0);
  const [zeroIndex, setZeroIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'counting' | 'calculating' | 'dividing' | 'complete'>('idle');
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasZero, setHasZero] = useState(false);

  const reset = () => {
    setCurrentIndex(null);
    setTotalProduct(null);
    setResult([]);
    setZeroCount(0);
    setZeroIndex(null);
    setPhase('idle');
    setSteps([]);
    setCurrentStep(0);
    setHasZero(false);
  };

  const startVisualization = () => {
    reset();
    const n = array.length;
    const newSteps: string[] = [];
    
    newSteps.push('Note: Division approach (not allowed in original problem, but educational)');
    
    // Count zeros
    let zeros = 0;
    let zIdx = -1;
    for (let i = 0; i < n; i++) {
      if (array[i] === 0) {
        zeros++;
        zIdx = i;
        newSteps.push(`Found zero at index ${i}`);
      }
    }
    
    if (zeros > 1) {
      newSteps.push('Multiple zeros found - all results will be 0');
    } else if (zeros === 1) {
      newSteps.push(`One zero at index ${zIdx} - special handling needed`);
      newSteps.push('Calculate product of non-zero elements');
      newSteps.push(`Only result[${zIdx}] will be non-zero`);
    } else {
      newSteps.push('No zeros - calculate total product of all elements');
      let prod = 1;
      for (let i = 0; i < n; i++) {
        newSteps.push(`Total product: ${prod} × ${array[i]} = ${prod * array[i]}`);
        prod *= array[i];
      }
      
      for (let i = 0; i < n; i++) {
        newSteps.push(`Result[${i}] = ${prod} ÷ ${array[i]} = ${prod / array[i]}`);
      }
    }
    
    newSteps.push('Complete! (Remember: Division not allowed in O(n) constraint)');
    
    setSteps(newSteps);
    setPhase('counting');
    setCurrentIndex(0);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setPhase('complete');
      return;
    }

    const n = array.length;
    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Found zero at index')) {
      const match = step.match(/index (\d+)/);
      if (match) {
        const idx = parseInt(match[1]);
        setCurrentIndex(idx);
        setZeroCount(prev => prev + 1);
        setZeroIndex(idx);
        setHasZero(true);
        setPhase('counting');
      }
    } else if (step.includes('Multiple zeros')) {
      setPhase('complete');
      setResult(new Array(n).fill(0));
      setCurrentIndex(null);
    } else if (step.includes('One zero')) {
      setPhase('calculating');
    } else if (step.includes('product of non-zero')) {
      let prod = 1;
      for (let i = 0; i < n; i++) {
        if (array[i] !== 0) prod *= array[i];
      }
      setTotalProduct(prod);
      const newResult = new Array(n).fill(0);
      if (zeroIndex !== null) {
        newResult[zeroIndex] = prod;
      }
      setResult(newResult);
    } else if (step.includes('Total product:')) {
      const match = step.match(/= (\d+)/);
      if (match) {
        setTotalProduct(parseInt(match[1]));
        setPhase('calculating');
      }
      const idx = step.match(/× (\d+)/);
      if (idx) {
        const valMatch = array.findIndex(v => v === parseInt(idx[1]));
        setCurrentIndex(valMatch);
      }
    } else if (step.includes('Result[') && step.includes('÷')) {
      const match = step.match(/Result\[(\d+)\]/);
      const valueMatch = step.match(/= (\d+)/);
      if (match && valueMatch) {
        const idx = parseInt(match[1]);
        const value = parseInt(valueMatch[1]);
        setCurrentIndex(idx);
        setPhase('dividing');
        
        const newResult = [...result];
        newResult[idx] = value;
        setResult(newResult);
      }
    } else if (step.includes('Complete')) {
      setPhase('complete');
      setCurrentIndex(null);
    } else if (step.includes('No zeros')) {
      setPhase('calculating');
      setCurrentIndex(0);
    }
  };

  const handleArrayChange = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    const newArray = [...array];
    newArray[index] = num;
    setArray(newArray);
    reset();
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Product of Array Except Self - Division Approach</h2>
        
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This approach uses division, which is typically not allowed in the problem constraints. 
            This is for educational purposes to understand the concept.
          </p>
        </div>
        
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
        </div>

        <div className="text-sm bg-orange-50 dark:bg-orange-900 p-3 rounded-md font-medium text-orange-900 dark:text-orange-100 mb-4">
          {currentStep < steps.length ? steps[currentStep] : 'Click "Start Visualization" to begin'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Total Product</h4>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {totalProduct !== null ? totalProduct : '-'}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Zero Count</h4>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">{zeroCount}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Current Phase</h4>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300 capitalize">{phase}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Input Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((num, index) => (
                <div key={index} className="flex flex-col items-center">
                  <input
                    type="number"
                    value={num}
                    onChange={(e) => handleArrayChange(index, e.target.value)}
                    disabled={phase !== 'idle'}
                    className={`w-16 h-16 text-center border-2 rounded-md font-bold text-lg ${
                      currentIndex === index
                        ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900'
                        : num === 0
                          ? 'border-red-500 bg-red-100 dark:bg-red-900'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } text-gray-900 dark:text-white`}
                  />
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Result Array</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 flex items-center justify-center border-2 rounded-md font-bold text-lg ${
                    result[index] !== undefined
                      ? currentIndex === index && phase === 'dividing'
                        ? 'border-green-500 bg-green-100 dark:bg-green-900 text-gray-900 dark:text-white'
                        : 'border-green-300 bg-green-50 dark:bg-green-800 text-gray-900 dark:text-white'
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
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Division Approach Explanation</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Calculate Total Product:</strong> Multiply all elements together</li>
          <li><strong>Divide for Each Element:</strong> result[i] = totalProduct / array[i]</li>
          <li><strong>Handle Zeros:</strong> Special cases when array contains zeros</li>
          <li className="text-red-600 dark:text-red-400"><strong>Limitation:</strong> Division not allowed in the original problem</li>
          <li className="text-red-600 dark:text-red-400"><strong>Limitation:</strong> Division can cause precision issues with floating point numbers</li>
          <li><strong>Time Complexity:</strong> O(n) - one or two passes</li>
          <li><strong>Space Complexity:</strong> O(1) - only storing total product</li>
        </ol>
      </div>
    </div>
  );
}