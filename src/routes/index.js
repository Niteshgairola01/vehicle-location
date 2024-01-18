import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainComponent from '../pages/home';
import VehicleTrackDash from '../pages/vehicleTrackDash';
import PolygonMain from '../pages/polygon/polygonMain';
import PolygonList from '../pages/polygon/polygonList';
import CreatePolygon from '../pages/polygon/createPolygon';


const AllRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MainComponent />} />
            <Route path="/track" element={<VehicleTrackDash />} />
            <Route path="/polygon" element={<PolygonList />} />
            <Route path="/create-polygon" element={<CreatePolygon />} />
            <Route path="/editPolygon" element={<CreatePolygon />} />
        </Routes>
    )
}

export default AllRoutes
