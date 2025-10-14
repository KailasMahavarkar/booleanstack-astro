import { Graph } from '@src/datastructures'

const Play = () => {
    return (
        <div>
            <Graph
                config={{
                    nodeRadius: 30,
                    colors: {
                        nodeBackgroundColor: 'red',
                        nodeTextColor: 'white',
                        nodeStrokeColor: 'black',
                        nodeHighlightBackgroundColor: 'blue',
                        nodeHighlightTextColor: 'white',
                        nodeHighlightStrokeColor: 'black',
                        depthColorMap: {
                            1: 'red',
                            2: 'blue',
                            3: 'green',
                        },
                        edgeColor: 'red',
                        edgeHighlightColor: '',
                        edgeLabelBackgroundColor: '',
                        edgeLabelTextColor: '',
                        edgeLabelStrokeColor: '',
                        arrowColor: '',
                        arrowHighlightColor: '',
                        selfLoopColor: '',
                        selfLoopHighlightColor: '',
                        svgBackgroundColor: '',
                        svgBorderColor: ''
                    }
                }}
                nodes={[
                    { id: '1', label: 'Node 1', x: 100, y: 100},
                    { id: '2', label: 'Node 2', x: 200, y: 200 },
                    { id: '3', label: 'Node 3', x: 300, y: 300 },
                ]}
                edges={[
                    { id: '1->2', source: '1', target: '2' },
                    { id: '2->3', source: '2', target: '3' },
                    { id: '3->1', source: '3', target: '1' },
                ]}
                onNodeClick={(node) => {
                    console.log(node)
                }}
            />
        </div>
    )
}

export default Play