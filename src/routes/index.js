import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import VehicleTrackDash from '../pages/vehicleTrackDash';
import PolygonList from '../pages/polygon/polygonList';
import CreatePolygon from '../pages/polygon/createPolygon';
import UpdatePolygon from '../pages/polygon/updatePolygon';
import CreateUser from '../pages/user/create-user';
import { autoSignOutUser } from '../hooks/authHooks';

const AllRoutes = () => {
    const location = useLocation();
    //     aut    const hasFunctionExecuted = useRef(false);

    // const hasFunctionExecuted = useRef(false);

    // useEffect(() => {
    //     const handleActivity = () => {
    //         if (!hasFunctionExecuted.current) {
    //             console.log('Activity detected');
    //             // Call your function here
    //             autoSignOutUser([loggedInUser, null]).then((response) => {
    //                 if (response.status === 200) {
    //                     console.log("timer added");
    //                 }
    //             }).catch((err) => {
    //                 console.log("err", err?.response?.data);
    //             });

    //             hasFunctionExecuted.current = true; // Set the flag to true after the function executes
    //         }
    //     };

    //     const events = [
    //         // "load", // Uncomment if you want to include the load event
    //         "mousemove",
    //         "mousedown",
    //         "click",
    //         "scroll",
    //         "keypress",
    //     ];

    //     if (location.pathname !== '/') {
    //         events.forEach(event => {
    //             document.addEventListener(event, handleActivity);
    //         });
    //     }


    //     return () => {
    //         if (location.pathname !== '/') {

    //             events.forEach(event => {
    //                 document.removeEventListener(event, handleActivity);
    //             });
    //         }
    //     };
    // }, []); // useEffect will run only once on component mount


    const [functionAdded, setFunctionAdded] = useState(false);
    const loggedInUser = localStorage.getItem('userId');

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
        </>
    )
}

export default AllRoutes
