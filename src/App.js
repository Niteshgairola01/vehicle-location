import { Toaster } from 'react-hot-toast';
import './App.css';
import Default from './routes/default';
import AutoLogout from './components/autoLogout';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles/maps.css'
import { signOutUser } from './hooks/authHooks';

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
      if (timeDifference > 30 * 60 * 1000) {
        const form = { userId: localStorage.getItem('userId') }
        signOutUser(form).then((response) => {
          if (response?.status === 200) {
            localStorage.clear();
            navigate('/')
          }
        }).catch(() => console.log("Unable to log out user"));
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
