import React from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';
import VehicleLocation from '../pages/vehicleLocation';
import { Route, Routes, useLocation } from 'react-router-dom';
import Signin from '../pages/auth/signin';

const Default = () => {

    const location = useLocation();

    return (
        <div className='m-0 p-0'>
            {
                location.pathname !== '/' && <Navbar />
            }
            <Routes>
                <Route path="/location" element={<VehicleLocation />} />
                <Route path='/' element={<Signin />} />
            </Routes>
            <div className='m-0 p-0'>
                <AllRoutes />
            </div>
        </div>
    )
};

export default Default
