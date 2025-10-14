import SCC from "./SCC/KosarajuForSCC";

const GraphEntry = () => {
    return (
        <div className="w-full">
            <div className='mb-6'>
                <h1 className="text-2xl font-bold text-base-content mb-4">Strongly Connected Components (SCC)</h1>
                <div className='mb-4'>
                    <h2 className="text-lg font-semibold text-base-content mb-2">Graph Data Structure</h2>
                    <p className="text-base-content/80">
                        A graph is a data structure that consists of a finite set of vertices (or nodes) 
                        and a set of edges connecting these vertices. Strongly Connected Components (SCCs) 
                        are subgraphs where every vertex can reach every other vertex within the component.
                    </p>
                </div>
            </div>
            
            <div className="bg-base-100 rounded-lg p-4">
                <SCC />
            </div>
        </div>
    )
}

export default GraphEntry;