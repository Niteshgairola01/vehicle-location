import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import VehicleTrackDash from '../pages/vehicleTrackDash';
import PolygonList from '../pages/polygon/polygonList';
import CreatePolygon from '../pages/polygon/createPolygon';
import UpdatePolygon from '../pages/polygon/updatePolygon';
import CreateUser from '../pages/user/create-user';
import AutoLogout from '../components/autoLogout';

const AllRoutes = () => {
    const location = useLocation();

    useEffect(() => {

    }, []);

    return (
        <>
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
            {/* {
                location?.pathname !== '/' ? (
                    <AutoLogout />
                ): null
            } */}
        </>
    )
}

export default AllRoutes
