import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { logo } from '../assets/images';
import Button from './Button/hoveredButton';
import CButton from './Button/coloredButton';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Vehicle Track",
      path: '/track'
    },
    {
      title: "Polygon",
      path: '/polygon'
    }
  ];

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-white navbar mb-0">
      <div className='container-fluid navbar-main-container d-flex justify-content-between align-items-center'>
        <div className='d-flex justify-content-between align-items-center navbar-inner-container'>
          <Navbar.Brand className='w-5'>
            <img src={logo} alt='logo' className='nav-logo' />
          </Navbar.Brand>
          <Nav className={`w-75 d-flex justify-content-${location.pathname === '/' ? 'end' : 'between'} align-items-center`}>
            {
              location.pathname !== "/" && (
                <div className='d-flex justify-content-start align-items-center'>
                  {
                    menuItems.map((data, index) => (
                      <Link to={data?.path} key={index} className={`${location.pathname === data?.path ? 'active-menuItem' : 'menuItems'} me-3 text-center text-decoration-none cursor-pointer`}>{data?.title}</Link>
                    ))
                  }
                </div>
              )
            }
            <div>
              <Link to={location.pathname === '/' ? '/login' : '/'} className='m-0 p-0'>
                <CButton className="px-4 py-1">Create User</CButton>
              </Link>
              <Link to={location.pathname === '/' ? '/login' : '/'} className='m-0 ms-3 p-0'>
                <Button className="px-4 py-1">{location.pathname === '/' ? 'Login' : 'Logout'}</Button>
              </Link>
            </div>
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