import { Toaster } from 'react-hot-toast';
import './App.css';
import Default from './routes/default';
import AutoLogout from './components/autoLogout';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate();
  const storedTimestamp = localStorage.getItem('unloadTimestamp');

  // useEffect(() => {
  //     setLoggedInuser(localStorage.getItem('userId'))
  // }, []);


  // useEffect(() => {
  //   localStorage.setItem("reload", 'true');
  // }, []);

  useEffect(() => {
    if (storedTimestamp) {
      const storedTime = parseInt(storedTimestamp, 10);
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - storedTime;
      if (timeDifference > 10 * 30 * 1000) {
        localStorage.clear();
        navigate('/');
      }
    }
  }, [storedTimestamp]);


  return (
    <>
      <Toaster />
      <AutoLogout />
      <Default />
    </>
  );
}

export default App;
