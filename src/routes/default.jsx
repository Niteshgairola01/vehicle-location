import React from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';
import { Route, Routes, useLocation } from 'react-router-dom';
import Signin from '../pages/auth/signin';
import Sidebar from '../components/sidebar';

const Default = () => {

    const location = useLocation();

    return (
        <div className='m-0 p-0'>
            {
                location.pathname !== '/' && <Navbar />
            }
            <Routes>
                <Route path='/' element={<Signin />} />
            </Routes>

            {
                location.pathname !== '/' && (
                    <div className='d-flex justify-content-start align-items-start' style={{overflow: 'hidden'}}>
                        <div style={{zIndex: 999, height: "100%"}}>
                            <Sidebar />
                        </div>
                        <div className='m-0 p-0 ms-5 w-100' style={{maxHeight: "100vh", overflowY: "scroll"}}>
                            <AllRoutes />
                        </div>
                    </div>
                )
            }
        </div>
    )
};

export default Default
