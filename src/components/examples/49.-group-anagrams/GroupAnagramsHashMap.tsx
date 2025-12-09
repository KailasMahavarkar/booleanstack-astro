// filename: GroupAnagramsHashMap.tsx
import React, { useState } from 'react';

export default function GroupAnagramsHashMap() {
  const [words, setWords] = useState<string[]>(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
  const [inputWord, setInputWord] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [currentSortedKey, setCurrentSortedKey] = useState<string>('');
  const [groups, setGroups] = useState<Map<string, string[]>>(new Map());
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const reset = () => {
    setCurrentWordIndex(null);
    setCurrentSortedKey('');
    setGroups(new Map());
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const startGrouping = () => {
    reset();
    const newSteps: string[] = [];
    newSteps.push('Initialize empty hash map to store anagram groups');
    
    words.forEach((word, index) => {
      const sorted = word.split('').sort().join('');
      newSteps.push(`Process word "${word}" → sorted key: "${sorted}"`);
      newSteps.push(`Add "${word}" to group with key "${sorted}"`);
    });
    
    newSteps.push('Grouping complete! All anagrams are grouped together.');
    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const nextStepIndex = currentStep + 1;
    const step = steps[nextStepIndex];
    setCurrentStep(nextStepIndex);

    if (step.includes('Process word')) {
      const wordMatch = step.match(/Process word "(\w+)"/);
      const sortedMatch = step.match(/sorted key: "(\w+)"/);
      
      if (wordMatch && sortedMatch) {
        const word = wordMatch[1];
        const sorted = sortedMatch[1];
        const index = words.indexOf(word);
        setCurrentWordIndex(index);
        setCurrentSortedKey(sorted);
      }
    } else if (step.includes('Add')) {
      const wordMatch = step.match(/Add "(\w+)"/);
      const keyMatch = step.match(/key "(\w+)"/);
      
      if (wordMatch && keyMatch) {
        const word = wordMatch[1];
        const key = keyMatch[1];
        
        setGroups(prev => {
          const newGroups = new Map(prev);
          const existing = newGroups.get(key) || [];
          newGroups.set(key, [...existing, word]);
          return newGroups;
        });
      }
    } else if (step.includes('complete')) {
      setCurrentWordIndex(null);
      setCurrentSortedKey('');
    }
  };

  const addWord = () => {
    if (inputWord.trim()) {
      setWords([...words, inputWord.trim()]);
      setInputWord('');
      reset();
    }
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Group Anagrams - HashMap Method</h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
              placeholder="Add word..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addWord}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Word
            </button>
            <button
              onClick={startGrouping}
              disabled={steps.length > 0}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${steps.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Start Grouping
            </button>
            <button
              onClick={nextStep}
              disabled={steps.length === 0 || isComplete}
              className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ${steps.length === 0 || isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next Step →
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
            >
              Reset
            </button>
          </div>

          <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900 rounded-md font-medium text-blue-900 dark:text-blue-100">
            {currentStep < steps.length ? steps[currentStep] : "Click 'Start Grouping' to begin"}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3 dark:text-white">Input Words:</h3>
          <div className="flex flex-wrap gap-2">
            {words.map((word, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-md transition-all duration-300 ${
                  currentWordIndex === index
                    ? 'bg-yellow-400 text-black scale-110 font-bold'
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                }`}
              >
                <span>{word}</span>
                <button
                  onClick={() => removeWord(index)}
                  className="ml-2 text-red-600 hover:text-red-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {currentSortedKey && (
          <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-md">
            <p className="font-semibold dark:text-white">
              Current Sorted Key: <span className="text-yellow-700 dark:text-yellow-300 font-mono">{currentSortedKey}</span>
            </p>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-3 dark:text-white">Anagram Groups (HashMap):</h3>
          <div className="space-y-3">
            {Array.from(groups.entries()).map(([key, groupWords]) => (
              <div key={key} className="p-4 bg-green-50 dark:bg-green-900 rounded-md border-2 border-green-300 dark:border-green-700">
                <div className="font-mono text-sm text-green-700 dark:text-green-300 mb-2">
                  Key: "{key}"
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupWords.map((word, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 rounded-md font-medium">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 dark:text-white">Algorithm Explanation</h3>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Create a hash map to store groups of anagrams</li>
          <li>For each word, sort its characters to create a key (e.g., "eat" → "aet")</li>
          <li>Use the sorted string as the hash map key</li>
          <li>Add the original word to the array at that key</li>
          <li>All anagrams will have the same sorted key and end up in the same group</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm dark:text-blue-100">
            <strong>Time Complexity:</strong> O(N × K log K) where N is the number of words and K is the maximum length of a word
          </p>
        </div>
      </div>
    </div>
  );
}