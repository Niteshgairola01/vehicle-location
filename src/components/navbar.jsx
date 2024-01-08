import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { logo } from '../assets/images';
import Button from './Button/hoveredButton';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  // const navigate = useNavigate();
  console.log("path", location.pathname);

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-white navbar">
      <div className='container-fluid navbar-main-container d-flex justify-content-between align-items-center'>
        <div className='d-flex justify-content-between align-items-center navbar-inner-container'>
          <Navbar.Brand className='w-5'>
            <img src={logo} alt='logo' className='nav-logo' />
          </Navbar.Brand>
          <Nav className='d-flex justify-content-end align-items-end'>
            <Link to={location.pathname === '/track' ? '/' : '/track'} className='m-0 p-0'>
              <Button className="px-4 py-1">{location.pathname === '/track' ? 'Logout' : 'Login'}</Button>
            </Link>
          </Nav>
        </div>
        {/* <Navbar.Toggle aria-controls="responsive-navbar-nav" /> */}
        <Navbar.Collapse id="responsive-navbar-nav">
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default NavBar;