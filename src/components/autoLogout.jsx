import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../hooks/authHooks';

const AutoLogout = () => {

    const keepLoggedIn = localStorage.getItem('keepLoggedIn');
    const loggedInUser = localStorage.getItem('userId');

    const navigate = useNavigate();

    const logOutUser = () => {
        signOutUser({ userId: loggedInUser }).then((response) => {
            if (response?.status === 200) {
                localStorage.clear();
                navigate('/');
            }
        });
    };

    useEffect(() => {
        const setTabClosedTimestamp = () => {
            const timestamp = new Date().getTime();
            localStorage.setItem('tabClosedTimestamp', timestamp.toString());
        };

        const checkTimeDifference = () => {
            const tabClosedTimestamp = localStorage.getItem('tabClosedTimestamp');
            if (tabClosedTimestamp) {
                const currentTime = new Date().getTime();
                const timeDifference = currentTime - parseInt(tabClosedTimestamp, 10);
                console.log("looged in", keepLoggedIn);
                if (keepLoggedIn === 'true') {
                    if (timeDifference > 10 * 60 * 1000) {
                        logOutUser();
                    }
                    // (timeDifference > 1 * 10 * 1000) && localStorage.clear();
                } else if (keepLoggedIn === 'false') {
                    // localStorage.clear();
                    logOutUser();
                }
            }
        };

        const handleTabClose = () => {
            setTabClosedTimestamp();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkTimeDifference();
            }
        };

        window.addEventListener('beforeunload', handleTabClose);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        checkTimeDifference();

        return () => {
            window.removeEventListener('beforeunload', handleTabClose);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div>

        </div>
    )
}

export default AutoLogout
