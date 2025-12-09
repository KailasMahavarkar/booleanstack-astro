/**
 * Call Tracer Utility
 * Instruments JavaScript functions to automatically track recursive calls
 * and generate visualization data for RecursiveVisualizer
 */

/**
 * Creates a tracer that records function calls and returns
 * @param {Function} fn - The function to trace
 * @param {string} functionName - Name of the function for display
 * @returns {Object} - { tracedFn, getCalls }
 */
export function createCallTracer(fn, functionName = 'function') {
    const calls = []
    let callCounter = 0
    let returnCounter = 0
    const callStack = []
    
    /**
     * Wraps a function to trace its execution
     */
    function traceFunction(originalFn, name) {
        return function(...args) {
            // Create unique ID for this call
            const callId = `call-${callCounter}`
            const parentId = callStack.length > 0 ? callStack[callStack.length - 1].id : undefined
            const depth = callStack.length
            
            // Record the call
            const callInfo = {
                id: callId,
                functionName: name,
                args: args.length === 1 ? String(args[0]) : args.map(String),
                parentId: parentId,
                depth: depth,
                callStep: callCounter,
                returnStep: undefined,
                returnValue: undefined
            }
            
            calls.push(callInfo)
            callStack.push(callInfo)
            callCounter++
            
            try {
                // Execute the function
                const result = originalFn.apply(this, args)
                
                // Record the return
                callInfo.returnValue = result
                callInfo.returnStep = returnCounter
                returnCounter++
                
                callStack.pop()
                return result
            } catch (error) {
                callStack.pop()
                throw error
            }
        }
    }
    
    // Create the traced version of the function
    const tracedFn = traceFunction(fn, functionName)
    
    return {
        /**
         * The traced function - call this instead of the original
         */
        tracedFn,
        
        /**
         * Get all recorded calls
         * @returns {Array} Array of call objects compatible with IRecursiveCall
         */
        getCalls: () => [...calls],
        
        /**
         * Reset the tracer state
         */
        reset: () => {
            calls.length = 0
            callCounter = 0
            returnCounter = 0
            callStack.length = 0
        }
    }
}

/**
 * Executes JavaScript code and traces function calls
 * @param {string} code - JavaScript code as a string
 * @param {string} functionName - Name of the main function to trace
 * @param {Array} args - Arguments to pass to the function
 * @returns {Object} - { result, calls }
 */
export function generateCalls(code, functionName, args = []) {
    try {
        const calls = []
        const counters = { call: 0, return: 0 }
        const callStack = []
        
        // Create a sandboxed environment
        const sandbox = {
            console: console,
            Math: Math,
            Array: Array,
            Object: Object,
            String: String,
            Number: Number,
            Boolean: Boolean,
            JSON: JSON
        }
        
        // Instrument the code to trace recursive calls
        const instrumentedCode = `
            ${code}
            
            // Store the original function
            const __original_${functionName} = ${functionName};
            
            // Replace with traced version
            ${functionName} = function(...args) {
                const callId = 'call-' + __counters.call;
                const parentId = __callStack.length > 0 ? __callStack[__callStack.length - 1].id : undefined;
                const depth = __callStack.length;
                
                const callInfo = {
                    id: callId,
                    functionName: '${functionName}',
                    args: args.length === 1 ? String(args[0]) : args.map(String),
                    parentId: parentId,
                    depth: depth,
                    callStep: __counters.call,
                    returnStep: undefined,
                    returnValue: undefined
                };
                
                __calls.push(callInfo);
                __callStack.push(callInfo);
                __counters.call++;
                
                try {
                    const result = __original_${functionName}.apply(this, args);
                    callInfo.returnValue = result;
                    callInfo.returnStep = __counters.return;
                    __counters.return++;
                    __callStack.pop();
                    return result;
                } catch (error) {
                    __callStack.pop();
                    throw error;
                }
            };
            
            // Execute and return result
            return ${functionName}(...__args);
        `
        
        // Create execution context with tracing variables
        const executeFunction = new Function(
            '__calls',
            '__counters', 
            '__callStack',
            '__args',
            ...Object.keys(sandbox),
            instrumentedCode
        )
        
        // Execute with tracing context
        const result = executeFunction(
            calls,
            counters,
            callStack,
            args,
            ...Object.values(sandbox)
        )
        
        return {
            result,
            calls,
            error: null
        }
    } catch (error) {
        console.error('Error in generateCalls:', error)
        return {
            result: null,
            calls: [],
            error: error.message
        }
    }
}

/**
 * Helper to trace a pre-defined function
 * @param {Function} fn - The function to trace
 * @param {string} name - Name for display
 * @param {Array} args - Arguments to pass
 * @returns {Object} - { result, calls }
 */
export function traceFunction(fn, name, args = []) {
    const { tracedFn, getCalls } = createCallTracer(fn, name)
    
    try {
        const result = tracedFn(...args)
        return {
            result,
            calls: getCalls(),
            error: null
        }
    } catch (error) {
        return {
            result: null,
            calls: getCalls(),
            error: error.message
        }
    }
}

/**
 * Example usage generator for common recursive functions
 */
export const examples = {
    fibonacci: (n) => generateCalls(
        `
        function fibonacci(n) {
            if (n <= 1) return n;
            return fibonacci(n - 1) + fibonacci(n - 2);
        }
        `,
        'fibonacci',
        [n]
    ),
    
    factorial: (n) => generateCalls(
        `
        function factorial(n) {
            if (n <= 1) return 1;
            return n * factorial(n - 1);
        }
        `,
        'factorial',
        [n]
    ),
    
    power: (base, exp) => generateCalls(
        `
        function power(base, exp) {
            if (exp === 0) return 1;
            if (exp === 1) return base;
            return base * power(base, exp - 1);
        }
        `,
        'power',
        [base, exp]
    ),
    
    sumArray: (arr) => generateCalls(
        `
        function sumArray(arr) {
            if (arr.length === 0) return 0;
            if (arr.length === 1) return arr[0];
            return arr[0] + sumArray(arr.slice(1));
        }
        `,
        'sumArray',
        [arr]
    ),
    
    gcd: (a, b) => generateCalls(
        `
        function gcd(a, b) {
            if (b === 0) return a;
            return gcd(b, a % b);
        }
        `,
        'gcd',
        [a, b]
    )
}

