import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { logo } from '../assets/images';
import Button from './Button/hoveredButton';
import CButton from './Button/coloredButton';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOutUser } from '../hooks/authHooks';
import { ErrorToast, SuccessToast } from './toast/toast';
import { NavDropdown } from 'react-bootstrap';
import { MdOutlineMenu } from "react-icons/md";
import Sidebar from './sidebar';
import { useState } from 'react';

const NavBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');

  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Vehicle Track",
      path: '/track'
    },
    {
      title: "Polygon",
      path: '/polygon'
    },
    {
      title: "Route Report",
      path: '/route-report'
    },
    {
      title: "Reports",
      path: '/reports'
    },
    {
      title: "Forecast",
      path: '/forecast'
    },
    {
      title: "Plant",
      path: '/plant-info'
    },
    // {
    //   title: "Driver Forum",
    //   path: '/driver-forum'
    // }
  ];

  const handleLogOutUser = () => {
    const form = { userId }
    if (location?.pathname !== '/') {
      signOutUser(form).then((response) => {
        if (response?.status === 200) {
          localStorage.clear();
          // sessionStorage.clear();
          navigate('/')
          SuccessToast("Logged out successfully");
        }
      }).catch(() => ErrorToast("Unable to log out user"));
    }
  };


  return (
    <div>
      <Navbar collapseOnSelect expand="lg" className="bg-white navbar mb-0" style={{ zIndex: 10 }}>
        <div className='container-fluid navbar-main-container d-flex justify-content-between align-items-center'>
          <div className='d-flex justify-content-start align-items-center'>
            <Navbar.Brand className='w-5'>
              <img src={logo} alt='logo' className='nav-logo' />
            </Navbar.Brand>
          </div>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
          </Navbar.Collapse>
          <div>
            {
              userRole === 'Admin' ? (
                <Link to='/create-user' className='m-0 p-0'>
                  <CButton className="px-4 py-1">Create User</CButton>
                </Link>
              ) : null
            }
            <Link className='m-0 ms-3 p-0'>
              <Button className="px-4 py-1" onClick={() => handleLogOutUser()}>Logout</Button>
            </Link>
          </div>
        </div>
      </Navbar>

      {/* {
        showMenu && (
          <Sidebar showMenu={showMenu} setShowMenu={setShowMenu} />
        )
      } */}
    </div>
  );
}

export default NavBar;