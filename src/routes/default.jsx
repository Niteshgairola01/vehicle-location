import React from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';
import VehicleLocation from '../pages/vehicleLocation';
import { Route, Routes } from 'react-router-dom';

const Default = () => {
    return (
        <div className='m-0 p-0'>
            <Navbar />
            <Routes>
                <Route path="/location" element={<VehicleLocation />} />
            </Routes>
            <div className='m-0 p-0'>
                <AllRoutes />
            </div>
        </div>
    )
}

export default Default
