import React, { useEffect } from 'react';
import Navbar from '../components/navbar';
import AllRoutes from '.';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Signin from '../pages/auth/signin';
import { autoSignOutUser } from '../hooks/authHooks';

const Default = () => {

    const location = useLocation();
    const loggedInuser = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        loggedInuser === null && navigate('/');
    }, [loggedInuser]);

    // if (timeDifference < 10 * 60 * 1000) {
    //     const form = [loggedInuser, null];
    //     autoSignOutUser(form).then((response) => {
    //         if (response.status === 200) {
    //             navigate('/')
    //         }
    //     });
    // }

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
