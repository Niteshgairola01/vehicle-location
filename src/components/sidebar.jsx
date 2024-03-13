import React, { useState } from 'react';
import { FaRegLightbulb, FaRoute } from 'react-icons/fa';
// import './App.css'; // Assuming you have some CSS for styling
import { PiPathBold } from "react-icons/pi";
import { PiPolygonBold } from "react-icons/pi";
import { TbReportSearch } from "react-icons/tb";
import { FaInfo } from "react-icons/fa";
import { RiSteering2Line } from "react-icons/ri";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';

const Sidebar = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [showSubmenu, setShowSubmenu] = useState(false);
    const location = useLocation();

    const menuItems = [
        {
            title: "Vehicle Track",
            path: '/track',
            icon: <PiPathBold />
        },
        {
            title: "Polygon",
            path: '/polygon',
            icon: <PiPolygonBold />
        },
        {
            title: "Route Report",
            path: '/route-report',
            icon: <FaRoute />
        },
        {
            title: "Reports",
            path: '/reports',
            icon: <TbReportSearch />
        },
        {
            title: "Forecast",
            path: '/forecast',
            icon: <FaRegLightbulb />
        },
        {
            title: "Plant",
            path: '/plant-info',
            icon: <FaInfo />
        },
        {
            title: "Driver Forum",
            items: [
                {
                    title: 'Create Driver',
                    path: '/create-driver'
                },
                {
                    title: 'Driver Mapping',
                    path: '/driver-mapping'
                },
            ],
            icon: <RiSteering2Line />
        }
    ];

    return (
        <div className={`app-container ${isSidebarExpanded ? 'expanded' : ''}`}>
            <div style={{ position: 'absolute' }}>
                <div className={isSidebarExpanded ? 'sidebar large' : 'sidebar small'} onMouseEnter={() => setIsSidebarExpanded(!isSidebarExpanded)} onMouseLeave={() => {
                    setIsSidebarExpanded(!isSidebarExpanded);
                    setShowSubmenu(false);
                }} style={{ width: isSidebarExpanded && '15rem' }}>
                    {
                        location.pathname !== "/" && (
                            <div className='py-3 d-flex justify-content-start align-items-start flex-column'>
                                {
                                    menuItems.map((data, index) => (
                                        <Link to={data?.path} key={index} className={`${isSidebarExpanded ? 'px-3' : 'px-1'} ${location.pathname === data?.path ? 'active-menuItem' : 'menuItems'} w-100 py-2 text-center text-decoration-none cursor-pointer`}>
                                            <div className={`sidebar-item ${location.pathname.includes(data?.path) && 'active-item'} w-100 rounded d-flex justify-content-start align-items-center px-3 fw-bold`}
                                            onClick={() => !data?.items && setShowSubmenu(false)}
                                            >
                                                <span className='fs-6'>{data.icon}</span>
                                                <span className={`${!isSidebarExpanded && 'd-none'} ${data?.items ? 'ps-2' : 'ps-3'}`}
                                                    onClick={() => data?.items && setShowSubmenu(!showSubmenu)}
                                                >
                                                    {data?.title}
                                                </span>
                                                {
                                                    data?.items && <IoMdArrowDropright />
                                                }
                                                {
                                                    (data?.items && showSubmenu) && (
                                                        <div className='rounded submenu-items mt-5 px-2 py-3 bg-thm-dark d-flex justify-content-start align-items-start flex-column'
                                                            style={{ }}
                                                        >
                                                            {
                                                                data?.items.map((item, i) => (
                                                                    <Link to={item?.path} className={`${location.pathname === data?.path ? 'active-menuItem' : 'menuItems'} w-100 py-1 text-center text-decoration-none cursor-pointer`}>
                                                                        <div className={`sidebar-item ${location.pathname.includes(item?.path) && 'active-item'} w-100 rounded d-flex justify-content-start align-items-center px-3 fw-bold`}>
                                                                            <span className='fs-6'>{item.icon}</span>
                                                                            <span className={` ${!isSidebarExpanded && 'd-none'} ${item?.items ? 'ps-2' : 'ps-3'}`}>
                                                                                {item?.title}
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                ))
                                                            }
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        </div >
    );
}

export default Sidebar;
