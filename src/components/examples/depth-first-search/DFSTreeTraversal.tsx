// filename: DFSTreeTraversal.tsx
import React, { useState } from 'react';

interface TreeNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  x: number;
  y: number;
}

type TraversalType = 'preorder' | 'inorder' | 'postorder';

export default function DFSTreeTraversal() {
  const tree: TreeNode[] = [
    { id: 0, value: 50, left: 1, right: 2, x: 200, y: 50 },
    { id: 1, value: 30, left: 3, right: 4, x: 100, y: 120 },
    { id: 2, value: 70, left: 5, right: 6, x: 300, y: 120 },
    { id: 3, value: 20, left: null, right: null, x: 50, y: 190 },
    { id: 4, value: 40, left: null, right: null, x: 150, y: 190 },
    { id: 5, value: 60, left: null, right: null, x: 250, y: 190 },
    { id: 6, value: 80, left: null, right: null, x: 350, y: 190 },
  ];

  const [traversalType, setTraversalType] = useState<TraversalType>('preorder');
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [callStack, setCallStack] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<number[]>([]);

  const reset = () => {
    setCurrentNode(null);
    setVisited(new Set());
    setCallStack([]);
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
    setResult([]);
  };

  const generateSteps = (type: TraversalType) => {
    const newSteps: string[] = [];
    const visitOrder: number[] = [];
    const stackTrace: string[][] = [];

    const traverse = (nodeId: number | null, depth: number): void => {
      if (nodeId === null) {
        newSteps.push(`${' '.repeat(depth * 2)}Reached null, return`);
        return;
      }

      const node = tree[nodeId];
      const indent = ' '.repeat(depth * 2);

      newSteps.push(`${indent}Call DFS(${node.value})`);
      stackTrace.push([`DFS(${node.value})`]);

      if (type === 'preorder') {
        newSteps.push(`${indent}Visit ${node.value} (Pre-order)`);
        visitOrder.push(node.value);
      }

      if (node.left !== null) {
        newSteps.push(`${indent}Traverse left subtree of ${node.value}`);
        traverse(node.left, depth + 1);
      }

      if (type === 'inorder') {
        newSteps.push(`${indent}Visit ${node.value} (In-order)`);
        visitOrder.push(node.value);
      }

      if (node.right !== null) {
        newSteps.push(`${indent}Traverse right subtree of ${node.value}`);
        traverse(node.right, depth + 1);
      }

      if (type === 'postorder') {
        newSteps.push(`${indent}Visit ${node.value} (Post-order)`);
        visitOrder.push(node.value);
      }

      newSteps.push(`${indent}Return from DFS(${node.value})`);
    };

    newSteps.push(`Starting ${type.toUpperCase()} DFS traversal`);
    traverse(0, 0);
    newSteps.push(`Traversal complete! Result: [${visitOrder.join(', ')}]`);

    return { steps: newSteps, order: visitOrder };
  };

  const startTraversal = () => {
    reset();
    const { steps: newSteps } = generateSteps(traversalType);
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    const visitMatch = step.match(/Visit (\d+)/);
    if (visitMatch) {
      const value = parseInt(visitMatch[1]);
      const nodeId = tree.find(n => n.value === value)?.id;
      if (nodeId !== undefined) {
        setCurrentNode(nodeId);
        setVisited(prev => new Set([...prev, nodeId]));
        setResult(prev => [...prev, value]);
      }
    }

    const callMatch = step.match(/Call DFS\((\d+)\)/);
    if (callMatch) {
      const value = parseInt(callMatch[1]);
      const nodeId = tree.find(n => n.value === value)?.id;
      if (nodeId !== undefined) {
        setCurrentNode(nodeId);
        setCallStack(prev => [...prev, `DFS(${value})`]);
      }
    }

    const returnMatch = step.match(/Return from DFS\((\d+)\)/);
    if (returnMatch) {
      setCallStack(prev => prev.slice(0, -1));
    }
  };

  const handleTraversalChange = (type: TraversalType) => {
    setTraversalType(type);
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">DFS Tree Traversal</h1>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-2">
            {(['preorder', 'inorder', 'postorder'] as TraversalType[]).map(type => (
              <button
                key={type}
                onClick={() => handleTraversalChange(type)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  traversalType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={startTraversal}
            disabled={steps.length > 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Start Traversal
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

        <div className="text-sm p-3 bg-purple-50 dark:bg-purple-900 rounded-md font-medium text-purple-900 dark:text-purple-100 mb-4 whitespace-pre-wrap">
          {currentStep < steps.length ? steps[currentStep] : "Select a traversal type and click 'Start Traversal'"}
        </div>

        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4" style={{ height: '280px' }}>
          <svg width="400" height="240" className="mx-auto">
            {tree.map(node => {
              if (node.left !== null) {
                const leftNode = tree[node.left];
                return (
                  <line
                    key={`edge-${node.id}-${node.left}`}
                    x1={node.x}
                    y1={node.y}
                    x2={leftNode.x}
                    y2={leftNode.y}
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                );
              }
              return null;
            })}
            {tree.map(node => {
              if (node.right !== null) {
                const rightNode = tree[node.right];
                return (
                  <line
                    key={`edge-${node.id}-${node.right}`}
                    x1={node.x}
                    y1={node.y}
                    x2={rightNode.x}
                    y2={rightNode.y}
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                );
              }
              return null;
            })}
            {tree.map(node => {
              const isVisited = visited.has(node.id);
              const isCurrent = currentNode === node.id;
              
              let fillColor = '#e5e7eb';
              let strokeColor = '#9ca3af';
              
              if (isCurrent) {
                fillColor = '#fbbf24';
                strokeColor = '#f59e0b';
              } else if (isVisited) {
                fillColor = '#8b5cf6';
                strokeColor = '#7c3aed';
              }
              
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-bold text-base fill-gray-900"
                  >
                    {node.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Call Stack</div>
            <div className="flex flex-col gap-1">
              {callStack.length === 0 ? (
                <span className="text-gray-400 dark:text-gray-500">Empty</span>
              ) : (
                callStack.map((call, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-500 text-white rounded-md font-mono text-sm">
                    {call}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Result Array</div>
            <div className="text-lg font-bold dark:text-white">
              {result.length === 0 ? '[]' : `[${result.join(', ')}]`}
            </div>
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">DFS Traversal Types</h2>
        <div className="space-y-4 dark:text-gray-300">
          <div>
            <h3 className="font-bold text-purple-600 dark:text-purple-400">Pre-order (Root → Left → Right)</h3>
            <p>Visit the current node before its children. Useful for copying trees.</p>
          </div>
          <div>
            <h3 className="font-bold text-purple-600 dark:text-purple-400">In-order (Left → Root → Right)</h3>
            <p>Visit left subtree, then root, then right. For BST, gives sorted order.</p>
          </div>
          <div>
            <h3 className="font-bold text-purple-600 dark:text-purple-400">Post-order (Left → Right → Root)</h3>
            <p>Visit children before the root. Useful for deleting trees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}