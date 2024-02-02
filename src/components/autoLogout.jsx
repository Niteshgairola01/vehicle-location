import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { autoSignOutUser, signOutUser } from '../hooks/authHooks';

const AutoLogout = () => {
    const loggedInUser = localStorage.getItem('userId');
    const keepLoggedIn = localStorage.getItem('keepLoggedIn');
    const navigate = useNavigate();

    const location = useLocation();

    // const handleLogOut = () => {
    //     signOutUser({ userId: loggedInUser }).then((response) => {
    //         if (response?.status === 200) {
    //             localStorage.clear();
    //         }
    //     })
    // };

    // Tab inactivity

    const events = [
        // "load",
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress",
    ];
    let timer;

    const handleLogoutTimer = () => {
        timer = setTimeout(() => {
            resetTimer();
            Object.values(events).forEach((item) => {
                window.removeEventListener(item, resetTimer);
            });
            logoutAction();
        }, 10 * 60 * 1000);
    };

    const resetTimer = () => {
        if (timer) clearTimeout(timer);
    };

    useEffect(() => {
        Object.values(events).forEach((item) => {
            window.addEventListener(item, () => {
                resetTimer();
                handleLogoutTimer();
            });
        });
    }, []);

    const logoutAction = () => {
        localStorage.clear();
        // sessionStorage.clear();
        navigate('/')
    };



    // Tab close / reload

    let now = new Date();

    let year = now.getFullYear();
    let month = ('0' + (now.getMonth() + 1)).slice(-2);
    let day = ('0' + now.getDate()).slice(-2);
    let hours = ('0' + now.getHours()).slice(-2);
    let minutes = ('0' + now.getMinutes()).slice(-2);
    let seconds = ('0' + now.getSeconds()).slice(-2);

    let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const handleUnload = () => {
        const timestamp = new Date().getTime();
        localStorage.setItem('unloadTimestamp', timestamp.toString());
        autoSignOutUser([loggedInUser, formattedDateTime]);
        // localStorage.setItem("test 2", 2);
        // localStorage.setItem("test567", 12345);
    };

    useEffect(() => {
        if (location.pathname !== '/') {

            // window.onbeforeunload = handleUnload();

            window.addEventListener('beforeunload', handleUnload);
        }


        // const handleLoad = () => {
        //     const storedTimestamp = localStorage.getItem('unloadTimestamp');
        //     localStorage.setItem("test", 3456)
        //     if (storedTimestamp) {
        //         const storedTime = parseInt(storedTimestamp, 10);
        //         const currentTime = new Date().getTime();
        //         const timeDifference = currentTime - storedTime;

        //         if (timeDifference > 10 * 60 * 1000) {
        //             localStorage.clear();
        //             // sessionStorage.clear();
        //         } else {
        //             autoSignOutUser([loggedInUser, null]).then((response) => {
        //                 if (response.status === 200) {
        //                     console.log("timer added");
        //                 }
        //             }).catch((err) => {
        //                 console.log("err", err?.response?.data);
        //             })
        //         }
        //     }
        // };



        // if (location.pathname !== '/') {
        //     // window.addEventListener('DOMContentLoaded', handleLoad)
        //     document.onload = handleLoad();
        // };

        return () => {
            if (location.pathname !== '/') {
                window.removeEventListener('beforeunload', handleUnload);
                // window.removeEventListener('load', handleLoad);
                // window.removeEventListener('DOMContentLoaded', handleLoad)
            }
        };
    }, []);

    return (
        <div>

        </div>
    )
}

export default AutoLogout
