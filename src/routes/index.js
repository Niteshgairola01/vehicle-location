import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import VehicleTrackDash from '../pages/vehicleTrackDash';
import PolygonList from '../pages/polygon/polygonList';
import CreatePolygon from '../pages/polygon/createPolygon';
import UpdatePolygon from '../pages/polygon/updatePolygon';
import CreateUser from '../pages/user/create-user';
import { autoSignOutUser } from '../hooks/authHooks';
import { debounce } from 'lodash';

const AllRoutes = () => {
    const location = useLocation();
    const loggedInUser = localStorage.getItem('userId');

    const hasFunctionExecuted = useRef(false);
    // const [shown, setShown] = useState(false);

    // useEffect(() => {
    //     const handleVisibilityChange = () => {
    //         if (document.visibilityState === 'hidden') {
    //             setShown(false);
    //             hasFunctionExecuted.current = true;
    //         } else {
    //             setShown(true);
    //             hasFunctionExecuted.current = false;
    //         }
    //     };

    //     document.addEventListener('visibilitychange', handleVisibilityChange);

    //     return () => {
    //         document.removeEventListener('visibilitychange', handleVisibilityChange);
    //     };
    // });

    // useEffect(() => {

    //     // if (shown === true) {
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

    //     if (location.pathname !== '/' && location.pathname !== '/track') {
    //         events.forEach(event => {
    //             document.addEventListener(event, handleActivity);
    //         });
    //     }

    //     return () => {
    //         if (location.pathname !== '/' && location.pathname !== '/track') {

    //             events.forEach(event => {
    //                 document.removeEventListener(event, handleActivity);
    //             });
    //         }
    //     };
    //     // }
    // }, [shown, hasFunctionExecuted]); // useEffect will run only once on component mount

    const [tabClosed, setTabClosed] = useState(localStorage.getItem('tabClosed'));

    useEffect(() => {
        const handleActivity = debounce(() => {
            console.log('Activity detected');
            setTabClosed('false');
            localStorage.setItem("tabClosed", 'false');

            autoSignOutUser([loggedInUser, null])
                .then((response) => {
                    if (response.status === 200) {
                        console.log("timer added");
                    }
                })
                .catch((err) => {
                    console.log("err", err?.response?.data);
                });
        }, 1000); // Adjust the debounce delay as per your requirement

        const handleStorageChange = (event) => {
            if (event.key === 'tabClosed' && event.newValue === 'true') {
                handleActivity();
            }
        };

        const events = [
            // "load", // Uncomment if you want to include the load event
            "mousemove",
            "mousedown",
            "click",
            "scroll",
            "keypress",
        ];

        const addEventListeners = () => {
            if (location.pathname !== '/') {
                events.forEach(event => {
                    document.addEventListener(event, handleActivity);
                });
            }
        };

        const removeEventListeners = () => {
            // if (location.pathname !== "/") {
                events.forEach(event => {
                    document.removeEventListener(event, handleActivity);
                });
            // }
        };

        let listenersAdded = false;

        if (tabClosed === 'true' && !listenersAdded) {
            addEventListeners();
            listenersAdded = true;
        } else if (tabClosed === 'false' && listenersAdded) {
            removeEventListeners();
            listenersAdded = false;
        }

        window.addEventListener('storage', handleStorageChange);

        return () => {
            removeEventListeners();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [tabClosed, loggedInUser]);

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
