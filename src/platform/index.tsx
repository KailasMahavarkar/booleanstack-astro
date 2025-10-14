import { useState } from 'react';
import KosarajuForSCC from './graph/SCC/KosarajuForSCC';
import TarjansAlgo from './graph/tarjans/TarjansAlgo';
import TarjansAlgoForSCC from './graph/tarjans/TajansAlgoForSCC';
import TarjansAlgoForArticulationPoints from './graph/tarjans/TarjansArticulationPoint';
import EulerianPathCircuit from './graph/eulars/EularsPath';

// TypeScript interfaces
interface Subsection {
    component: React.ComponentType;
    description: string;
    tags: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Section {
    description: string;
    icon: string;
    subsections: Record<string, Subsection>;
}

// Define sections and their subsections
const sections: Record<string, Section> = {
    'Graph Algorithms': {
        description: 'Interactive visualizations of graph algorithms and data structures',
        icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3',
        subsections: {
            'Strongly Connected Components (SCC)': {
                component: KosarajuForSCC,
                description: 'Find strongly connected components in directed graphs using Kosaraju\'s algorithm',
                tags: ['graph', 'algorithms', 'dfs', 'kosaraju'],
                difficulty: 'Intermediate'
            },
            'Tarjan\'s Algorithm': {
                component: TarjansAlgo,
                description: 'Find bridges and articulation points in graphs using Tarjan\'s algorithm',
                tags: ['graph', 'algorithms', 'dfs', 'tarjan'],
                difficulty: 'Advanced'
            },
            'Tarjan\'s Algorithm for SCC': {
                component: TarjansAlgoForSCC,
                description: 'Find strongly connected components in directed graphs using Tarjan\'s algorithm',
                tags: ['graph', 'algorithms', 'dfs', 'tarjan'],
                difficulty: 'Advanced'
            },
            'Tarjan\'s Algorithm for Articulation Points': {
                component: TarjansAlgoForArticulationPoints,
                description: 'Find articulation points in graphs using Tarjan\'s algorithm',
                tags: ['graph', 'algorithms', 'dfs', 'tarjan'],
                difficulty: 'Advanced'
            },
            'Eulerian Path': {
                component: EulerianPathCircuit,
                description: 'Find Eulerian paths in graphs using Eulerian path algorithm',
                tags: ['graph', 'algorithms', 'dfs', 'eulerian'],
                difficulty: 'Advanced'
            },
            'Minimum Spanning Tree': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Kruskal, Prim algorithms</p></div>,
                description: 'Find minimum spanning trees in weighted graphs',
                tags: ['graph', 'mst', 'kruskal', 'prim'],
                difficulty: 'Intermediate'
            }
        }
    },
    'Dynamic Programming': {
        description: 'Step-by-step visualization of dynamic programming solutions',
        icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
        subsections: {
            'Longest Increasing Subsequence (LIS)': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: LIS with DP table visualization</p></div>,
                description: 'Find the longest subsequence that is strictly increasing',
                tags: ['dp', 'lis', 'subsequence', 'optimization'],
                difficulty: 'Intermediate'
            },
            'Longest Common Subsequence (LCS)': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: LCS with matrix visualization</p></div>,
                description: 'Find the longest subsequence common to two sequences',
                tags: ['dp', 'lcs', 'subsequence', 'string'],
                difficulty: 'Intermediate'
            },
            'Knapsack Problem': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: 0/1 and fractional knapsack</p></div>,
                description: 'Optimize value while respecting weight constraints',
                tags: ['dp', 'knapsack', 'optimization', 'greedy'],
                difficulty: 'Advanced'
            },
            'Edit Distance': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Levenshtein distance visualization</p></div>,
                description: 'Find minimum operations to transform one string to another',
                tags: ['dp', 'string', 'edit-distance', 'levenshtein'],
                difficulty: 'Intermediate'
            }
        }
    },
    'Data Structures': {
        description: 'Interactive demonstrations of fundamental data structures',
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        subsections: {
            'Binary Search Tree': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: BST operations and traversal</p></div>,
                description: 'Interactive BST with insert, delete, and traversal operations',
                tags: ['tree', 'bst', 'data-structure', 'traversal'],
                difficulty: 'Beginner'
            },
            'AVL Tree': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Self-balancing BST visualization</p></div>,
                description: 'Self-balancing binary search tree with rotations',
                tags: ['tree', 'avl', 'self-balancing', 'rotations'],
                difficulty: 'Advanced'
            },
            'Heap': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Min/Max heap operations</p></div>,
                description: 'Priority queue implementation with heapify operations',
                tags: ['heap', 'priority-queue', 'heapify', 'data-structure'],
                difficulty: 'Intermediate'
            }
        }
    },
    'Sorting Algorithms': {
        description: 'Compare and visualize different sorting algorithms',
        icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12',
        subsections: {
            'Bubble Sort': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Bubble sort with step-by-step animation</p></div>,
                description: 'Simple sorting algorithm with O(n²) complexity',
                tags: ['sorting', 'bubble-sort', 'comparison', 'beginner'],
                difficulty: 'Beginner'
            },
            'Quick Sort': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Quick sort with partition visualization</p></div>,
                description: 'Divide-and-conquer sorting with O(n log n) average case',
                tags: ['sorting', 'quick-sort', 'divide-conquer', 'pivot'],
                difficulty: 'Intermediate'
            },
            'Merge Sort': {
                component: () => <div className="text-center p-8"><p className="text-base-content/60">Coming soon: Merge sort with merge visualization</p></div>,
                description: 'Stable sorting algorithm with guaranteed O(n log n)',
                tags: ['sorting', 'merge-sort', 'stable', 'divide-conquer'],
                difficulty: 'Intermediate'
            }
        }
    }
};

