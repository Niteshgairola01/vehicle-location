import { Toaster } from 'react-hot-toast';
import './App.css';
import Default from './routes/default';
import { useEffect } from 'react';

function App() {

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

        (timeDifference > 10 * 60 * 1000) && localStorage.removeItem('name')
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
    <>
      <Toaster />
      <Default />
    </>
  );
}

export default App;
