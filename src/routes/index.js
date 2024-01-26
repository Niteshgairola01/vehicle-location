import React from 'react';
import { Route, Routes } from 'react-router-dom';
import VehicleTrackDash from '../pages/vehicleTrackDash';
import PolygonList from '../pages/polygon/polygonList';
import CreatePolygon from '../pages/polygon/createPolygon';
import UpdatePolygon from '../pages/polygon/updatePolygon';
import CreateUser from '../pages/user/create-user';

const AllRoutes = () => {
    return (
        <Routes>
            {/* Tracking */}
            <Route path="/track" element={<VehicleTrackDash />} />

            {/* Polygon */}
            <Route path="/polygon" element={<PolygonList />} />
            <Route path="/create-polygon" element={<CreatePolygon />} />
            <Route path="/editPolygon" element={<UpdatePolygon />} />

            {/* User */}
            <Route path="/create-user" element={<CreateUser />} />
        </Routes>
    )
}

export default AllRoutes
