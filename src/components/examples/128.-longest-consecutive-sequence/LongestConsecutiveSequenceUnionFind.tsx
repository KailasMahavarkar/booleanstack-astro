// filename: LongestConsecutiveSequenceUnionFind.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

interface UnionFindStep {
    description: string;
    parent: Map<number, number>;
    rank: Map<number, number>;
    currentNum: number | null;
    processingNeighbor: number | null;
    maxSize: number;
    componentSizes: Map<number, number>;
}

export default function LongestConsecutiveSequenceUnionFind() {
    const [inputArray, setInputArray] = useState<number[]>([100, 4, 200, 1, 3, 2]);
    const [steps, setSteps] = useState<UnionFindStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [inputValue, setInputValue] = useState('100, 4, 200, 1, 3, 2');

    const generateSteps = (arr: number[]) => {
        const newSteps: UnionFindStep[] = [];
        const parent = new Map<number, number>();
        const rank = new Map<number, number>();
        const componentSizes = new Map<number, number>();
        let maxSize = 1;

        const find = (x: number): number => {
            if (parent.get(x) !== x) {
                parent.set(x, find(parent.get(x)!));
            }
            return parent.get(x)!;
        };

        const union = (x: number, y: number) => {
            const rootX = find(x);
            const rootY = find(y);

            if (rootX !== rootY) {
                const rankX = rank.get(rootX) || 0;
                const rankY = rank.get(rootY) || 0;

                if (rankX < rankY) {
                    parent.set(rootX, rootY);
                    const newSize = (componentSizes.get(rootY) || 1) + (componentSizes.get(rootX) || 1);
                    componentSizes.set(rootY, newSize);
                    maxSize = Math.max(maxSize, newSize);
                } else if (rankX > rankY) {
                    parent.set(rootY, rootX);
                    const newSize = (componentSizes.get(rootX) || 1) + (componentSizes.get(rootY) || 1);
                    componentSizes.set(rootX, newSize);
                    maxSize = Math.max(maxSize, newSize);
                } else {
                    parent.set(rootY, rootX);
                    rank.set(rootX, rankX + 1);
                    const newSize = (componentSizes.get(rootX) || 1) + (componentSizes.get(rootY) || 1);
                    componentSizes.set(rootX, newSize);
                    maxSize = Math.max(maxSize, newSize);
                }
            }
        };

        newSteps.push({
            description: 'Initialize Union-Find: Each number is its own parent',
            parent: new Map(),
            rank: new Map(),
            currentNum: null,
            processingNeighbor: null,
            maxSize: 0,
            componentSizes: new Map(),
        });

        for (const num of arr) {
            parent.set(num, num);
            rank.set(num, 0);
            componentSizes.set(num, 1);
        }

        newSteps.push({
            description: 'All numbers initialized in Union-Find structure',
            parent: new Map(parent),
            rank: new Map(rank),
            currentNum: null,
            processingNeighbor: null,
            maxSize: 1,
            componentSizes: new Map(componentSizes),
        });

        const numSet = new Set(arr);

        for (const num of arr) {
            newSteps.push({
                description: `Processing ${num}: Check if ${num + 1} exists`,
                parent: new Map(parent),
                rank: new Map(rank),
                currentNum: num,
                processingNeighbor: num + 1,
                maxSize,
                componentSizes: new Map(componentSizes),
            });

            if (numSet.has(num + 1)) {
                const beforeMaxSize = maxSize;
                union(num, num + 1);

                newSteps.push({
                    description: `Union ${num} and ${num + 1}${maxSize > beforeMaxSize ? ` - New max size: ${maxSize}` : ''}`,
                    parent: new Map(parent),
                    rank: new Map(rank),
                    currentNum: num,
                    processingNeighbor: num + 1,
                    maxSize,
                    componentSizes: new Map(componentSizes),
                });
            } else {
                newSteps.push({
                    description: `${num + 1} not found, continue`,
                    parent: new Map(parent),
                    rank: new Map(rank),
                    currentNum: null,
                    processingNeighbor: null,
                    maxSize,
                    componentSizes: new Map(componentSizes),
                });
            }
        }

        newSteps.push({
            description: `Complete! Longest consecutive sequence length: ${maxSize}`,
            parent: new Map(parent),
            rank: new Map(rank),
            currentNum: null,
            processingNeighbor: null,
            maxSize,
            componentSizes: new Map(componentSizes),
        });

        return newSteps;
    };

    const handleStart = () => {
        const steps = generateSteps(inputArray);
        setSteps(steps);
        setCurrentStepIndex(0);
    };

    const handleReset = () => {
        setSteps([]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
    };

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        const arr = e.target.value
            .split(',')
            .map((s) => parseInt(s.trim()))
            .filter((n) => !isNaN(n));
        setInputArray(arr);
        handleReset();
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentStepIndex < steps.length - 1) {
            interval = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStepIndex, steps.length, speed]);

    const currentStep = steps[currentStepIndex];

    const getComponentForNumber = (num: number): number[] => {
        if (!currentStep || !currentStep.parent.has(num)) return [];
        const root = findRoot(num, currentStep.parent);
        return inputArray.filter((n) => currentStep.parent.has(n) && findRoot(n, currentStep.parent) === root);
    };

    const findRoot = (x: number, parent: Map<number, number>): number => {
        let current = x;
        while (parent.get(current) !== current) {
            current = parent.get(current)!;
        }
        return current;
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Longest Consecutive Sequence - Union-Find Approach
                </h2>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Array:</label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 100, 4, 200, 1, 3, 2"
                        />
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={steps.length > 0}
                        className="btn btn-primary btn-sm disabled:opacity-50"
                    >
                        Start
                    </button>

                    <button
                        onClick={handlePrevious}
                        disabled={currentStepIndex === 0 || steps.length === 0}
                        className="btn btn-outline btn-sm disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={steps.length === 0 || currentStepIndex >= steps.length - 1}
                        className="btn btn-success btn-sm disabled:opacity-50"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentStepIndex >= steps.length - 1 || steps.length === 0}
                        className="btn btn-outline btn-sm disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>

                    <button onClick={handleReset} className="btn btn-outline btn-sm">
                        <RotateCcw size={16} />
                    </button>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Speed:</label>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            step="100"
                            value={speed}
                            onChange={(e) => setSpeed(parseInt(e.target.value))}
                            className="range range-xs range-primary w-24"
                        />
                    </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {currentStep?.description || 'Click "Start" to begin visualization'}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {inputArray.map((num, idx) => {
                    let bgColor = 'bg-gray-200 dark:bg-gray-600';
                    let textColor = 'text-gray-900 dark:text-white';
                    let border = 'border-2 border-transparent';

                    if (currentStep) {
                        if (currentStep.currentNum === num) {
                            bgColor = 'bg-blue-500 dark:bg-blue-600';
                            textColor = 'text-white';
                            border = 'border-2 border-blue-700';
                        } else if (currentStep.processingNeighbor === num) {
                            bgColor = 'bg-yellow-400 dark:bg-yellow-600';
                            textColor = 'text-gray-900 dark:text-white';
                            border = 'border-2 border-yellow-700';
                        } else if (currentStep.parent.has(num)) {
                            const component = getComponentForNumber(num);
                            if (component.length > 1) {
                                const hue = (findRoot(num, currentStep.parent) * 137.5) % 360;
                                bgColor = `bg-opacity-70`;
                                const colorClass = component.includes(currentStep.currentNum || -1) ? 'bg-green-400 dark:bg-green-600' : 'bg-purple-300 dark:bg-purple-700';
                                bgColor = colorClass;
                            }
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className={`flex flex-col items-center justify-center w-16 h-20 rounded-lg ${bgColor} ${textColor} ${border} font-bold transition-all duration-300`}
                        >
                            <div className="text-lg">{num}</div>
                            {currentStep && currentStep.parent.has(num) && (
                                <div className="text-xs opacity-70">
                                    p:{currentStep.parent.get(num)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
                    <div className="card-body p-4">
                        <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Max Component Size</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {currentStep?.maxSize || 0}
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
                    <div className="card-body p-4">
                        <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Step</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentStepIndex} / {steps.length - 1}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Union-Find Approach</h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Time Complexity:</strong> O(n α(n)) ≈ O(n) - α is inverse Ackermann function</p>
                    <p><strong>Space Complexity:</strong> O(n) - Parent and rank arrays</p>
                    <div className="mt-2">
                        <p className="font-semibold">How it works:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Initialize each number as its own parent</li>
                            <li>For each number, union it with num+1 if it exists</li>
                            <li>Track component sizes during union operations</li>
                            <li>The maximum component size is the answer</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}