// filename: SudokuValidationAlgorithm.tsx
import React, { useState, useEffect } from 'react';

interface AlgorithmStep {
  phase: 'init' | 'row' | 'column' | 'box' | 'complete';
  index?: number;
  checkingCells: [number, number][];
  seenNumbers: Map<number, [number, number][]>;
  duplicates: number[];
  description: string;
  isValid: boolean;
}

export default function SudokuValidationAlgorithm() {
  const sampleBoard: (string | number)[][] = [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
    ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
    ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
    ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
    ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
    ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
    ['.', '.', '.', '.', '8', '.', '.', '7', '9']
  ];

  const [board, setBoard] = useState<(string | number)[][]>(sampleBoard);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [seenNumbersDisplay, setSeenNumbersDisplay] = useState<Map<number, [number, number][]>>(new Map());
  const [duplicateNumbers, setDuplicateNumbers] = useState<number[]>([]);

  const cellKey = (row: number, col: number) => `${row}-${col}`;

  const generateAlgorithmSteps = (boardData: (string | number)[][]) => {
    const algorithmSteps: AlgorithmStep[] = [];

    algorithmSteps.push({
      phase: 'init',
      checkingCells: [],
      seenNumbers: new Map(),
      duplicates: [],
      description: 'Initialize validation algorithm. We will check rows, columns, and 3×3 boxes.',
      isValid: true
    });

    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Map<number, [number, number][]>();
      const cells: [number, number][] = [];
      
      for (let col = 0; col < 9; col++) {
        cells.push([row, col]);
        const val = boardData[row][col];
        if (val !== '.') {
          const num = typeof val === 'string' ? parseInt(val) : val;
          if (!seen.has(num)) {
            seen.set(num, []);
          }
          seen.get(num)!.push([row, col]);
        }
      }

      const duplicates: number[] = [];
      seen.forEach((positions, num) => {
        if (positions.length > 1) {
          duplicates.push(num);
        }
      });

      algorithmSteps.push({
        phase: 'row',
        index: row,
        checkingCells: cells,
        seenNumbers: new Map(seen),
        duplicates,
        description: duplicates.length === 0
          ? `Checking row ${row + 1}: Using HashSet to track seen numbers. No duplicates found.`
          : `Checking row ${row + 1}: Found duplicate(s): ${duplicates.join(', ')}. Numbers appear multiple times.`,
        isValid: duplicates.length === 0
      });
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Map<number, [number, number][]>();
      const cells: [number, number][] = [];
      
      for (let row = 0; row < 9; row++) {
        cells.push([row, col]);
        const val = boardData[row][col];
        if (val !== '.') {
          const num = typeof val === 'string' ? parseInt(val) : val;
          if (!seen.has(num)) {
            seen.set(num, []);
          }
          seen.get(num)!.push([row, col]);
        }
      }

      const duplicates: number[] = [];
      seen.forEach((positions, num) => {
        if (positions.length > 1) {
          duplicates.push(num);
        }
      });

      algorithmSteps.push({
        phase: 'column',
        index: col,
        checkingCells: cells,
        seenNumbers: new Map(seen),
        duplicates,
        description: duplicates.length === 0
          ? `Checking column ${col + 1}: Using HashSet to track seen numbers. No duplicates found.`
          : `Checking column ${col + 1}: Found duplicate(s): ${duplicates.join(', ')}. Numbers appear multiple times.`,
        isValid: duplicates.length === 0
      });
    }

    // Check 3x3 boxes
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
      const seen = new Map<number, [number, number][]>();
      const cells: [number, number][] = [];
      const startRow = Math.floor(boxIndex / 3) * 3;
      const startCol = (boxIndex % 3) * 3;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = startRow + r;
          const col = startCol + c;
          cells.push([row, col]);
          const val = boardData[row][col];
          if (val !== '.') {
            const num = typeof val === 'string' ? parseInt(val) : val;
            if (!seen.has(num)) {
              seen.set(num, []);
            }
            seen.get(num)!.push([row, col]);
          }
        }
      }

      const duplicates: number[] = [];
      seen.forEach((positions, num) => {
        if (positions.length > 1) {
          duplicates.push(num);
        }
      });

      algorithmSteps.push({
        phase: 'box',
        index: boxIndex,
        checkingCells: cells,
        seenNumbers: new Map(seen),
        duplicates,
        description: duplicates.length === 0
          ? `Checking 3×3 box ${boxIndex + 1}: Using HashSet to track seen numbers. No duplicates found.`
          : `Checking 3×3 box ${boxIndex + 1}: Found duplicate(s): ${duplicates.join(', ')}. Numbers appear multiple times.`,
        isValid: duplicates.length === 0
      });
    }

    const allValid = algorithmSteps.every(step => step.isValid);
    algorithmSteps.push({
      phase: 'complete',
      checkingCells: [],
      seenNumbers: new Map(),
      duplicates: [],
      description: allValid 
        ? 'Validation complete! All rows, columns, and boxes are valid. The Sudoku board is VALID.'
        : 'Validation complete! Found invalid rows/columns/boxes. The Sudoku board is INVALID.',
      isValid: allValid
    });

    return algorithmSteps;
  };

  const startAlgorithm = () => {
    const algorithmSteps = generateAlgorithmSteps(board);
    setSteps(algorithmSteps);
    setCurrentStep(0);
    setIsRunning(true);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsRunning(false);
    setIsAutoPlay(false);
    setHighlightedCells(new Set());
    setSeenNumbersDisplay(new Map());
    setDuplicateNumbers([]);
    setSteps([]);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (isRunning && currentStep < steps.length && steps[currentStep]) {
      const step = steps[currentStep];
      const highlighted = new Set(step.checkingCells.map(([r, c]) => cellKey(r, c)));
      setHighlightedCells(highlighted);
      setSeenNumbersDisplay(step.seenNumbers);
      setDuplicateNumbers(step.duplicates);
    }
  }, [currentStep, steps, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay && isRunning && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, isRunning, currentStep, steps.length, speed]);

  const getCellClassName = (row: number, col: number) => {
    const key = cellKey(row, col);
    const isHighlighted = highlightedCells.has(key);
    const value = board[row][col];
    const isDuplicate = value !== '.' && duplicateNumbers.includes(typeof value === 'string' ? parseInt(value) : value);
    
    let className = 'w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 font-semibold transition-all duration-300';
    
    if (isDuplicate && isHighlighted) {
      className += ' bg-red-500 text-white ring-2 ring-red-700';
    } else if (isHighlighted) {
      className += ' bg-yellow-300 dark:bg-yellow-600';
    } else {
      className += ' bg-white dark:bg-gray-800';
    }

    if (col % 3 === 2 && col !== 8) className += ' border-r-2 border-r-gray-800 dark:border-r-gray-300';
    if (row % 3 === 2 && row !== 8) className += ' border-b-2 border-b-gray-800 dark:border-b-gray-300';

    return className;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sudoku Validation Algorithm</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={startAlgorithm}
            disabled={isRunning}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Algorithm
          </button>
          <button
            onClick={previousStep}
            disabled={!isRunning || currentStep === 0}
            className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors ${(!isRunning || currentStep === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ← Previous
          </button>
          <button
            onClick={nextStep}
            disabled={!isRunning || currentStep >= steps.length - 1}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${(!isRunning || currentStep >= steps.length - 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next →
          </button>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            disabled={!isRunning || currentStep >= steps.length - 1}
            className={`px-4 py-2 ${isAutoPlay ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-md transition-colors ${(!isRunning || currentStep >= steps.length - 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAutoPlay ? '⏸ Pause' : '▶ Auto Play'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-700 dark:text-gray-300">Speed:</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="200"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{speed}ms</span>
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {isRunning && currentStep < steps.length ? steps[currentStep].description : 'Click "Start Algorithm" to begin the validation process'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Sudoku Board</h3>
            <div className="inline-block border-4 border-gray-800 dark:border-gray-300">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div key={colIndex} className={getCellClassName(rowIndex, colIndex)}>
                      {cell !== '.' ? cell : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Algorithm State</h3>
              {isRunning && currentStep < steps.length && (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Phase:</span>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {steps[currentStep].phase}
                        {steps[currentStep].index !== undefined && ` ${steps[currentStep].index! + 1}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Step:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {currentStep + 1} / {steps.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Status:</span>
                      <span className={`font-semibold ${steps[currentStep].isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {steps[currentStep].isValid ? 'Valid ✓' : 'Invalid ✗'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">HashSet (Seen Numbers)</h3>
              <div className="space-y-2">
                {seenNumbersDisplay.size > 0 ? (
                  Array.from(seenNumbersDisplay.entries()).map(([num, positions]) => (
                    <div key={num} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Number {num}:</span>
                      <span className={`font-semibold ${positions.length > 1 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {positions.length} occurrence{positions.length > 1 ? 's' : ''}
                        {positions.length > 1 && ' (Duplicate!)'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No numbers being tracked</p>
                )}
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-300 dark:bg-yellow-600 border border-gray-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Currently checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 border border-gray-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Duplicate found</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white dark:bg-gray-800 border border-gray-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">Not checked yet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Algorithm Explanation</h3>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p><strong>Time Complexity:</strong> O(1) - Since the board is always 9×9, we check exactly 27 units (9 rows + 9 columns + 9 boxes)</p>
          <p><strong>Space Complexity:</strong> O(1) - We use a HashSet of at most 9 elements for each unit</p>
          <p className="pt-2"><strong>Algorithm Steps:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>For each row: Use a HashSet to track seen numbers, detect duplicates</li>
            <li>For each column: Use a HashSet to track seen numbers, detect duplicates</li>
            <li>For each 3×3 box: Use a HashSet to track seen numbers, detect duplicates</li>
            <li>Return true only if all 27 units are valid (no duplicates)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}