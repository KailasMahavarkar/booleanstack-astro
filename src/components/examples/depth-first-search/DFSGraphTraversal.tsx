// filename: DFSGraphTraversal.tsx
import React, { useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  from: number;
  to: number;
}

export default function DFSGraphTraversal() {
  const nodes: Node[] = [
    { id: 0, x: 200, y: 50, label: 'A' },
    { id: 1, x: 100, y: 150, label: 'B' },
    { id: 2, x: 300, y: 150, label: 'C' },
    { id: 3, x: 50, y: 250, label: 'D' },
    { id: 4, x: 150, y: 250, label: 'E' },
    { id: 5, x: 250, y: 250, label: 'F' },
    { id: 6, x: 350, y: 250, label: 'G' },
  ];

  const edges: Edge[] = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 5 },
    { from: 2, to: 6 },
  ];

  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [stack, setStack] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);

  const reset = () => {
    setVisited(new Set());
    setStack([]);
    setCurrentNode(null);
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
    setTraversalOrder([]);
  };

  const startDFS = () => {
    reset();
    const newSteps: string[] = [];
    const visitedNodes = new Set<number>();
    const stackTrace: number[][] = [];
    const order: number[] = [];

    const dfsSteps = (nodeId: number, currentStack: number[]) => {
      newSteps.push(`Push ${nodes[nodeId].label} onto stack`);
      const newStack = [...currentStack, nodeId];
      stackTrace.push([...newStack]);

      newSteps.push(`Pop ${nodes[nodeId].label} from stack and visit it`);
      visitedNodes.add(nodeId);
      order.push(nodeId);
      stackTrace.push([...currentStack]);

      const neighbors = edges.filter(e => e.from === nodeId).map(e => e.to);
      const unvisitedNeighbors = neighbors.filter(n => !visitedNodes.has(n));

      if (unvisitedNeighbors.length > 0) {
        newSteps.push(`Found unvisited neighbors of ${nodes[nodeId].label}: ${unvisitedNeighbors.map(n => nodes[n].label).join(', ')}`);
        for (let i = unvisitedNeighbors.length - 1; i >= 0; i--) {
          dfsSteps(unvisitedNeighbors[i], newStack);
        }
      } else {
        newSteps.push(`No unvisited neighbors for ${nodes[nodeId].label}`);
      }
    };

    newSteps.push('Starting DFS from node A');
    dfsSteps(0, []);
    newSteps.push('DFS traversal complete!');

    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep + 1];
    setCurrentStep(currentStep + 1);

    if (step.includes('Push') && step.includes('onto stack')) {
      const match = step.match(/Push ([A-Z]) onto stack/);
      if (match) {
        const nodeLabel = match[1];
        const nodeId = nodes.find(n => n.label === nodeLabel)?.id;
        if (nodeId !== undefined) {
          setStack(prev => [...prev, nodeId]);
          setCurrentNode(nodeId);
        }
      }
    } else if (step.includes('Pop') && step.includes('visit')) {
      const match = step.match(/Pop ([A-Z]) from stack/);
      if (match) {
        const nodeLabel = match[1];
        const nodeId = nodes.find(n => n.label === nodeLabel)?.id;
        if (nodeId !== undefined) {
          setStack(prev => prev.filter(id => id !== nodeId));
          setVisited(prev => new Set([...prev, nodeId]));
          setTraversalOrder(prev => [...prev, nodeId]);
          setCurrentNode(nodeId);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">DFS Graph Traversal</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={startDFS}
            disabled={steps.length > 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start DFS
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

        <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100 mb-4">
          {currentStep < steps.length ? steps[currentStep] : "Click 'Start DFS' to begin"}
        </div>

        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4" style={{ height: '350px' }}>
          <svg width="400" height="300" className="mx-auto">
            {edges.map((edge, idx) => {
              const fromNode = nodes[edge.from];
              const toNode = nodes[edge.to];
              const isTraversed = visited.has(edge.from) && visited.has(edge.to);
              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isTraversed ? '#10b981' : '#d1d5db'}
                  strokeWidth={isTraversed ? '3' : '2'}
                  className="transition-all duration-300"
                />
              );
            })}
            {nodes.map(node => {
              const isVisited = visited.has(node.id);
              const isCurrent = currentNode === node.id;
              const isInStack = stack.includes(node.id);
              
              let fillColor = '#e5e7eb';
              let strokeColor = '#9ca3af';
              
              if (isCurrent) {
                fillColor = '#fbbf24';
                strokeColor = '#f59e0b';
              } else if (isVisited) {
                fillColor = '#10b981';
                strokeColor = '#059669';
              } else if (isInStack) {
                fillColor = '#3b82f6';
                strokeColor = '#2563eb';
              }
              
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="25"
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
                    className="font-bold text-lg fill-gray-900"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Stack</div>
            <div className="flex flex-wrap gap-2">
              {stack.length === 0 ? (
                <span className="text-gray-400 dark:text-gray-500">Empty</span>
              ) : (
                stack.map((nodeId, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-500 text-white rounded-md font-medium">
                    {nodes[nodeId].label}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Visited</div>
            <div className="flex flex-wrap gap-2">
              {visited.size === 0 ? (
                <span className="text-gray-400 dark:text-gray-500">None</span>
              ) : (
                Array.from(visited).map((nodeId, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-500 text-white rounded-md font-medium">
                    {nodes[nodeId].label}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Traversal Order</div>
            <div className="text-lg font-bold dark:text-white">
              {traversalOrder.length === 0 ? '-' : traversalOrder.map(id => nodes[id].label).join(' → ')}
            </div>
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">How DFS Works</h2>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Start at the root node and push it onto the stack</li>
          <li>Pop a node from the stack and mark it as visited</li>
          <li>Push all unvisited neighbors onto the stack</li>
          <li>Repeat steps 2-3 until the stack is empty</li>
          <li>DFS explores as far as possible along each branch before backtracking</li>
        </ol>
      </div>
    </div>
  );
}