const PlatformEntry = () => {
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);

    const handleSectionSelect = (sectionName: string) => {
        setSelectedSection(sectionName);
        setSelectedSubsection(null);
    };

    const handleSubsectionSelect = (subsectionName: string) => {
        setSelectedSubsection(subsectionName);
    };

    const handleBackToSections = () => {
        setSelectedSection(null);
        setSelectedSubsection(null);
    };

    const handleBackToSubsections = () => {
        setSelectedSubsection(null);
    };

    // If a specific subsection is selected, show that demo
    if (selectedSection && selectedSubsection && sections[selectedSection]?.subsections[selectedSubsection]) {
        const subsection = sections[selectedSection].subsections[selectedSubsection];
        const SubsectionComponent = subsection.component;
        
        return (
            <div className="min-h-screen bg-base-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb Navigation */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <button 
                                onClick={handleBackToSections}
                                className="flex items-center gap-2 px-3 py-1 bg-base-300 text-base-content rounded-lg hover:bg-base-300/80 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                All Sections
                            </button>
                            <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <button 
                                onClick={handleBackToSubsections}
                                className="flex items-center gap-2 px-3 py-1 bg-base-300 text-base-content rounded-lg hover:bg-base-300/80 transition-colors text-sm"
                            >
                                {selectedSection}
                            </button>
                            <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                {selectedSubsection}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl font-bold text-base-content">{selectedSubsection}</h1>
                        <p className="text-base-content/70 mt-2">{sections[selectedSection].subsections[selectedSubsection].description}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-base-300 text-base-content rounded-lg text-sm">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                {sections[selectedSection].subsections[selectedSubsection].difficulty}
                            </span>
                            <div className="flex gap-1">
                                {sections[selectedSection].subsections[selectedSubsection].tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-base-300 text-base-content/70 text-xs rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-base-200 rounded-lg p-6 shadow-lg">
                        <SubsectionComponent />
                    </div>
                </div>
            </div>
        );
    }

    // If a section is selected, show its subsections
    if (selectedSection && sections[selectedSection]) {
        const section = sections[selectedSection];
        
        return (
            <div className="min-h-screen bg-base-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <button 
                            onClick={handleBackToSections}
                            className="flex items-center gap-2 px-4 py-2 bg-base-300 text-base-content rounded-lg hover:bg-base-300/80 transition-colors mb-4"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to All Sections
                        </button>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-base-content">{selectedSection}</h1>
                                <p className="text-base-content/70">{section.description}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(section.subsections).map(([subsectionName, subsection]) => (
                            <div 
                                key={subsectionName}
                                className="bg-base-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
                                onClick={() => handleSubsectionSelect(subsectionName)}
                            >
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                            subsection.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                            subsection.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${
                                                subsection.difficulty === 'Beginner' ? 'bg-green-500' :
                                                subsection.difficulty === 'Intermediate' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}></span>
                                            {subsection.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-base-content mb-2">{subsectionName}</h3>
                                    <p className="text-base-content/70 text-sm leading-relaxed">
                                        {subsection.description}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {subsection.tags.map(tag => (
                                        <span 
                                            key={tag}
                                            className="px-2 py-1 bg-base-300 text-base-content/70 text-xs rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-primary text-sm font-medium">Click to explore →</span>
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Show all sections
    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-base-content">
                    Algorithm Playground
                </h1>
                <p className="text-center text-base-content/70 mb-12 max-w-2xl mx-auto">
                    Explore interactive demonstrations of algorithms and data structures organized by topic. 
                    Click on any section to see available algorithms within that category.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(sections).map(([sectionName, section]) => (
                        <div 
                            key={sectionName}
                            className="bg-base-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
                            onClick={() => handleSectionSelect(sectionName)}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-base-content mb-2">{sectionName}</h3>
                                    <p className="text-base-content/70 text-sm leading-relaxed">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-primary text-sm font-medium">
                                    {Object.keys(section.subsections).length} algorithms available →
                                </span>
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlatformEntry;