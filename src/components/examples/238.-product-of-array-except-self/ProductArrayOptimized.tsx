// filename: ProductArrayOptimized.tsx
import React, { useState } from 'react';

export default function ProductArrayOptimized() {
  const [array, setArray] = useState([1, 2, 3, 4]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [result, setResult] = useState<number[]>([]);
  const [leftProduct, setLeftProduct] = useState(1);
  const [rightProduct, setRightProduct] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'forward' | 'backward' | 'complete'>('idle');
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [leftRunning, setLeftRunning] = useState(1);
  const [rightRunning, setRightRunning] = useState(1);

  const reset = () => {
    setCurrentIndex(null);
    setResult([]);
    setLeftProduct(1);
    setRightProduct(1);
    setPhase('idle');
    setSteps([]);
    setCurrentStep(0);
    setLeftRunning(1);
    setRightRunning(1);
  };

  const startVisualization = () => {
    reset();
    const n = array.length;
    const newSteps: string[] = [];
    
    newSteps.push('Initialize: result array and leftProduct = 1');
    
    // Forward pass
    for (let i = 0; i < n; i++) {
      newSteps.push(`Forward[${i}]: result[${i}] = leftProduct (${i === 0 ? 1 : 'accumulated'}), then leftProduct *= array[${i}]`);
    }
    
    newSteps.push('Start backward pass with rightProduct = 1');
    
    // Backward pass
    for (let i = n - 1; i >= 0; i--) {
      newSteps.push(`Backward[${i}]: result[${i}] *= rightProduct, then rightProduct *= array[${i}]`);
    }
    
    newSteps.push('Complete! Space optimized O(1) solution (excluding output array)');
    
    setSteps(newSteps);
    setPhase('forward');
    setCurrentIndex(0);
    setResult(new Array(n).fill(0));
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setPhase('complete');
      return;
    }

    const n = array.length;
    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Forward[')) {
      const match = step.match(/Forward\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]);
        setCurrentIndex(idx);
        setPhase('forward');
        
        const newResult = [...result];
        newResult[idx] = leftRunning;
        setResult(newResult);
        
        const newLeft = leftRunning * array[idx];
        setLeftRunning(newLeft);
        setLeftProduct(newLeft);
      }
    } else if (step.includes('backward pass')) {
      setPhase('backward');
      setCurrentIndex(n - 1);
      setRightRunning(1);
      setRightProduct(1);
    } else if (step.includes('Backward[')) {
      const match = step.match(/Backward\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]);
        setCurrentIndex(idx);
        setPhase('backward');
        
        const newResult = [...result];
        newResult[idx] = newResult[idx] * rightRunning;
        setResult(newResult);
        
        const newRight = rightRunning * array[idx];
        setRightRunning(newRight);
        setRightProduct(newRight);
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

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Product of Array Except Self - Space Optimized O(1)</h2>
        
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

        <div className="text-sm bg-purple-50 dark:bg-purple-900 p-3 rounded-md font-medium text-purple-900 dark:text-purple-100 mb-4">
          {currentStep < steps.length ? steps[currentStep] : 'Click "Start Visualization" to begin'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Left Running Product</h4>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{leftRunning}</div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              {phase === 'forward' ? 'Accumulating left products' : 'Forward pass complete'}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Right Running Product</h4>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{rightRunning}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              {phase === 'backward' ? 'Accumulating right products' : phase === 'complete' ? 'Backward pass complete' : 'Waiting for backward pass'}
            </div>
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
                        ? phase === 'forward'
                          ? 'border-green-500 bg-green-100 dark:bg-green-900'
                          : 'border-purple-500 bg-purple-100 dark:bg-purple-900'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } text-gray-900 dark:text-white`}
                  />
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Result Array (Building In-Place)</h3>
            <div className="flex flex-wrap gap-2">
              {array.map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 flex items-center justify-center border-2 rounded-md font-bold text-lg ${
                    result[index] !== undefined && result[index] !== 0
                      ? currentIndex === index
                        ? phase === 'forward'
                          ? 'border-green-500 bg-green-100 dark:bg-green-900 text-gray-900 dark:text-white'
                          : 'border-purple-500 bg-purple-100 dark:bg-purple-900 text-gray-900 dark:text-white'
                        : phase === 'complete' || (phase === 'backward' && index > (currentIndex || 0))
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white'
                          : 'border-blue-300 bg-blue-50 dark:bg-blue-800 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {result[index] !== undefined && result[index] !== 0 ? result[index] : '-'}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">[{index}]</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Current Phase</h4>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${phase === 'forward' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Forward Pass (Building left products)</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${phase === 'backward' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Backward Pass (Multiplying by right products)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Space Optimized Algorithm</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Forward Pass:</strong> Build result array with left products using a running variable</li>
          <li><strong>Backward Pass:</strong> Multiply each result[i] by right products using another running variable</li>
          <li><strong>Key Insight:</strong> We don't need separate left/right arrays, just running products</li>
          <li><strong>Time Complexity:</strong> O(n) - two passes through the array</li>
          <li><strong>Space Complexity:</strong> O(1) - only two variables (excluding output array)</li>
        </ol>
      </div>
    </div>
  );
}