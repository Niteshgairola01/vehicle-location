import { Toaster } from 'react-hot-toast';
import './App.css';
import Default from './routes/default';
import AutoLogout from './components/autoLogout';

function App() {

  return (
    <>
      <Toaster />
      <AutoLogout />
      <Default />
    </>
  );
}

export default App;
