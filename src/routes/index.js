import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainComponent from '../pages/home';
import VehicleTrackDash from '../pages/vehicleTrackDash';
import PolygonMain from '../pages/polygon/polygonMain';


const AllRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MainComponent />} />
            <Route path="/track" element={<VehicleTrackDash />} />
            <Route path="/polygon" element={<PolygonMain />} />
        </Routes>
    )
}

export default AllRoutes
