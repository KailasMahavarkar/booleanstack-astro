// filename: GroupAnagramsCharacterCount.tsx
import React, { useState } from 'react';

export default function GroupAnagramsCharacterCount() {
  const [words, setWords] = useState<string[]>(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [charCount, setCharCount] = useState<number[]>([]);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [groups, setGroups] = useState<Map<string, string[]>>(new Map());
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const reset = () => {
    setCurrentWordIndex(null);
    setCurrentWord('');
    setCharCount([]);
    setCurrentKey('');
    setGroups(new Map());
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const getCharCountKey = (word: string): { key: string; counts: number[] } => {
    const counts = new Array(26).fill(0);
    for (const char of word) {
      counts[char.charCodeAt(0) - 97]++;
    }
    const key = counts.join('#');
    return { key, counts };
  };

  const startGrouping = () => {
    reset();
    const newSteps: string[] = [];
    newSteps.push('Initialize empty hash map with character count keys');
    
    words.forEach((word) => {
      newSteps.push(`Process word: "${word}"`);
      newSteps.push(`Count character frequencies for "${word}"`);
      const { key } = getCharCountKey(word);
      newSteps.push(`Generated key: ${key}`);
      newSteps.push(`Add "${word}" to group with this key`);
    });
    
    newSteps.push('Grouping complete using character frequency method!');
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

    if (step.includes('Process word:')) {
      const match = step.match(/Process word: "(\w+)"/);
      if (match) {
        const word = match[1];
        const index = words.findIndex(w => w === word && (currentWordIndex === null || words.indexOf(w, currentWordIndex + 1) >= 0));
        setCurrentWordIndex(index);
        setCurrentWord(word);
        setCharCount([]);
        setCurrentKey('');
      }
    } else if (step.includes('Count character frequencies')) {
      if (currentWord) {
        const { counts } = getCharCountKey(currentWord);
        setCharCount(counts);
      }
    } else if (step.includes('Generated key:')) {
      const match = step.match(/Generated key: (.+)/);
      if (match) {
        setCurrentKey(match[1]);
      }
    } else if (step.includes('Add')) {
      const wordMatch = step.match(/Add "(\w+)"/);
      if (wordMatch && currentKey) {
        const word = wordMatch[1];
        setGroups(prev => {
          const newGroups = new Map(prev);
          const existing = newGroups.get(currentKey) || [];
          newGroups.set(currentKey, [...existing, word]);
          return newGroups;
        });
      }
    } else if (step.includes('complete')) {
      setCurrentWordIndex(null);
      setCurrentWord('');
      setCharCount([]);
      setCurrentKey('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Group Anagrams - Character Count Method</h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
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
                {word}
              </div>
            ))}
          </div>
        </div>

        {currentWord && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
            <h4 className="font-semibold mb-2 dark:text-white">
              Processing: <span className="text-yellow-700 dark:text-yellow-300">{currentWord}</span>
            </h4>
            {charCount.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2 dark:text-gray-300">Character Frequency Array (a-z):</p>
                <div className="flex flex-wrap gap-1">
                  {charCount.map((count, idx) => {
                    if (count > 0) {
                      return (
                        <div key={idx} className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-xs font-mono">
                          {String.fromCharCode(97 + idx)}: {count}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                {currentKey && (
                  <p className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    Key: {currentKey}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-3 dark:text-white">Anagram Groups:</h3>
          <div className="space-y-3">
            {Array.from(groups.entries()).map(([key, groupWords], idx) => (
              <div key={idx} className="p-4 bg-green-50 dark:bg-green-900 rounded-md border-2 border-green-300 dark:border-green-700">
                <div className="text-xs font-mono text-green-700 dark:text-green-300 mb-2 break-all">
                  Key: {key}
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupWords.map((word, wordIdx) => (
                    <span key={wordIdx} className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 rounded-md font-medium">
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
        <h3 className="text-xl font-bold mb-3 dark:text-white">Character Count Method</h3>
        <ol className="list-decimal pl-5 space-y-2 dark:text-gray-300">
          <li>Create a frequency array of size 26 (for a-z)</li>
          <li>For each word, count the occurrence of each character</li>
          <li>Convert the frequency array to a string key (e.g., "1#0#0#1#1#0...#1")</li>
          <li>Use this key in the hash map to group anagrams</li>
          <li>Words with identical character frequencies are anagrams</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
          <p className="text-sm dark:text-blue-100">
            <strong>Time Complexity:</strong> O(N × K) where N is the number of words and K is the maximum length of a word
            <br />
            <strong>Advantage:</strong> Better than sorting approach (O(N × K log K))
          </p>
        </div>
      </div>
    </div>
  );
}