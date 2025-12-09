// filename: SudokuValidationBasic.tsx
import React, { useState, useEffect } from 'react';

interface ValidationStep {
  type: 'row' | 'column' | 'box';
  index: number;
  cells: [number, number][];
  isValid: boolean;
  duplicates?: number[];
  description: string;
}

export default function SudokuValidationBasic() {
  const initialBoard: (string | number)[][] = [
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

  const [board, setBoard] = useState<(string | number)[][]>(initialBoard);
  const [steps, setSteps] = useState<ValidationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isValidating, setIsValidating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [overallValid, setOverallValid] = useState<boolean | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());

  const cellKey = (row: number, col: number) => `${row}-${col}`;

  const generateValidationSteps = (boardData: (string | number)[][]) => {
    const validationSteps: ValidationStep[] = [];
    let allValid = true;

    // Validate rows
    for (let row = 0; row < 9; row++) {
      const cells: [number, number][] = [];
      const seen = new Map<number, number[]>();
      
      for (let col = 0; col < 9; col++) {
        cells.push([row, col]);
        const val = boardData[row][col];
        if (val !== '.') {
          const num = typeof val === 'string' ? parseInt(val) : val;
          if (!seen.has(num)) {
            seen.set(num, []);
          }
          seen.get(num)!.push(col);
        }
      }

      const duplicates: number[] = [];
      seen.forEach((positions, num) => {
        if (positions.length > 1) {
          duplicates.push(num);
          allValid = false;
        }
      });

      validationSteps.push({
        type: 'row',
        index: row,
        cells,
        isValid: duplicates.length === 0,
        duplicates: duplicates.length > 0 ? duplicates : undefined,
        description: duplicates.length === 0 
          ? `Row ${row + 1}: Valid - no duplicates found`
          : `Row ${row + 1}: Invalid - duplicate(s): ${duplicates.join(', ')}`
      });
    }

    // Validate columns
    for (let col = 0; col < 9; col++) {
      const cells: [number, number][] = [];
      const seen = new Map<number, number[]>();
      
      for (let row = 0; row < 9; row++) {
        cells.push([row, col]);
        const val = boardData[row][col];
        if (val !== '.') {
          const num = typeof val === 'string' ? parseInt(val) : val;
          if (!seen.has(num)) {
            seen.set(num, []);
          }
          seen.get(num)!.push(row);
        }
      }

      const duplicates: number[] = [];
      seen.forEach((positions, num) => {
        if (positions.length > 1) {
          duplicates.push(num);
          allValid = false;
        }
      });

      validationSteps.push({
        type: 'column',
        index: col,
        cells,
        isValid: duplicates.length === 0,
        duplicates: duplicates.length > 0 ? duplicates : undefined,
        description: duplicates.length === 0 
          ? `Column ${col + 1}: Valid - no duplicates found`
          : `Column ${col + 1}: Invalid - duplicate(s): ${duplicates.join(', ')}`
      });
    }

    // Validate 3x3 boxes
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
      const cells: [number, number][] = [];
      const seen = new Map<number, [number, number][]>();
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
          allValid = false;
        }
      });

      validationSteps.push({
        type: 'box',
        index: boxIndex,
        cells,
        isValid: duplicates.length === 0,
        duplicates: duplicates.length > 0 ? duplicates : undefined,
        description: duplicates.length === 0 
          ? `Box ${boxIndex + 1}: Valid - no duplicates found`
          : `Box ${boxIndex + 1}: Invalid - duplicate(s): ${duplicates.join(', ')}`
      });
    }

    return { steps: validationSteps, isValid: allValid };
  };

  const startValidation = () => {
    const { steps: validationSteps, isValid } = generateValidationSteps(board);
    setSteps(validationSteps);
    setCurrentStep(-1);
    setIsValidating(true);
    setIsComplete(false);
    setOverallValid(isValid);
    setHighlightedCells(new Set());
    setInvalidCells(new Set());
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsComplete(false);
    }
  };

  const reset = () => {
    setCurrentStep(-1);
    setIsValidating(false);
    setIsComplete(false);
    setOverallValid(null);
    setHighlightedCells(new Set());
    setInvalidCells(new Set());
    setSteps([]);
  };

  const loadInvalidBoard = () => {
    const invalidBoard: (string | number)[][] = [
      ['5', '3', '5', '.', '7', '.', '.', '.', '.'],
      ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
      ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
      ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
      ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
      ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
      ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
      ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
      ['.', '.', '.', '.', '8', '.', '.', '7', '9']
    ];
    setBoard(invalidBoard);
    reset();
  };

  const loadValidBoard = () => {
    setBoard(initialBoard);
    reset();
  };

  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      const highlighted = new Set(step.cells.map(([r, c]) => cellKey(r, c)));
      setHighlightedCells(highlighted);

      if (!step.isValid && step.duplicates) {
        const invalid = new Set<string>();
        step.cells.forEach(([r, c]) => {
          const val = board[r][c];
          if (val !== '.' && step.duplicates!.includes(typeof val === 'string' ? parseInt(val) : val)) {
            invalid.add(cellKey(r, c));
          }
        });
        setInvalidCells(invalid);
      } else {
        setInvalidCells(new Set());
      }
    }
  }, [currentStep, steps, board]);

  const getCellClassName = (row: number, col: number) => {
    const key = cellKey(row, col);
    const isHighlighted = highlightedCells.has(key);
    const isInvalid = invalidCells.has(key);
    
    let className = 'w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 font-semibold transition-all duration-300';
    
    if (isInvalid) {
      className += ' bg-red-500 text-white';
    } else if (isHighlighted) {
      className += ' bg-yellow-200 dark:bg-yellow-600';
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
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sudoku Validation Visualizer</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={startValidation}
            disabled={isValidating}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Validation
          </button>
          <button
            onClick={previousStep}
            disabled={!isValidating || currentStep <= 0}
            className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors ${(!isValidating || currentStep <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ← Previous
          </button>
          <button
            onClick={nextStep}
            disabled={!isValidating || isComplete}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${(!isValidating || isComplete) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next →
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={loadValidBoard}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Load Valid Board
          </button>
          <button
            onClick={loadInvalidBoard}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Load Invalid Board
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {currentStep === -1 && !isComplete && 'Click "Start Validation" to begin checking the Sudoku board'}
            {currentStep >= 0 && currentStep < steps.length && steps[currentStep].description}
            {isComplete && (
              <span className={overallValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                Validation Complete! Board is {overallValid ? 'VALID ✓' : 'INVALID ✗'}
              </span>
            )}
          </p>
        </div>

        <div className="flex justify-center mb-6">
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

        {isValidating && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Progress</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Step {currentStep + 1} of {steps.length}
              </p>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Checking</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {currentStep >= 0 && currentStep < steps.length && (
                  <>
                    {steps[currentStep].type.charAt(0).toUpperCase() + steps[currentStep].type.slice(1)} {steps[currentStep].index + 1}
                  </>
                )}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Status</h3>
              <p className={`text-sm font-semibold ${currentStep >= 0 && currentStep < steps.length && steps[currentStep].isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {currentStep >= 0 && currentStep < steps.length && (steps[currentStep].isValid ? 'Valid ✓' : 'Invalid ✗')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">How Sudoku Validation Works</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Row Validation:</strong> Check each of the 9 rows to ensure no duplicate numbers (1-9) appear.</li>
          <li><strong>Column Validation:</strong> Check each of the 9 columns to ensure no duplicate numbers appear.</li>
          <li><strong>3×3 Box Validation:</strong> Check each of the 9 sub-boxes to ensure no duplicate numbers appear.</li>
          <li>Empty cells (represented by '.') are ignored during validation.</li>
          <li>A Sudoku board is valid only if all rows, columns, and boxes pass validation.</li>
        </ol>
      </div>
    </div>
  );
}