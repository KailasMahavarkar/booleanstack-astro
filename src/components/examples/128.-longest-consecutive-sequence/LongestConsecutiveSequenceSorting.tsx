// filename: LongestConsecutiveSequenceSorting.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

interface SortingStep {
    description: string;
    array: number[];
    sortedArray: number[];
    currentIndex: number | null;
    currentLength: number;
    maxLength: number;
    longestStart: number;
    longestEnd: number;
    isSorting: boolean;
}

export default function LongestConsecutiveSequenceSorting() {
    const [inputArray, setInputArray] = useState<number[]>([100, 4, 200, 1, 3, 2]);
    const [steps, setSteps] = useState<SortingStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [inputValue, setInputValue] = useState('100, 4, 200, 1, 3, 2');

    const generateSteps = (arr: number[]) => {
        const newSteps: SortingStep[] = [];

        newSteps.push({
            description: 'Original unsorted array',
            array: [...arr],
            sortedArray: [],
            currentIndex: null,
            currentLength: 0,
            maxLength: 0,
            longestStart: 0,
            longestEnd: 0,
            isSorting: true,
        });

        const sorted = [...arr].sort((a, b) => a - b);

        newSteps.push({
            description: 'Array sorted in ascending order',
            array: [...arr],
            sortedArray: [...sorted],
            currentIndex: null,
            currentLength: 0,
            maxLength: 0,
            longestStart: 0,
            longestEnd: 0,
            isSorting: false,
        });

        if (sorted.length === 0) {
            newSteps.push({
                description: 'Empty array - no consecutive sequence',
                array: [...arr],
                sortedArray: [...sorted],
                currentIndex: null,
                currentLength: 0,
                maxLength: 0,
                longestStart: 0,
                longestEnd: 0,
                isSorting: false,
            });
            return newSteps;
        }

        let maxLength = 1;
        let currentLength = 1;
        let longestStart = 0;
        let longestEnd = 0;

        newSteps.push({
            description: `Start scanning from index 0: value ${sorted[0]}`,
            array: [...arr],
            sortedArray: [...sorted],
            currentIndex: 0,
            currentLength: 1,
            maxLength: 1,
            longestStart: 0,
            longestEnd: 0,
            isSorting: false,
        });

        for (let i = 1; i < sorted.length; i++) {
            newSteps.push({
                description: `Examining index ${i}: value ${sorted[i]}`,
                array: [...arr],
                sortedArray: [...sorted],
                currentIndex: i,
                currentLength,
                maxLength,
                longestStart,
                longestEnd,
                isSorting: false,
            });

            if (sorted[i] === sorted[i - 1]) {
                newSteps.push({
                    description: `${sorted[i]} equals ${sorted[i - 1]} (duplicate) - skip`,
                    array: [...arr],
                    sortedArray: [...sorted],
                    currentIndex: i,
                    currentLength,
                    maxLength,
                    longestStart,
                    longestEnd,
                    isSorting: false,
                });
                continue;
            }

            if (sorted[i] === sorted[i - 1] + 1) {
                currentLength++;
                newSteps.push({
                    description: `${sorted[i]} = ${sorted[i - 1]} + 1 (consecutive) - extend sequence to length ${currentLength}`,
                    array: [...arr],
                    sortedArray: [...sorted],
                    currentIndex: i,
                    currentLength,
                    maxLength,
                    longestStart,
                    longestEnd,
                    isSorting: false,
                });

                if (currentLength > maxLength) {
                    maxLength = currentLength;
                    longestEnd = i;
                    longestStart = i - currentLength + 1;

                    newSteps.push({
                        description: `New longest sequence found! Length: ${maxLength}`,
                        array: [...arr],
                        sortedArray: [...sorted],
                        currentIndex: i,
                        currentLength,
                        maxLength,
                        longestStart,
                        longestEnd,
                        isSorting: false,
                    });
                }
            } else {
                newSteps.push({
                    description: `${sorted[i]} ≠ ${sorted[i - 1]} + 1 (gap found) - reset current sequence`,
                    array: [...arr],
                    sortedArray: [...sorted],
                    currentIndex: i,
                    currentLength,
                    maxLength,
                    longestStart,
                    longestEnd,
                    isSorting: false,
                });
                currentLength = 1;
            }
        }

        newSteps.push({
            description: `Complete! Longest consecutive sequence has length ${maxLength}`,
            array: [...arr],
            sortedArray: [...sorted],
            currentIndex: null,
            currentLength,
            maxLength,
            longestStart,
            longestEnd,
            isSorting: false,
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

    return (
        <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Longest Consecutive Sequence - Sorting Approach
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

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Original Array:</h3>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {inputArray.map((num, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-bold text-lg transition-all duration-300"
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                </div>

                {currentStep && !currentStep.isSorting && (
                    <div>
                        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sorted Array:</h3>
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {currentStep.sortedArray.map((num, idx) => {
                                let bgColor = 'bg-gray-300 dark:bg-gray-600';
                                let textColor = 'text-gray-900 dark:text-white';
                                let border = 'border-2 border-transparent';

                                if (currentStep.currentIndex === idx) {
                                    bgColor = 'bg-blue-500 dark:bg-blue-600';
                                    textColor = 'text-white';
                                    border = 'border-2 border-blue-700';
                                } else if (
                                    idx >= currentStep.longestStart &&
                                    idx <= currentStep.longestEnd
                                ) {
                                    bgColor = 'bg-green-400 dark:bg-green-600';
                                    textColor = 'text-white';
                                } else if (
                                    currentStep.currentIndex !== null &&
                                    idx < currentStep.currentIndex &&
                                    idx >= currentStep.currentIndex - currentStep.currentLength + 1
                                ) {
                                    bgColor = 'bg-yellow-300 dark:bg-yellow-600';
                                    textColor = 'text-gray-900 dark:text-white';
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`flex flex-col items-center justify-center w-14 h-16 rounded-lg ${bgColor} ${textColor} ${border} font-bold transition-all duration-300`}
                                    >
                                        <div className="text-lg">{num}</div>
                                        <div className="text-xs opacity-70">{idx}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
                    <div className="card-body p-4">
                        <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Current Length</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {currentStep?.currentLength || 0}
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
                    <div className="card-body p-4">
                        <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Max Length</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {currentStep?.maxLength || 0}
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 dark:bg-gray-700 shadow-md">
                    <div className="card-body p-4">
                        <h3 className="card-title text-sm text-gray-700 dark:text-gray-300">Current Index</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentStep?.currentIndex !== null ? currentStep.currentIndex : '-'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Sorting Approach</h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Time Complexity:</strong> O(n log n) - Dominated by sorting</p>
                    <p><strong>Space Complexity:</strong> O(1) or O(n) - Depends on sorting algorithm</p>
                    <div className="mt-2">
                        <p className="font-semibold">Algorithm Steps:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Sort the array in ascending order</li>
                            <li>Scan through sorted array tracking current sequence length</li>
                            <li>Skip duplicates (same value)</li>
                            <li>If consecutive (num[i] = num[i-1] + 1), extend sequence</li>
                            <li>Otherwise, reset current length to 1</li>
                            <li>Track maximum length encountered</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}