// filename: StringScoreBasic.tsx
import React, { useState } from 'react';

export default function StringScoreBasic() {
  const [inputString, setInputString] = useState('hello');
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [pairScores, setPairScores] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const reset = () => {
    setCurrentIndex(null);
    setPairScores([]);
    setTotalScore(null);
    setIsComplete(false);
    setSteps([]);
    setCurrentStep(0);
  };

  const startCalculation = () => {
    reset();
    const newSteps: string[] = [];
    const scores: number[] = [];
    
    newSteps.push(`Starting with string: "${inputString}"`);
    
    for (let i = 0; i < inputString.length - 1; i++) {
      const char1 = inputString[i];
      const char2 = inputString[i + 1];
      const ascii1 = inputString.charCodeAt(i);
      const ascii2 = inputString.charCodeAt(i + 1);
      const diff = Math.abs(ascii1 - ascii2);
      
      scores.push(diff);
      newSteps.push(
        `Pair ${i + 1}: '${char1}' (${ascii1}) and '${char2}' (${ascii2}) → |${ascii1} - ${ascii2}| = ${diff}`
      );
    }
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    newSteps.push(`Total Score: ${scores.join(' + ')} = ${total}`);
    
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const nextStepIndex = currentStep + 1;
    setCurrentStep(nextStepIndex);

    if (nextStepIndex === 0) {
      return;
    }

    if (steps[nextStepIndex].includes('Total Score')) {
      const scores: number[] = [];
      for (let i = 0; i < inputString.length - 1; i++) {
        const diff = Math.abs(inputString.charCodeAt(i) - inputString.charCodeAt(i + 1));
        scores.push(diff);
      }
      setPairScores(scores);
      setTotalScore(scores.reduce((sum, score) => sum + score, 0));
      setCurrentIndex(null);
    } else {
      const pairMatch = steps[nextStepIndex].match(/Pair (\d+)/);
      if (pairMatch) {
        const pairNum = parseInt(pairMatch[1]);
        const index = pairNum - 1;
        setCurrentIndex(index);
        
        const newScores = [...pairScores];
        const diff = Math.abs(inputString.charCodeAt(index) - inputString.charCodeAt(index + 1));
        newScores[index] = diff;
        setPairScores(newScores);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    setInputString(value);
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">String Score Calculator</h1>
        
        {/* Control Panel */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="input" className="font-medium dark:text-white">
                  String:
                </label>
                <input
                  id="input"
                  type="text"
                  value={inputString}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  placeholder="Enter lowercase letters"
                />
              </div>
              <button
                onClick={startCalculation}
                disabled={steps.length > 0 || inputString.length < 2}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                  steps.length > 0 || inputString.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Start
              </button>
              <button
                onClick={nextStep}
                disabled={steps.length === 0 || isComplete}
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                  steps.length === 0 || isComplete ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Next Step →
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors dark:text-white"
              >
                Reset
              </button>
            </div>

            <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100">
              {currentStep < steps.length ? steps[currentStep] : "Click 'Start' to begin calculation"}
            </div>
          </div>
        </div>

        {/* String Visualization */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {inputString.split('').map((char, index) => {
            let bgColor = 'bg-gray-200 dark:bg-gray-600';
            let textColor = 'text-gray-900 dark:text-white';
            let borderColor = 'border-gray-300 dark:border-gray-500';

            if (currentIndex !== null && (index === currentIndex || index === currentIndex + 1)) {
              bgColor = 'bg-yellow-300 dark:bg-yellow-600';
              textColor = 'text-gray-900';
              borderColor = 'border-yellow-500';
            }

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-md border-2 ${bgColor} ${textColor} ${borderColor} transition-all duration-300`}
                >
                  <div className="font-bold text-xl">{char}</div>
                  <div className="text-xs">{char.charCodeAt(0)}</div>
                </div>
                <div className="text-xs mt-1 dark:text-gray-300">[{index}]</div>
                {index < inputString.length - 1 && pairScores[index] !== undefined && (
                  <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                    +{pairScores[index]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Score Display */}
        {totalScore !== null && (
          <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow-md p-6 text-center">
            <div className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">Total Score</div>
            <div className="text-4xl font-bold text-green-900 dark:text-green-100">{totalScore}</div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>For each adjacent pair of characters in the string, calculate the absolute difference of their ASCII values.</li>
          <li>Sum all these differences to get the total score.</li>
          <li>Formula: score = |s[0] - s[1]| + |s[1] - s[2]| + ... + |s[n-2] - s[n-1]|</li>
        </ol>
      </div>
    </div>
  );
}