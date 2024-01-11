import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import { Col, Form, Row } from 'react-bootstrap'
import Button from '../components/Button/coloredButton'
import HoveredButton from '../components/Button/hoveredButton';
import { CiFilter } from "react-icons/ci";
import { MdSettingsBackupRestore } from "react-icons/md";
import { getAllPartiesList } from '../hooks/clientMasterHooks';
import { getAllOfficesList } from '../hooks/officeMasterHooks';
import { ErrorToast, WarningToast } from '../components/toast/toast';
import { Input } from '../components/form/Input';
import { getRunningTrips } from '../hooks/tripsHooks';
import { getAllVehiclesList } from '../hooks/vehicleMasterHooks';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Pagination from '../components/pagination';
import ForceCompleteForm from './forceCompleteForm';

const VehicleTrackDash = () => {

    const [form, setForm] = useState({});
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [allOffices, setAllOffices] = useState([]);
    const [partiesList, setPartiesList] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState({});
    const [hovered, setHovered] = useState(false);
    const [selectedParty, setSelectedParty] = useState('');
    const [isOpenParty, setIsOpenParty] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState('');
    const [isOpenOffice, setIsOpenOffice] = useState(false);
    const [selectedVehicleNo, setSelectedVehicleNo] = useState('');
    const [isOpenVehicle, setIsOpenVehicle] = useState(false);
    // const [refreshClicked, setRefreshClicked] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 20
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    const currentTrips = filteredTrips.slice(indexOfFirstPost, indexOfLastPost)
    const pageCount = Math.ceil(filteredTrips.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredTrips]);

    const tableColumns = ['Vehicle No.', 'Trip No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Consignor Name', 'Origin', 'Destination', 'Static ETA',
        'GPS (Date / Time)', 'Route (KM)', 'KM Covered', 'Difference (Km)', 'Report Unloading', 'Unloading End Date', 'Location', 'Estimated Arrival Date',
        'Final Status', 'Hours Delay', 'Driver Name', 'Driver Mobile No.', 'Exit From', 'Trip Status', 'Force Complete'
    ];

    const allFilters = ['Trip Running', 'Trip Completed', 'Without Trip', 'Manual Bind', 'Delayed', 'Early', 'On Time', 'Critical Delayed'];

    const getAllTrips = () => {
        getRunningTrips().then((response) => {
            if (response.status === 200) {
                setAllTrips(response?.data);
                setFilteredTrips(response?.data);
            } else {
                setAllTrips([]);
                setFilteredTrips([]);
            }
        }).catch(() => {
            setAllTrips([]);
            setFilteredTrips([]);
        });
    };

    useEffect(() => {
        getAllTrips();
    }, []);

    useEffect(() => {
        getAllPartiesList().then((response) => {
            if (response.status === 200) {
                if (response?.data.length > 0) {
                    const filteredData = response?.data.map(data => ({
                        ...data,
                        label: data?.clientName,
                        value: data?.clientName
                    }));

                    setPartiesList(filteredData);
                } else {
                    setPartiesList([]);
                }
            } else {
                setPartiesList([]);
            }
        }).catch(() => setPartiesList([]));
    }, []);

    useEffect(() => {
        getAllVehiclesList().then((response) => {
            if (response.status === 200) {
                if (response?.data.length > 0) {
                    const filteredData = response?.data.map(data => ({
                        ...data,
                        label: data?.vehicleNo,
                        value: data?.vehicleNo
                    }));

                    setVehiclesList(filteredData);
                } else {
                    setVehiclesList([]);
                }
            } else {
                setVehiclesList([]);
            }
        }).catch(() => setVehiclesList([]));
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        getRunningTrips().then((response) => {
            if (response.status === 200) {
                const trips = response?.data;
                const allFilteredTrip = trips.filter(test => {
                    for (const key in form) {
                        const testValue = String(test[key]).toLowerCase();
                        const formValue = form[key].toLowerCase();
                        if (testValue !== formValue && formValue.length > 0) {
                            return false;
                        }
                    }
                    return true;
                });

                if (selectedFilter.length > 0) {
                    let tripsFilteredByTripStatus = [];

                    if (selectedFilter.includes('Without Trip')) {
                        if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Manual Bind')) {
                            if (!selectedFilter.includes('Manual Bind')) {
                                tripsFilteredByTripStatus = allFilteredTrip.filter((data) => (data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running");
                            } else if (selectedFilter.includes('Trip Running') && selectedFilter.includes('Manual Bind')) {
                                tripsFilteredByTripStatus = allFilteredTrip.filter((data) => ((data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running") && data?.exitFrom === "Manual Bind");
                            }
                        } else if (selectedFilter.includes('Trip Completed')) {
                            tripsFilteredByTripStatus = [];
                        } else if (selectedFilter.includes('Without Trip') && selectedFilter.length === 1) {
                            tripsFilteredByTripStatus = allFilteredTrip.filter((data) => (data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running");
                        }
                    } else {
                        tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && selectedFilter.includes(data?.finalStatus));
                        if (selectedFilter.includes('Delayed') || selectedFilter.includes('Critical Delayed') || selectedFilter.includes('Early') || selectedFilter.includes('On Time')) {
                            if (selectedFilter.includes("Early" || selectedFilter("On Time"))) {
                                if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                    tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && selectedFilter.includes(data?.finalStatus));
                                } else {
                                    tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.finalStatus));
                                }
                            } else if (selectedFilter.includes('Delayed') || selectedFilter.includes('Critical Delayed')) {
                                if (selectedFilter.includes('Delayed') && !selectedFilter.includes('Critical Delayed')) {
                                    let testArr;
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        if (selectedFilter.includes('Trip Running') && !selectedFilter.includes('Trip Completed')) {
                                            testArr = allFilteredTrip.filter((data) => (data?.tripStatus === 'Trip Running') && (data?.finalStatus === 'Delayed'));
                                        } else if (!selectedFilter.includes('Trip Running') && selectedFilter.includes('Trip Completed')) {
                                            testArr = allFilteredTrip.filter((data) => (data?.tripStatus === 'Trip Completed') && (data?.finalStatus === 'Delayed'));
                                        } else if (selectedFilter.includes('Trip Running') && selectedFilter.includes('Trip Completed')) {
                                            testArr = allFilteredTrip.filter((data) => (data?.tripStatus === "Trip Running" || data?.tripStatus === 'Trip Completed') && (data?.finalStatus === 'Delayed'));
                                        }
                                    } else {
                                        testArr = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                    }


                                    let test = [];

                                    testArr.map((data) => {
                                        const staticETA = data?.staticETA !== null && parseDate(data?.staticETA);
                                        const estimatedArrivalDate = data?.estimatedArrivalDate && parseDate(data?.estimatedArrivalDate);

                                        if (staticETA && estimatedArrivalDate) {
                                            const timeDiffInDays = Math.floor((estimatedArrivalDate - staticETA) / (1000 * 60 * 60 * 24));

                                            if (timeDiffInDays <= 2 && data.finalStatus === "Delayed") {
                                                tripsFilteredByTripStatus.push(data);
                                                test.push(data);
                                            }
                                        }
                                    });

                                    setFilteredTrips(test)

                                } else if (!selectedFilter.includes('Delayed') && selectedFilter.includes('Critical Delayed')) {

                                    let testArr;
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        if (selectedFilter.includes('Trip Running') && !selectedFilter.includes('Trip Completed')) {
                                            testArr = allFilteredTrip.filter((data) => ((data?.tripStatus === 'Trip Running') && (data?.finalStatus === 'Delayed')));
                                        } else if (!selectedFilter.includes('Trip Running') && selectedFilter.includes('Trip Completed')) {
                                            testArr = allFilteredTrip.filter((data) => ((data?.tripStatus === 'Trip Completed') && (data?.finalStatus === 'Delayed')));
                                        } else if (selectedFilter.includes('Trip Running') && selectedFilter.includes('Trip Completed')) {
                                            testArr = allFilteredTrip.filter((data) => ((data?.tripStatus === 'Trip Running' && data?.tripStatus === 'Trip Completed') && (data?.finalStatus === 'Delayed')));
                                        }
                                    } else {
                                        testArr = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                    }

                                    let test = [];

                                    testArr.map((data) => {
                                        const staticETA = data?.staticETA !== null && parseDate(data?.staticETA);
                                        const estimatedArrivalDate = data?.estimatedArrivalDate && parseDate(data?.estimatedArrivalDate);

                                        if (staticETA && estimatedArrivalDate) {
                                            const timeDiffInDays = Math.floor((estimatedArrivalDate - staticETA) / (1000 * 60 * 60 * 24));

                                            if (timeDiffInDays > 2 && data.finalStatus === "Delayed") {
                                                test.push(data)
                                            }
                                        }
                                    });
                                    setFilteredTrips(test)
                                }

                                else if (selectedFilter.includes('Delayed') && selectedFilter.includes('Critical Delayed')) {
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        if (selectedFilter.includes('Trip Running') && !selectedFilter.includes('Trip Completed')) {
                                            const testArr = allFilteredTrip.filter(data => data?.tripStatus === 'Trip Running' && data?.finalStatus === 'Delayed');
                                            setFilteredTrips(testArr);
                                        } else if (!selectedFilter.includes('Trip Running') && selectedFilter.includes('Trip Completed')) {
                                            const testArr = allFilteredTrip.filter(data => data?.tripStatus === 'Trip Completed' && data?.finalStatus === 'Delayed');
                                            setFilteredTrips(testArr);
                                        } else if (selectedFilter.includes('Trip Running') && selectedFilter.includes('Trip Completed')) {
                                            const testArr = allFilteredTrip.filter(data => (data?.tripStatus === 'Trip Running' || data?.tripStatus === 'Trip Completed') && data?.finalStatus === 'Delayed');
                                            setFilteredTrips(testArr);
                                        }
                                    } else {
                                        const testArr = allFilteredTrip.filter(data => data?.finalStatus === 'Delayed');
                                        setFilteredTrips(testArr);
                                    }
                                }

                                else {
                                    setFilteredTrips(allFilteredTrip.filter(data => data?.finalStatus === 'Delayed'))
                                }
                            }
                        } else {
                            tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus));
                        }
                    }

                    if (selectedFilter.includes("Manual Bind")) {
                        let manualBindedTrips = [];
                        if (selectedFilter.length === 1) {
                            manualBindedTrips = allFilteredTrip.filter((data) => data?.exitFrom === 'Manual Bind');
                        } else {
                            manualBindedTrips = tripsFilteredByTripStatus.filter((data) => data?.exitFrom === 'Manual Bind');
                        }
                        setFilteredTrips(manualBindedTrips);
                    } else if (!selectedFilter.includes("Delayed") && !selectedFilter.includes("Critical Delayed")) {
                        setFilteredTrips(tripsFilteredByTripStatus);
                    }
                } else {
                    setFilteredTrips(allFilteredTrip);
                }
            } else {
                setFilteredTrips([]);
            }
        }).catch(() => setFilteredTrips([]));
    };

    const handleSelectFilter = (filter) => {
        if (filter === 'All') {
            setFilteredTrips(allTrips);
            setSelectedFilter('');
            setForm({
                tripLogNo: ''
            });
            setSelectedParty('');
            setSelectedOffice('');
            setSelectedVehicleNo('');
        } else {
            if (selectedFilter.includes(filter)) {
                setSelectedFilter(selectedFilter.filter(item => item !== filter));
            } else {
                setSelectedFilter([...selectedFilter, filter]);
            }
        }
    }


    const handleShowForceComplete = (data) => {

        if (data?.tripStatus === 'Trip Running' && data?.operationUniqueID.length > 0) {
            setSelectedVehicle(data);
            setShowForceCompleteModal(true);
        } else if (data?.tripStatus.length === 0 || data?.operationUniqueID.length === 0) {
            ErrorToast("Not Trip found");
        } else {
            WarningToast("Not allowed");
        }
    };



    const handleShowOptions = () => {
        !hovered && setShowFilters(false);
        isOpenParty && setIsOpenParty(false);
        isOpenOffice && setIsOpenOffice(false);
        isOpenVehicle && setIsOpenVehicle(false);
    };

    const getFinalStatus = (data) => {
        if (data.finalStatus === 'Early' || data.finalStatus === '') {
            return data.finalStatus;
        } else if (data.finalStatus === 'Delayed') {
            const staticETA = parseDate(data?.staticETA);
            const estimatedArrivalDate = parseDate(data?.estimatedArrivalDate);

            if (staticETA && estimatedArrivalDate) {
                const timeDiffInDays = Math.floor((estimatedArrivalDate - staticETA) / (1000 * 60 * 60 * 24));

                return timeDiffInDays > 2 ? 'Critical Delayed' : 'Delayed';
            }
        }

        return data.finalStatus;
    };

    const getDelayedHours = (hours) => {
        if (hours !== null && hours.length > 0) {
            const hoursArr = hours.split('.');
            return hoursArr[0];
        } else {
            return ''
        }
    }

    const parseDate = (dateString) => {
        const dateParts = dateString.split(/[\/ :]/);
        return new Date(Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0], dateParts[3], dateParts[4], dateParts[5]));
    };

    const handleFormateISTDate = (givenDate) => {
        if (givenDate === null || givenDate.length === 0) {
            return givenDate;
        } else {
            const [datePart, timePart] = givenDate.split(' ');
            const [day, month, year] = datePart.split('/');
            const [hour, minute, second] = timePart.split(':');
            const newDate = givenDate.split(' ');
            const date = new Date(year, month - 1, day, hour % 12 + ((newDate[2] === 'PM') ? 12 : 0), minute, second);
            const dateTimeFormatted = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
            });

            const dateArr = dateTimeFormatted.split(', ');
            const formattedDate = dateArr.join(' ');

            const originalDate = new Date(formattedDate);

            const finalDay = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const finalMonth = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const finalYear = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;

            const finalFormattedDate = `${finalDay}/${finalMonth}/${finalYear} ${hours}:${minutes}:${seconds}`;

            return finalFormattedDate;
        }
    };

    const handleFormatDate = (date) => {
        const originalDate = new Date(date);

        const day = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
        const month = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
        const year = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
        const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
        const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
        const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;

        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    };

    const handleSplitStaticEta = (staticETA) => {
        if (staticETA !== null && staticETA.length > 0) {
            const etaDate = staticETA.split(' ');
            return etaDate[0];
        } else {
            return '';
        }
    };

    const handleGPSDate = (date) => {
        const currentDate = new Date();

        const givenDateString = date;

        const givenDate = new Date(givenDateString);
        const timeDifference = currentDate - givenDate;

        const hoursDifference = timeDifference / (1000 * 60 * 60);

        return hoursDifference > 4 ? true : false;
    }

    // const handleRefreshPage = () => {
    //     getAllTrips();
    //     setRefreshClicked(true);
    // };

    const handleFilter = () => {
        const allFilteredTrip = allTrips.filter(test => {
            for (const key in form) {
                const testValue = String(test[key]).toLowerCase();
                const formValue = form[key].toLowerCase();
                if (testValue !== formValue && formValue.length > 0) {
                    return false;
                }
            }
            return true;
        });

        setFilteredTrips(allFilteredTrip);
    }

    const handleResetFilters = () => {
        setSelectedFilter([]);
        handleFilter();
    };

    const handleChangeParty = (selectedValue) => {
        setSelectedParty(selectedValue);

        if (selectedValue === null) {
            setForm({
                ...form,
                consignorName: ''
            });
        } else {
            setForm({
                ...form,
                consignorName: selectedValue?.clientName
            });
        }
    };

    const handleChangeVehicle = (selectedValue) => {
        setSelectedVehicleNo(selectedValue);
        if (selectedValue === null) {
            setForm({
                ...form,
                vehicleNo: ''
            });
        } else {
            setForm({
                ...form,
                vehicleNo: selectedValue?.value
            });
        }
    };

    return (
        <div className='mt-5 my-3 px-5 pt-2 pb-5 bg-white rounded dashboard-main-container' onClick={() => handleShowOptions()}>
            <div className='w-100'>
                <div className='w-100 text-center my-5'>
                    <h4 className='px-3 dashboard-title text-uppercase d-inline text-center my-5'
                        style={{ borderBottom: "3px solid #09215f" }}
                    >Vehicle Tracking Dashboard</h4>
                </div>
                <div className='mt-2'>
                    <Form onSubmit={handleSubmit}>
                        <Row className='dashoard-filter-form rounded'>
                            <Col sm={12} md={6} lg={2} className='position-relative'>
                                <Form.Label>Party</Form.Label>
                                <Select
                                    options={partiesList}
                                    value={selectedParty}
                                    onChange={handleChangeParty}
                                    isClearable={true}
                                />
                            </Col>

                            <Col sm={12} md={6} lg={2} className='position-relative'>
                                <Form.Label>Vehicle</Form.Label>
                                <Select
                                    options={vehiclesList}
                                    value={selectedVehicleNo}
                                    onChange={handleChangeVehicle}
                                    isClearable={true}
                                />
                            </Col>

                            <Col sm={12} md={6} lg={2}>
                                <Input label="Trip No." type='text' name='tripLogNo' value={form.tripLogNo} onChange={handleChange} placeholder='Trip No.' autocomplete="off" />
                            </Col>

                            <Col sm={12} md={6} lg={2} className='border-right border-secondary pt-4 d-flex justify-content-start align-items-center'>
                                <Button type="submit" className=" px-3">Show</Button>
                                <HoveredButton type="button" className="px-3 ms-2" onClick={() => handleSelectFilter('All')}>Show All</HoveredButton>
                            </Col>

                            <Col sm={12} md={6} lg={2} className='pt-4 d-flex justify-content-start align-items-center position-relative'>
                                <div className={`${selectedFilter.length > 0 && 'bg-thm-dark'} border border-secondary rounded p-2 cursor-pointer d-flex justify-content-between align-items-center`}
                                    onMouseOver={() => setHovered(true)}
                                    onMouseOut={() => setHovered(false)}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <span className={`${selectedFilter.length > 0 && 'bg-thm-dark thm-white'}`} style={{ width: "8rem", fontSize: "0.8rem" }}>
                                        {selectedFilter.length > 0 ? 'Filters Applied' : 'Filter'}
                                    </span>
                                    <CiFilter className={`${selectedFilter.length > 0 && 'thm-white'}`} />
                                </div>
                                {
                                    showFilters ? (
                                        <div className='position-absolute bg-white px-0 d-flex justify-content-start align-items-center flex-column' style={{ top: 70, zIndex: "1", boxShadow: "0px 0px 10px 0px #c8c9ca" }}>
                                            {
                                                allFilters.map((data, index) => (
                                                    <div className={` py-2 ps-3 pe-5 w-100 ${selectedFilter.includes(data) ? 'filter-options-active' : 'filter-options'} ${index !== allFilters.length - 1 && 'border-bottom'} cursor-pointer`}
                                                        onMouseOver={() => setHovered(true)}
                                                        onMouseOut={() => setHovered(false)}
                                                        key={index}
                                                        onClick={() => handleSelectFilter(data)}
                                                    >{data}</div>
                                                ))
                                            }
                                        </div>
                                    ) : null
                                }
                                {
                                    selectedFilter.length > 0 ? (
                                        <div>
                                            <Tooltip title="Reset Filters">
                                                <Link to="#">
                                                    <MdSettingsBackupRestore onClick={() => handleResetFilters()} className='thm-dark cursor-pointer ms-2 fs-3' />
                                                </Link>
                                            </Tooltip>
                                        </div>
                                    ) : null
                                }
                                {/* <div className='mx-5'>
                                    <Tooltip title="Refresh Page">
                                        <Link>
                                            <IoMdRefresh onClick={() => handleRefreshPage()} className='fs-3 text-success cursor-pointer' />
                                        </Link>
                                    </Tooltip>
                                </div> */}
                            </Col>
                        </Row>
                    </Form>
                </div>

                <hr />
                <div className='w-100 mt-5'>
                    <span className='thm-dark fs-6 fw-bold'>Total Trips:</span>
                    <span className='fs-6 thm-dark ms-2'>{filteredTrips.length}</span>
                </div>
                <div className='table-responsive mt-3' style={{ height: "55vh" }}>
                    <table className='table table-bordered table-striped w-100 positon-relative' style={{ overflowY: "scroll", overflowX: 'auto' }}>
                        <thead className='table-head text-white' style={{ position: "static" }}>
                            <tr style={{ borderRadius: "10px 0px 0px 10px" }}>
                                {
                                    tableColumns.map((data, index) => (
                                        <th className={`text-nowrap ${(data === 'Trip Status' || data === 'Final Status') && 'width-150'} ${(data === 'Driver Name' || data === 'Static ETA') && 'width-200'} ${(data === 'Location' || data === 'Consignor Name') && 'width-300'}`} key={index}
                                            style={{ borderRadius: index === 0 ? "10px 0px 0px 0px" : index === tableColumns.length - 1 && "0px 10px 0px 0px" }}>{data}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {currentTrips.length > 0 && currentTrips.map((data, index) => (
                                <tr className={`${getFinalStatus(data) === 'Delayed' ? 'text-dark bg-warning' : getFinalStatus(data) === "Critical Delayed" && "text-white bg-danger"}`} key={index}>
                                    <td>{data?.vehicleNo}</td>
                                    <td>{data?.tripLogNo}</td>
                                    <td>{handleFormateISTDate(data?.loadingDate)}</td>
                                    <td>{handleFormatDate(data?.vehicleExitDate)}</td>
                                    <td>{data?.consignorName}</td>
                                    <td>{data?.origin}</td>
                                    <td>{data?.destination}</td>
                                    <td>{handleSplitStaticEta(data?.staticETA)}</td>
                                    <td className={`${handleGPSDate(data?.locationTime) && 'bg-danger text-white'}`}>{handleFormatDate(data?.locationTime)}</td>
                                    <td>{data?.routeKM}</td>
                                    <td>{Math.floor(data?.runningKMs) > 0 ? Math.floor(data?.runningKMs) : ''}</td>
                                    <td>{Math.floor(data?.kmDifference) > 0 ? Math.floor(data?.kmDifference) : ''}</td>
                                    <td>{data?.tripStatus !== 'Trip Running' ? handleFormatDate(data?.unloadingDate) : ''}</td>
                                    <td>{data?.tripStatus !== 'Trip Running' ? handleFormatDate(data?.unloadingReachDate) : ''}</td>
                                    <td>{data?.location}</td>
                                    <td>{data?.estimatedArrivalDate}</td>
                                    <td className={`${getFinalStatus(data) === 'Delayed' ? 'fw-bold bg-warning' : getFinalStatus(data) === "Critical Delayed" && "fw-bold text-white bg-danger"}`}>{getFinalStatus(data)}</td>
                                    <td>{getDelayedHours(data?.delayedHours)}</td>
                                    <td>{data?.driverName}</td>
                                    <td>{data?.driverMobileNo}</td>
                                    <td>{data?.exitFrom}</td>
                                    <td>{data?.tripStatus}</td>
                                    <td className='h-100 py-3 d-flex justify-content-center align-items-center'>
                                        <button className={`border border-none ${((data?.tripStatus === 'Trip Running') && (data?.operationUniqueID.length > 0)) ? 'force-complete-button' : 'force-complete-button-disabled'}`}
                                            onClick={() => handleShowForceComplete(data)}>Force Complete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                    {
                        currentTrips.length === 0 ? (
                            <div className='pb-3 text-secondary d-flex justify-content-center align-items-center'>No data found</div>
                        ) : null
                    }
                    {
                        currentTrips.length > 0 ? (
                            <div className='my-5'>
                                <Pagination pages={pageCount} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                            </div>
                        ) : null
                    }
                </div>

                <ForceCompleteForm getAllTrips={getAllTrips} show={showForceCompleteModal} setShow={setShowForceCompleteModal} data={selectedVehicle} />
            </div>
        </div>
    )
}

export default VehicleTrackDash;
