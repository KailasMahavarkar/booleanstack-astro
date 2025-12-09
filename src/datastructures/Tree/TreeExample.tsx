import React from 'react'
import Tree from './Tree'
import { type TreeNodeData } from "./type"

const TreeExampleWithZoom: React.FC = () => {
    // Sample tree data
    const binaryTreeData: TreeNodeData = {
        value: 10,
        children: [
            {
                value: 5,
                children: [
                    { value: 3, children: [] },
                    { value: 7, children: [] }
                ]
            },
            {
                value: 15,
                children: [
                    { value: 12, children: [] },
                    { value: 18, children: [] }
                ]
            }
        ]
    }

    const largeTreeData: TreeNodeData = {
        value: 50,
        children: [
            {
                value: 25,
                children: [
                    {
                        value: 10,
                        children: [
                            { value: 5, children: [] },
                            { value: 15, children: [] }
                        ]
                    },
                    {
                        value: 35,
                        children: [
                            { value: 30, children: [] },
                            { value: 40, children: [] }
                        ]
                    }
                ]
            },
            {
                value: 75,
                children: [
                    {
                        value: 60,
                        children: [
                            { value: 55, children: [] },
                            { value: 65, children: [] }
                        ]
                    },
                    {
                        value: 90,
                        children: [
                            { value: 85, children: [] },
                            { value: 95, children: [] }
                        ]
                    }
                ]
            }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Tree Component with Zoom Controls</h1>

                {/* Example 1: Static Tree with Zoom (No Panning) */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Static Tree with Zoom Only</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        This tree has zoom enabled but panning is disabled. Use the controls or mouse wheel to zoom.
                        The zoom origin selector controls where the zoom focuses.
                    </p>
                    <Tree
                        {...binaryTreeData}
                        width="100%"
                        height="400px"
                        allowCanvas={false}
                        initialZoom={1}
                        minZoom={0.5}
                        maxZoom={2}
                        zoomStep={0.1}
                    />
                </div>

                {/* Example 2: Full Canvas Mode with Pan and Zoom */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Full Canvas Mode (Pan + Zoom)</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Complete canvas mode with both panning and zooming. Drag to pan, use controls or scroll to zoom.
                        The dropdown lets you choose the zoom origin point.
                    </p>
                    <Tree
                        {...largeTreeData}
                        width="100%"
                        height="500px"
                        allowCanvas={true}
                        initialZoom={0.8}
                        minZoom={0.3}
                        maxZoom={3}
                        zoomStep={0.2}
                    />
                </div>

                {/* Example 3: Custom Zoom Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Custom Zoom Settings</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Fine control over zoom behavior with custom min/max limits and step size.
                    </p>
                    <Tree
                        {...binaryTreeData}
                        width="100%"
                        height="400px"
                        allowCanvas={true}
                        initialZoom={1.5}
                        minZoom={0.5}
                        maxZoom={5}
                        zoomStep={0.5}
                        containerStyle={{
                            background: 'linear-gradient(to bottom right, #ebf8ff, #e0e7ff)'
                        }}
                    />
                </div>

                {/* Example 4: Side by Side Comparison */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Zoom Behavior Comparison</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Zoom from Center (Default)</h3>
                            <Tree
                                {...binaryTreeData}
                                width="100%"
                                height="350px"
                                allowCanvas={true}
                                initialZoom={1}
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Try Different Zoom Origins</h3>
                            <Tree
                                {...binaryTreeData}
                                width="100%"
                                height="350px"
                                allowCanvas={true}
                                initialZoom={1}
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Documentation */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">New Zoom Features</h3>
                    <div className="text-blue-800 space-y-2">
                        <p>✅ <b>Zoom Controls:</b> + and - buttons to zoom in/out</p>
                        <p>✅ <b>Zoom Display:</b> Shows current zoom percentage</p>
                        <p>✅ <b>Zoom Origin Selector:</b> Choose where zoom focuses (center, corners)</p>
                        <p>✅ <b>Mouse Wheel Support:</b> Scroll to zoom when allowCanvas is true</p>
                        <p>✅ <b>Reset Button:</b> Appears when view is modified, resets both pan and zoom</p>
                        <p>✅ <b>Configurable Limits:</b> Set min/max zoom and step size</p>
                    </div>

                    <h4 className="text-md font-semibold text-blue-900 mt-4 mb-2">Props:</h4>
                    <div className="text-sm text-blue-800 space-y-1 font-mono bg-white p-3 rounded">
                        <div>initialZoom?: number // Default: 1</div>
                        <div>minZoom?: number // Default: 0.3</div>
                        <div>maxZoom?: number // Default: 3</div>
                        <div>zoomStep?: number // Default: 0.2</div>
                    </div>

                    <h4 className="text-md font-semibold text-blue-900 mt-4 mb-2">Zoom Origins Explained:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p>• <b>Center:</b> Zooms in/out from the center of the container</p>
                        <p>• <b>Top Left:</b> Keeps the top-left corner fixed while zooming</p>
                        <p>• <b>Top Right:</b> Keeps the top-right corner fixed while zooming</p>
                        <p>• <b>Bottom Left:</b> Keeps the bottom-left corner fixed while zooming</p>
                        <p>• <b>Bottom Right:</b> Keeps the bottom-right corner fixed while zooming</p>
                    </div>
                </div>

                {/* Usage Examples Code */}
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Usage Examples</h3>
                    <pre className="text-sm overflow-x-auto">
                        {`// Basic tree with default zoom
<Tree
    value={10}
    children={[...]}
/>

// Tree with custom zoom settings
<Tree
    value={10}
    children={[...]}
    width="100%"
    height="500px"
    allowCanvas={true}
    initialZoom={0.8}
    minZoom={0.5}
    maxZoom={2}
    zoomStep={0.1}
/>

// Static tree with zoom but no panning
<Tree
    value={10}
    children={[...]}
    allowCanvas={false}
    initialZoom={1.2}
/>`}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default TreeExampleWithZoom