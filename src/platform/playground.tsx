import React from 'react'

const Playground = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='flex flex-col gap-4 border-2 border-gray-300 rounded-md p-4'>
            {children}
        </div>
    )
}

export default Playground