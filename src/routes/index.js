import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainComponent from '../pages/home';
import VehicleTrackDash from '../pages/vehicleTrackDash';


const AllRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MainComponent />} />
            <Route path="/track" element={<VehicleTrackDash />} />
        </Routes>
    )
}

export default AllRoutes
