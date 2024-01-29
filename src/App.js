import { Toaster } from 'react-hot-toast';
import './App.css';
import Default from './routes/default';
import { useEffect } from 'react';
import AutoLogout from './components/autoLogout';

function App() {

  return (
    <>
      <Toaster />
      <Default />
      <AutoLogout />
    </>
  );
}

export default App;
