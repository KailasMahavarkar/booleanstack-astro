// filename: GroupAnagramsComparison.tsx
import React, { useState } from 'react';

export default function GroupAnagramsComparison() {
  const [words, setWords] = useState<string[]>(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
  const [inputWord, setInputWord] = useState('');
  const [testWord1, setTestWord1] = useState('');
  const [testWord2, setTestWord2] = useState('');
  const [comparisonResult, setComparisonResult] = useState<{
    areAnagrams: boolean;
    sorted1: string;
    sorted2: string;
    charCount1: Map<string, number>;
    charCount2: Map<string, number>;
  } | null>(null);
  const [groupedResults, setGroupedResults] = useState<string[][]>([]);

  const addWord = () => {
    if (inputWord.trim() && !words.includes(inputWord.trim())) {
      setWords([...words, inputWord.trim()]);
      setInputWord('');
      setGroupedResults([]);
    }
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
    setGroupedResults([]);
  };

  const getCharCount = (word: string): Map<string, number> => {
    const map = new Map<string, number>();
    for (const char of word) {
      map.set(char, (map.get(char) || 0) + 1);
    }
    return map;
  };

  const checkAnagrams = () => {
    if (!testWord1 || !testWord2) return;

    const sorted1 = testWord1.split('').sort().join('');
    const sorted2 = testWord2.split('').sort().join('');
    const charCount1 = getCharCount(testWord1);
    const charCount2 = getCharCount(testWord2);

    const areAnagrams = sorted1 === sorted2;

    setComparisonResult({
      areAnagrams,
      sorted1,
      sorted2,
      charCount1,
      charCount2,
    });
  };

  const groupAllWords = () => {
    const groups = new Map<string, string[]>();
    
    words.forEach(word => {
      const sorted = word.split('').sort().join('');
      const existing = groups.get(sorted) || [];
      groups.set(sorted, [...existing, word]);
    });

    setGroupedResults(Array.from(groups.values()));
  };

  const resetComparison = () => {
    setTestWord1('');
    setTestWord2('');
    setComparisonResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Group Anagrams - Interactive Comparison</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Word Collection</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWord()}
                placeholder="Add word..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={addWord}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-md flex items-center gap-2"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => removeWord(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={groupAllWords}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              Group All Anagrams
            </button>

            {groupedResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold dark:text-white">Grouped Results:</h4>
                {groupedResults.map((group, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-green-50 dark:bg-green-900 rounded-md border-l-4 border-green-500"
                  >
                    <div className="flex flex-wrap gap-2">
                      {group.map((word, wordIdx) => (
                        <span
                          key={wordIdx}
                          className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 rounded font-medium"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Anagram Checker</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={testWord1}
                onChange={(e) => setTestWord1(e.target.value.toLowerCase())}
                placeholder="First word..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                value={testWord2}
                onChange={(e) => setTestWord2(e.target.value.toLowerCase())}
                placeholder="Second word..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={checkAnagrams}
                  disabled={!testWord1 || !testWord2}
                  className={`flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ${!testWord1 || !testWord2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Check Anagrams
                </button>
                <button
                  onClick={resetComparison}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            {comparisonResult && (
              <div className={`p-4 rounded-md border-2 ${comparisonResult.areAnagrams ? 'bg-green-50 dark:bg-green-900 border-green-500' : 'bg-red-50 dark:bg-red-900 border-red-500'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-4 h-4 rounded-full ${comparisonResult.areAnagrams ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-bold ${comparisonResult.areAnagrams ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {comparisonResult.areAnagrams ? 'ARE ANAGRAMS! ✓' : 'NOT ANAGRAMS ✗'}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold dark:text-white mb-1">Sorted Comparison:</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-1 bg-white dark:bg-gray-800 rounded dark:text-white">
                        "{comparisonResult.sorted1}"
                      </span>
                      <span className="dark:text-white">{comparisonResult.areAnagrams ? '=' : '≠'}</span>
                      <span className="font-mono px-2 py-1 bg-white dark:bg-gray-800 rounded dark:text-white">
                        "{comparisonResult.sorted2}"
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold dark:text-white mb-1">Character Counts:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded">
                        <p className="font-medium text-xs mb-1 dark:text-gray-300">{testWord1}:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(comparisonResult.charCount1.entries()).map(([char, count]) => (
                            <span key={char} className="text-xs px-1 bg-gray-200 dark:bg-gray-700 rounded dark:text-white">
                              {char}:{count}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded">
                        <p className="font-medium text-xs mb-1 dark:text-gray-300">{testWord2}:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(comparisonResult.charCount2.entries()).map(([char, count]) => (
                            <span key={char} className="text-xs px-1 bg-gray-200 dark:bg-gray-700 rounded dark:text-white">
                              {char}:{count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-3 dark:text-white">What are Anagrams?</h3>
        <div className="space-y-3 dark:text-gray-300">
          <p>
            Anagrams are words or phrases formed by rearranging the letters of another word or phrase, using all the original letters exactly once.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md">
              <p className="font-semibold text-green-800 dark:text-green-300 mb-2">✓ Examples of Anagrams:</p>
              <ul className="space-y-1 text-sm">
                <li>• "listen" ↔ "silent"</li>
                <li>• "eat" ↔ "tea" ↔ "ate"</li>
                <li>• "dormitory" ↔ "dirty room"</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900 rounded-md">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">✗ Not Anagrams:</p>
              <ul className="space-y-1 text-sm">
                <li>• "hello" vs "world" (different letters)</li>
                <li>• "abc" vs "abcd" (different lengths)</li>
                <li>• "aab" vs "abb" (different frequencies)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}