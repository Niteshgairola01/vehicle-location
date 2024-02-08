import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { autoSignOutUser, signOutUser } from '../hooks/authHooks';

const AutoLogout = () => {
    const loggedInUser = localStorage.getItem('userId');
    const navigate = useNavigate();

    const location = useLocation();

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
        }, 30 * 60 * 1000);
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
        const form = { userId: localStorage.getItem('userId') }
        signOutUser(form).then((response) => {
            if (response?.status === 200) {
                localStorage.clear();
                navigate('/')
            }
        }).catch(() => console.log("Unable to log out user"));
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
        if (loggedInUser !== null) {
            autoSignOutUser([loggedInUser, formattedDateTime]);
        }
        localStorage.setItem("tabClosed", 'true');
    };

    useEffect(() => {
        if (location.pathname !== '/') {
            window.addEventListener('beforeunload', handleUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    })

    return (
        <div>

        </div>
    )
}

export default AutoLogout
