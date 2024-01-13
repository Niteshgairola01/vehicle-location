import React from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';

const Default = () => {
    return (
        <div className='m-0 p-0'>
            <Navbar />
            <div className='m-0 p-0'>
                <AllRoutes />
            </div>
        </div>
    )
}

export default Default
