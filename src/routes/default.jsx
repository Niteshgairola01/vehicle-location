import React, { useEffect } from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';
import VehicleLocation from '../pages/vehicleLocation';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Signin from '../pages/auth/signin';

const Default = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const name = localStorage.getItem('name');

    // useEffect(() => {
    //     if (name === null) {
    //         navigate('/');
    //     } else if (name.length > 0) {
    //         navigate('/track')
    //     }
    // }, [name]);

    return (
        <div className='m-0 p-0'>
            {
                location.pathname !== '/' && <Navbar />
            }
            <Routes>
                <Route path='/' element={<Signin />} />
            </Routes>
            <div className='m-0 p-0'>
                <AllRoutes />
            </div>
        </div>
    )
};

export default Default
