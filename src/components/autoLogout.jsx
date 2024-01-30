import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../hooks/authHooks';

const AutoLogout = () => {
    const loggedInUser = localStorage.getItem('userId');
    const keepLoggedIn = localStorage.getItem('keepLoggedIn');

    const handleLogOut = () => {
        signOutUser({ userId: loggedInUser }).then((response) => {
            if (response?.status === 200) {
                localStorage.clear();
            }
        })
    };

    console.log("keep logged", keepLoggedIn === 'false');


    const handleCloseWindow = () => {
        window.close();
    }

    useEffect(() => {
        window.addEventListener('beforeunload', (event) => {
            // Cancel the event as handling it is not allowed in most browsers
            // event.preventDefault();
            // Prompt the user with a confirmation dialog
            // event.returnValue = '';
            // Perform cleanup tasks or any necessary actions here
            handleCloseWindow();
        });
    }, [])


    useEffect(() => {

        if (keepLoggedIn === 'true') {
            localStorage.setItem("userId", loggedInUser, 1 * 2 * 2000);
        } else {
            handleLogOut();
        }

        // const handleBeforeUnload = (event) => {
        //     event.preventDefault();
        //     // Check if the event is due to a page reload
        //     if (event.currentTarget.performance.navigation.type === 1) {
        //         return;
        //     }

        //     if (keepLoggedIn === 'false') {
        //         handleLogOut();
        //     } else {
        //         const timestamp = new Date().getTime();
        //         localStorage.setItem('timestamp', JSON.stringify(timestamp));
        //     }
        // };

        // const storedData = localStorage.getItem('timestamp');
        // if (storedData) {
        //     const storedTimestamp = JSON.parse(storedData);
        //     const currentTime = new Date().getTime();
        //     const timeDifference = currentTime - storedTimestamp;

        //     if (keepLoggedIn === 'true' && timeDifference > 10 * 60 * 1000) {
        //         handleLogOut();
        //     } else if (keepLoggedIn === 'false') {
        //         handleLogOut();
        //     }
        // }

        // window.addEventListener('beforeunload', handleBeforeUnload);

        // return () => {
        //     window.removeEventListener('beforeunload', handleBeforeUnload);
        // };
    }, []);

    // const handleBeforeUnload = () => {
    //     if (keepLoggedIn === 'false') {
    //         handleLogOut();
    //     } else {
    //         const timestamp = new Date().getTime();
    //         localStorage.setItem('timestamp', JSON.stringify(timestamp));
    //     }
    // };

    return (
        <div>

        </div>
    )
}

export default AutoLogout
