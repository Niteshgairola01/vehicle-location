import React, { useEffect } from 'react'

const AutoLogout = () => {

    const keepLoggedIn = localStorage.getItem('keepLoggedIn');

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
                    (timeDifference > 1 * 10 * 1000) && localStorage.clear();
                } else if (keepLoggedIn === 'false') {
                    localStorage.clear();
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
