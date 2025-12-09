// filename: DFSMazePathfinding.tsx
import React, { useState } from 'react';

type Cell = 'empty' | 'wall' | 'start' | 'end';

interface Position {
  row: number;
  col: number;
}

export default function DFSMazePathfinding() {
  const initialMaze: Cell[][] = [
    ['start', 'empty', 'wall', 'empty', 'empty'],
    ['empty', 'empty', 'wall', 'empty', 'wall'],
    ['wall', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'wall', 'wall', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'end'],
  ];

  const [maze] = useState<Cell[][]>(initialMaze);
  const [currentPos, setCurrentPos] = useState<Position | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<Position[]>([]);
  const [stack, setStack] = useState<Position[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [foundPath, setFoundPath] = useState<Position[]>([]);

  const reset = () => {
    setCurrentPos(null);
    setVisited(new Set());
    setPath([]);
    setStack([]);
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
    setFoundPath([]);
  };

  const posToKey = (pos: Position): string => `${pos.row},${pos.col}`;

  const getNeighbors = (pos: Position): Position[] => {
    const neighbors: Position[] = [];
    const directions = [
      { row: -1, col: 0, name: 'up' },
      { row: 1, col: 0, name: 'down' },
      { row: 0, col: -1, name: 'left' },
      { row: 0, col: 1, name: 'right' },
    ];

    for (const dir of directions) {
      const newRow = pos.row + dir.row;
      const newCol = pos.col + dir.col;
      if (
        newRow >= 0 &&
        newRow < maze.length &&
        newCol >= 0 &&
        newCol < maze[0].length &&
        maze[newRow][newCol] !== 'wall'
      ) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }
    return neighbors;
  };

  const startDFS = () => {
    reset();
    const newSteps: string[] = [];
    const visitedSet = new Set<string>();
    const stackTrace: Position[] = [];
    const pathTrace: Position[][] = [];
    let start: Position = { row: 0, col: 0 };
    let end: Position = { row: 4, col: 4 };

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 'start') start = { row: i, col: j };
        if (maze[i][j] === 'end') end = { row: i, col: j };
      }
    }

    let found = false;
    const finalPath: Position[] = [];

    const dfs = (pos: Position, currentPath: Position[]): boolean => {
      const key = posToKey(pos);
      
      if (visitedSet.has(key)) {
        newSteps.push(`Position (${pos.row},${pos.col}) already visited, backtrack`);
        return false;
      }

      newSteps.push(`Visit position (${pos.row},${pos.col})`);
      visitedSet.add(key);
      currentPath.push(pos);
      pathTrace.push([...currentPath]);

      if (pos.row === end.row && pos.col === end.col) {
        newSteps.push(`Found the end at (${pos.row},${pos.col})!`);
        finalPath.push(...currentPath);
        return true;
      }

      const neighbors = getNeighbors(pos);
      newSteps.push(`Exploring neighbors of (${pos.row},${pos.col}): ${neighbors.length} available`);

      for (const neighbor of neighbors) {
        if (!visitedSet.has(posToKey(neighbor))) {
          stackTrace.push(neighbor);
          if (dfs(neighbor, currentPath)) {
            return true;
          }
          stackTrace.pop();
        }
      }

      newSteps.push(`Dead end at (${pos.row},${pos.col}), backtrack`);
      currentPath.pop();
      return false;
    };

    newSteps.push(`Starting DFS from (${start.row},${start.col})`);
    found = dfs(start, []);
    
    if (found) {
      newSteps.push(`Path found! Length: ${finalPath.length}`);
    } else {
      newSteps.push(`No path found to the end`);
    }

    setSteps(newSteps);
    if (found) {
      setFoundPath(finalPath);
    }
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    const visitMatch = step.match(/Visit position \((\d+),(\d+)\)/);
    if (visitMatch) {
      const pos: Position = { row: parseInt(visitMatch[1]), col: parseInt(visitMatch[2]) };
      setCurrentPos(pos);
      setVisited(prev => new Set([...prev, posToKey(pos)]));
      setPath(prev => [...prev, pos]);
      setStack(prev => [...prev, pos]);
    }

    const backtrackMatch = step.match(/Dead end at \((\d+),(\d+)\)/);
    if (backtrackMatch) {
      setPath(prev => prev.slice(0, -1));
      setStack(prev => prev.slice(0, -1));
    }
  };

  const getCellColor = (row: number, col: number): string => {
    const cell = maze[row][col];
    const pos: Position = { row, col };
    const key = posToKey(pos);
    const isInPath = path.some(p => p.row === row && p.col === col);
    const isInFoundPath = foundPath.some(p => p.row === row && p.col === col);
    const isCurrent = currentPos?.row === row && currentPos?.col === col;

    if (cell === 'wall') return 'bg-gray-800 dark:bg-gray-900';
    if (cell === 'start') return 'bg-green-500';
    if (cell === 'end') return 'bg-red-500';
    if (isCurrent) return 'bg-yellow-400';
    if (isComplete && isInFoundPath) return 'bg-blue-500';
    if (isInPath) return 'bg-blue-300';
    if (visited.has(key)) return 'bg-purple-200 dark:bg-purple-800';
    return 'bg-white dark:bg-gray-700';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">DFS Maze Pathfinding</h1>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={startDFS}
            disabled={steps.length > 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Start DFS
          </button>
          <button
            onClick={nextStep}
            disabled={steps.length === 0 || isComplete}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
              steps.length === 0 || isComplete ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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

        <div className="text-sm p-3 bg-green-50 dark:bg-green-900 rounded-md font-medium text-green-900 dark:text-green-100 mb-4">
          {currentStep < steps.length ? steps[currentStep] : "Click 'Start DFS' to find a path from green to red"}
        </div>

        <div className="flex justify-center mb-4">
          <div className="inline-grid gap-1 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg" style={{ gridTemplateColumns: `repeat(${maze[0].length}, minmax(0, 1fr))` }}>
            {maze.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-16 h-16 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold transition-all duration-300 ${getCellColor(rowIdx, colIdx)}`}
                >
                  {cell === 'start' && <span className="text-white text-xl">S</span>}
                  {cell === 'end' && <span className="text-white text-xl">E</span>}
                  {cell === 'wall' && <span className="text-gray-500">█</span>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Position</div>
            <div className="text-lg font-bold dark:text-white">
              {currentPos ? `(${currentPos.row}, ${currentPos.col})` : '-'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Visited Cells</div>
            <div className="text-lg font-bold dark:text-white">{visited.size}</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Path Length</div>
            <div className="text-lg font-bold dark:text-white">{path.length}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-200 dark:bg-purple-800"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 dark:bg-gray-900"></div>
            <span>Wall</span>
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">DFS Pathfinding</h2>
        <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
          <li>DFS explores one path completely before trying alternatives</li>
          <li>Uses a stack (or recursion) to track the current path</li>
          <li>Backtracks when hitting a dead end or visited cell</li>
          <li>Not guaranteed to find the shortest path, but will find a path if one exists</li>
          <li>Space efficient - only stores current path in memory</li>
        </ul>
      </div>
    </div>
  );
}