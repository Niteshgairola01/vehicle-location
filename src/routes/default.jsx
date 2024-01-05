import React from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';

const Default = () => {
    return (
        <>
            <Navbar />
            <div className=''>
                <AllRoutes />
            </div>
        </>
    )
}

export default Default
