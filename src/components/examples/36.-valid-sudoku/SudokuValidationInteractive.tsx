// filename: SudokuValidationInteractive.tsx
import React, { useState, useEffect } from 'react';

interface CellState {
  value: string;
  isEditing: boolean;
  hasError: boolean;
  errorType?: 'row' | 'column' | 'box';
}

export default function SudokuValidationInteractive() {
  const createEmptyBoard = (): CellState[][] => {
    return Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => ({
        value: '.',
        isEditing: false,
        hasError: false
      }))
    );
  };

  const [board, setBoard] = useState<CellState[][]>(createEmptyBoard());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [validationMode, setValidationMode] = useState<'realtime' | 'manual'>('realtime');
  const [showErrors, setShowErrors] = useState(true);
  const [validationStats, setValidationStats] = useState({
    validRows: 0,
    validColumns: 0,
    validBoxes: 0,
    totalCells: 0,
    filledCells: 0
  });

  const cellKey = (row: number, col: number) => `${row}-${col}`;

  const validateCell = (row: number, col: number, boardData: CellState[][]): boolean => {
    const value = boardData[row][col].value;
    if (value === '.') return true;

    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 9) return false;

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && boardData[row][c].value === value) {
        return false;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && boardData[r][col].value === value) {
        return false;
      }
    }

    // Check 3x3 box
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
      for (let c = boxStartCol; c < boxStartCol + 3; c++) {
        if ((r !== row || c !== col) && boardData[r][c].value === value) {
          return false;
        }
      }
    }

    return true;
  };

  const validateBoard = (boardData: CellState[][]) => {
    const newBoard = boardData.map(row => row.map(cell => ({ ...cell, hasError: false })));
    let validRows = 0;
    let validColumns = 0;
    let validBoxes = 0;
    let filledCells = 0;

    // Validate and mark errors
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (boardData[row][col].value !== '.') {
          filledCells++;
          if (!validateCell(row, col, boardData)) {
            newBoard[row][col].hasError = true;
          }
        }
      }
    }

    // Count valid rows
    for (let row = 0; row < 9; row++) {
      let isValid = true;
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col].hasError) {
          isValid = false;
          break;
        }
      }
      if (isValid) validRows++;
    }

    // Count valid columns
    for (let col = 0; col < 9; col++) {
      let isValid = true;
      for (let row = 0; row < 9; row++) {
        if (newBoard[row][col].hasError) {
          isValid = false;
          break;
        }
      }
      if (isValid) validColumns++;
    }

    // Count valid boxes
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
      const startRow = Math.floor(boxIndex / 3) * 3;
      const startCol = (boxIndex % 3) * 3;
      let isValid = true;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (newBoard[startRow + r][startCol + c].hasError) {
            isValid = false;
            break;
          }
        }
        if (!isValid) break;
      }
      if (isValid) validBoxes++;
    }

    setValidationStats({
      validRows,
      validColumns,
      validBoxes,
      totalCells: 81,
      filledCells
    });

    return newBoard;
  };

  useEffect(() => {
    if (validationMode === 'realtime' && showErrors) {
      const validated = validateBoard(board);
      setBoard(validated);
    }
  }, [validationMode, showErrors]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newBoard = board.map((r, rIdx) => 
      r.map((cell, cIdx) => {
        if (rIdx === row && cIdx === col) {
          return { ...cell, value: value === '' ? '.' : value };
        }
        return cell;
      })
    );

    if (validationMode === 'realtime' && showErrors) {
      setBoard(validateBoard(newBoard));
    } else {
      setBoard(newBoard);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key >= '1' && e.key <= '9') {
      handleCellChange(row, col, e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleCellChange(row, col, '.');
    }
  };

  const clearBoard = () => {
    setBoard(createEmptyBoard());
    setSelectedCell(null);
    setValidationStats({
      validRows: 0,
      validColumns: 0,
      validBoxes: 0,
      totalCells: 81,
      filledCells: 0
    });
  };

  const loadSampleBoard = () => {
    const sample = [
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

    const newBoard = sample.map(row => 
      row.map(val => ({
        value: val,
        isEditing: false,
        hasError: false
      }))
    );

    if (validationMode === 'realtime' && showErrors) {
      setBoard(validateBoard(newBoard));
    } else {
      setBoard(newBoard);
    }
  };

  const manualValidate = () => {
    setBoard(validateBoard(board));
  };

  const getCellClassName = (row: number, col: number) => {
    const cell = board[row][col];
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    
    let className = 'w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 font-semibold transition-all duration-200 cursor-pointer';
    
    if (cell.hasError && showErrors) {
      className += ' bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100';
    } else if (isSelected) {
      className += ' bg-blue-300 dark:bg-blue-700 ring-2 ring-blue-500';
    } else if (cell.value !== '.') {
      className += ' bg-blue-50 dark:bg-blue-900';
    } else {
      className += ' bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700';
    }

    if (col % 3 === 2 && col !== 8) className += ' border-r-2 border-r-gray-800 dark:border-r-gray-300';
    if (row % 3 === 2 && row !== 8) className += ' border-b-2 border-b-gray-800 dark:border-b-gray-300';

    return className;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Interactive Sudoku Validator</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={clearBoard}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear Board
          </button>
          <button
            onClick={loadSampleBoard}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Load Sample
          </button>
          {validationMode === 'manual' && (
            <button
              onClick={manualValidate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Validate Now
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showErrors}
                onChange={(e) => setShowErrors(e.target.checked)}
                className="w-4 h-4"
              />
              Show Errors
            </label>
            <select
              value={validationMode}
              onChange={(e) => setValidationMode(e.target.value as 'realtime' | 'manual')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="realtime">Real-time Validation</option>
              <option value="manual">Manual Validation</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex justify-center">
            <div className="inline-block border-4 border-gray-800 dark:border-gray-300">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={getCellClassName(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onKeyDown={(e) => handleKeyPress(e, rowIndex, colIndex)}
                      tabIndex={0}
                    >
                      {cell.value !== '.' ? cell.value : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Number Pad</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      if (selectedCell) {
                        handleCellChange(selectedCell[0], selectedCell[1], num.toString());
                      }
                    }}
                    disabled={!selectedCell}
                    className={`px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold ${!selectedCell ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (selectedCell) {
                    handleCellChange(selectedCell[0], selectedCell[1], '.');
                  }
                }}
                disabled={!selectedCell}
                className={`w-full mt-2 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors ${!selectedCell ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Clear Cell
              </button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Validation Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Valid Rows:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{validationStats.validRows} / 9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Valid Columns:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{validationStats.validColumns} / 9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Valid Boxes:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{validationStats.validBoxes} / 9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Filled Cells:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{validationStats.filledCells} / 81</span>
                </div>
                <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Overall Status:</span>
                    <span className={`font-semibold ${validationStats.validRows === 9 && validationStats.validColumns === 9 && validationStats.validBoxes === 9 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {validationStats.validRows === 9 && validationStats.validColumns === 9 && validationStats.validBoxes === 9 ? 'Valid ✓' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Instructions:</strong> Click a cell to select it, then use the number pad or keyboard (1-9) to enter values. 
            Press Backspace/Delete or click "Clear Cell" to remove a value. 
            {validationMode === 'realtime' ? ' Errors are highlighted in real-time.' : ' Click "Validate Now" to check for errors.'}
          </p>
        </div>
      </div>
    </div>
  );
}