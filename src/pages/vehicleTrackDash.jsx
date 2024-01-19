import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select';
import { Col, Form, Modal, Row } from 'react-bootstrap'
import Button from '../components/Button/coloredButton'
import HoveredButton from '../components/Button/hoveredButton';
import { CiFilter } from "react-icons/ci";
import { FaRoute } from "react-icons/fa";
import { IoMdRefresh } from 'react-icons/io';
import { MdSettingsBackupRestore } from "react-icons/md";
import { getAllPartiesList } from '../hooks/clientMasterHooks';
import { ErrorToast, SuccessToast } from '../components/toast/toast';
import { Input } from '../components/form/Input';
import { getRunningTrips } from '../hooks/tripsHooks';
import { getAllVehiclesList } from '../hooks/vehicleMasterHooks';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Pagination from '../components/pagination';
import ForceCompleteForm from './forceCompleteForm';
import Loader from '../components/loader/loader';
import DashHead from '../components/dashboardHead';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { RxCross1 } from 'react-icons/rx';
import { FaSort } from "react-icons/fa";
import { truck, warning } from '../assets/images';
import { GoAlertFill } from "react-icons/go";
import { PiSealWarningFill } from "react-icons/pi";
import { MdNearbyError } from "react-icons/md";
import { BiSolidHide } from "react-icons/bi";

const VehicleTrackDash = () => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    const [showMap, setShowMap] = useState(false);

    const [form, setForm] = useState({});
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState([]);
    const [partiesList, setPartiesList] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState({});
    const [hovered, setHovered] = useState(false);
    const [selectedParty, setSelectedParty] = useState('');
    const [isOpenParty, setIsOpenParty] = useState(false);
    const [isOpenOffice, setIsOpenOffice] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [errorMessage, setErrorMessage] = useState('No data found');
    const [selectedVehicleNo, setSelectedVehicleNo] = useState('');
    const [isOpenVehicle, setIsOpenVehicle] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [vehicleData, setVehicleData] = useState({});
    const [showLocation, setShowLocation] = useState(false);
    const [showLocationOption, setShowLocationOption] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState('');
    const itemsPerPage = 20
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    let currentTrips = filteredTrips.slice(indexOfFirstPost, indexOfLastPost);
    const pageCount = Math.ceil(filteredTrips.length / itemsPerPage);

    const mapContainerStyle = {
        width: '100%',
        height: '95%',
    };

    const center = {
        lat: parseFloat(selectedVehicle?.lattitude),
        lng: parseFloat(selectedVehicle?.longitude),
    };

    useEffect(() => {
        currentTrips = filteredTrips.slice(indexOfFirstPost, indexOfLastPost);
        currentPage > pageCount && setCurrentPage(1);
    }, [filteredTrips]);

    const tableColumns = [
        {
            label: 'Hide Row',
            value: ''
        },
        {
            label: 'Trip Count',
            value: ''
        },
        {
            label: 'Vehicle No.',
            value: 'vehicleNo'
        },
        {
            label: 'Trip No.',
            value: 'tripLogNo'
        },
        {
            label: 'Loading (Date / Time)',
            value: 'loadingDate'
        },
        {
            label: 'Vehicle Exit (Date / Time)',
            value: 'vehicleExitDate'
        },
        {
            label: 'Consignor Name',
            value: 'consignorName'
        },
        {
            label: 'Origin',
            value: 'origin'
        },
        {
            label: 'Destination',
            value: 'destination'
        },
        {
            label: 'Static ETA',
            value: 'staticETA'
        },
        {
            label: 'GPS (Date / Time)',
            value: 'locationTime'
        },
        {
            label: 'Route (KM)',
            value: 'routeKM'
        },
        {
            label: 'KM Covered',
            value: 'runningKMs'
        },
        {
            label: 'Difference (Km)',
            value: 'kmDifference'
        },
        {
            label: 'Report Unloading',
            value: 'unloadingReachDate'
        },
        {
            label: 'Unloading End Date',
            value: 'unloadingData'
        },
        {
            label: 'Location',
            value: 'location'
        },
        {
            label: 'Estimated Arrival Date',
            value: 'estimatedArrivalDate'
        },
        {
            label: 'Final Status',
            value: 'finalStatus'
        },
        {
            label: 'Delayed Hours',
            value: 'delayedHours'
        },
        {
            label: 'Driver Name',
            value: 'driverName'
        },
        {
            label: 'Driver Mobile No.',
            value: 'driverMobileNo'
        },
        {
            label: 'Exit From',
            value: 'exitFrom'
        },
        {
            label: 'Trip Status',
            value: 'tripStatus'
        },
        {
            label: 'Force Complete',
            value: ''
        }
    ];

    const allFilters = ['Trip Running', 'Trip Completed', 'Trip not Assgined', 'Early', 'On Time', 'Mild Delayed', 'Moderate Delayed', 'Critical Delayed', 'Manual Bind'];

    const getAllTrips = () => {
        setShowLoader(true)
        getRunningTrips().then((response) => {
            if (response.status === 200) {
                setShowLoader(false);
                const allData = response?.data;
                const sortedDetails = vehiclesList.map((vehicle) =>
                    allData.find((detail) => detail?.vehicleNo === vehicle?.vehicleNo)
                );

                setAllTrips(sortedDetails);
                setFilteredTrips(sortedDetails);
            } else {
                setShowLoader(false);
                setAllTrips([]);
                setFilteredTrips([]);
            }
        }).catch((err) => {
            err?.mesage && setErrorMessage(err?.message);
            setShowLoader(false);
            setAllTrips([]);
            setFilteredTrips([]);
        });
    };

    useEffect(() => {
        getAllTrips();
    }, [vehiclesList]);

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

    useEffect(() => {
        handleFilterTrips();
    }, [selectedParty, selectedVehicleNo]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleFilterTrips = () => {
        if (!showFilters) {
            setShowLoader(true);
        }

        getRunningTrips().then((response) => {
            if (response.status === 200) {
                setShowLoader(false);
                const allData = response?.data;
                const sortedDetails = vehiclesList.map((vehicle) =>
                    allData.find((detail) => detail?.vehicleNo === vehicle?.vehicleNo)
                );

                const allFilteredTrip = sortedDetails.filter(test => {
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

                    if (selectedFilter.includes('Trip not Assgined')) {
                        if (selectedFilter.includes('Trip Running')) {
                            if (selectedFilter.includes('Trip Running') && selectedFilter.includes('Manual Bind')) {
                                tripsFilteredByTripStatus = allFilteredTrip.filter((data) => ((data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running") && data?.exitFrom === "Manual Bind");
                            } else if (selectedFilter.includes('Trip Running')) {
                                tripsFilteredByTripStatus = allFilteredTrip.filter((data) => ((data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running"));
                            }
                        } else if (selectedFilter.includes('Trip Completed')) {
                            tripsFilteredByTripStatus = [];
                        } else if (selectedFilter.includes('Trip not Assgined') && selectedFilter.length === 1) {
                            tripsFilteredByTripStatus = allFilteredTrip.filter((data) => (data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running");
                        }
                    } else {
                        tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && selectedFilter.includes(data?.finalStatus));
                        if (selectedFilter.includes('Mild Delayed') || selectedFilter.includes('Moderate Delayed') || selectedFilter.includes('Critical Delayed') || selectedFilter.includes('Early') || selectedFilter.includes('On Time')) {

                            let finalStatusTrips = [];

                            if (selectedFilter.includes("Early") || selectedFilter.includes("On Time")) {
                                if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                    const trips = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && selectedFilter.includes(data?.finalStatus));
                                    trips.map((data) => finalStatusTrips.push(data));
                                } else {
                                    const trips = allFilteredTrip.filter((data) => selectedFilter.includes(data?.finalStatus));
                                    trips.map((data) => finalStatusTrips.push(data));
                                }
                            }

                            if (selectedFilter.includes('Mild Delayed') || selectedFilter.includes('Moderate Delayed') || selectedFilter.includes('Critical Delayed')) {

                                if (selectedFilter.includes('Mild Delayed')) {
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 1 && delayedHours <= 18) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 1 && delayedHours <= 18) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    }
                                }

                                if (selectedFilter.includes('Moderate Delayed')) {
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 19 && delayedHours <= 35) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 19 && delayedHours <= 35) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    }
                                }

                                if (selectedFilter.includes('Critical Delayed')) {
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 36) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 36) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    }
                                }
                            }

                            tripsFilteredByTripStatus = finalStatusTrips;
                        } else {
                            tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus));
                        }
                    };

                    if (selectedFilter.includes('Manual Bind')) {
                        if (selectedFilter.length === 1) {
                            tripsFilteredByTripStatus = allFilteredTrip.filter(data => data?.exitFrom === 'Manual Bind')
                        } else {
                            tripsFilteredByTripStatus = tripsFilteredByTripStatus.filter(data => data?.exitFrom === 'Manual Bind')
                        }
                    }

                    setFilteredTrips(tripsFilteredByTripStatus);
                } else {
                    setFilteredTrips(allFilteredTrip);
                }
            } else {
                setShowLoader(false);
                setFilteredTrips([]);
            }
        }).catch((err) => {
            err?.message && setErrorMessage(err?.message);
            setShowLoader(false);
            setFilteredTrips([])
        });
    };

    const intervalRef = useRef(null);

    useEffect(() => {
        const intervalFunction = () => {
            handleFilterTrips();
        };

        intervalFunction();

        intervalRef.current = setInterval(intervalFunction, 10 * 60 * 1000);

        return () => clearInterval(intervalRef.current);
    }, [selectedFilter]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleFilterTrips();
    };

    const handleSelectFilter = (filter) => {
        if (filter === 'All') {
            getAllTrips();
            setSelectedFilter([]);
            setForm({
                tripLogNo: ''
            });
            setSelectedParty('');
            setSelectedVehicleNo('');
        } else {
            if (selectedFilter.includes(filter)) {
                setSelectedFilter(selectedFilter.filter(item => item !== filter));
            } else {
                setSelectedFilter([...selectedFilter, filter]);
            }
        }
    };

    useEffect(() => {
        handleFilterTrips();
    }, [selectedFilter]);

    const handleShowForceComplete = (data) => {
        if (data?.tripStatus === 'Trip Running' && data?.operationUniqueID.length > 0) {
            setSelectedVehicle(data);
            setShowForceCompleteModal(true);
        } else if (data?.tripStatus.length === 0 || data?.operationUniqueID.length === 0) {
            ErrorToast("Not Trip found");
        } else if (data?.tripStatus === 'Trip Completed') {
            ErrorToast("Trip already completed");
        }
    };

    const handleShowOptions = () => {
        !hovered && setShowFilters(false);
        !hovered && setShowLocationOption(false);
        isOpenParty && setIsOpenParty(false);
        isOpenOffice && setIsOpenOffice(false);
        isOpenVehicle && setIsOpenVehicle(false);
    };

    const getFinalStatus = (data) => {
        if (data?.finalStatus === 'Early' || data?.finalStatus === 'On Time' || data?.finalStatus === '') {
            return data?.finalStatus;
        } else if (data?.finalStatus === 'Delayed') {
            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                const delayedHours = parseInt(data?.delayedHours);
                if (delayedHours >= 1 && delayedHours <= 18) {
                    return 'Mild Delayed'
                } else if (delayedHours >= 19 && delayedHours <= 35) {
                    return 'Moderate Delayed'
                } else if (delayedHours >= 36) {
                    return 'Critical Delayed'
                }
            } else {
                return '';
            }
        }
    };

    const showDelayedIcon = (data) => {
        if (data?.finalStatus === 'Early' || data?.finalStatus === 'On Time' || data?.finalStatus === '') {
            return '';
        } else if (data?.finalStatus === 'Delayed') {
            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                const delayedHours = parseInt(data?.delayedHours);
                if (delayedHours >= 1 && delayedHours <= 18) {
                    return <GoAlertFill className='fs-3 text-warning warn-icon' />
                } else if (delayedHours >= 19 && delayedHours <= 35) {
                    return <MdNearbyError className='fs-3 text-secondary warn-icon' />
                } else if (delayedHours >= 36) {
                    return <PiSealWarningFill className='fs-3 text-danger warn-icon' />
                }
            } else {
                return '';
            }
        }
    }

    const getDelayedHours = (hours) => {
        if (hours !== null && hours.length > 0) {
            const hoursArr = hours.split('.');
            return hoursArr[0];
        } else {
            return ''
        }
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
        if (date === null) {
            return '';
        } else if (date !== null && date?.length === 0) {
            return '';
        } else {
            const originalDate = new Date(date);

            const day = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const month = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const year = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;

            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            return formattedDate;
        }
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
        if (date === null) {
            return false
        } else if (date?.length === 0) {
            return false
        } else {
            const currentDate = new Date();
            const givenDateString = date;
            const givenDate = new Date(givenDateString);
            const timeDifference = currentDate - givenDate;

            const hoursDifference = timeDifference / (1000 * 60 * 60);

            return hoursDifference > 4 ? true : false;
        }

    }

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

    const selectStyles = {
        control: (provided) => ({
            ...provided,
            fontSize: '0.9rem',
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '0.9rem',
        }),
    };

    const selectformFields = [
        {
            label: "Party",
            options: partiesList,
            value: selectedParty,
            onChange: handleChangeParty
        },
        {
            label: "Vehicle",
            options: vehiclesList,
            value: selectedVehicleNo,
            onChange: handleChangeVehicle
        },
    ];

    const handleShowLocation = (data) => {
        setVehicleData(data);
        setCurrentVehicle(data?.vehicleNo)
        setShowLocationOption(true);
    };

    const locationOptionsBtns = [
        {
            title: 'History',
            icon: <FaRoute />,
            path: "#",
            handleClick: '#',
            color: 'text-secondary',
            cursor: 'cursor-not-allowed',
        },
        {
            title: 'Track',
            icon: <FaRoute />,
            path: "/location",
            handleClick: (data) => {
                setShowLocation(true);
                setSelectedVehicle(data);
            },
            color: 'thm-dark',
            cursor: 'cursor-pointer'
        },
    ];

    const [sortOrder, setSortOrder] = useState('asc');

    const handleSortData = (columnName) => {

        const order = sortOrder === 'asc' ? 'desc' : 'asc';

        const sorted = [...filteredTrips].sort((a, b) => {
            const valueA = a[columnName];
            const valueB = b[columnName];

            if (columnName !== 'vehicleNo') {
                if (valueA === null || valueA === undefined || valueA === '') return 1;
                if (valueB === null || valueB === undefined || valueB === '') return -1;
            }

            const dateValueA = Date.parse(valueA);
            const dateValueB = Date.parse(valueB);

            if (!isNaN(dateValueA) && !isNaN(dateValueB)) {
                return order === 'asc' ? dateValueA - dateValueB : dateValueB - dateValueA;
            }

            const numericValueA = parseFloat(valueA);
            const numericValueB = parseFloat(valueB);

            if (!isNaN(numericValueA) && !isNaN(numericValueB)) {
                return order === 'asc' ? numericValueA - numericValueB : numericValueB - numericValueA;
            }

            const stringA = String(valueA);
            const stringB = String(valueB);

            return order === 'asc' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
        });

        setSortOrder(order);

        setFilteredTrips(sorted);
    };

    const handleHideRow = (vehicle) => {
        const nonHiddenRows = filteredTrips.filter(data => data?.vehicleNo !== vehicle?.vehicleNo);
        setFilteredTrips(nonHiddenRows);
    }

    return (
        <div className='m-0 p-0 position-relative'>
            {/* {
                showMap ? (
                    <div className='bg-white mx-5 pb-3' style={{ width: "93vw", height: "100%", position: "absolute", zIndex: 2, left: 0, top: 0 }}>
                        <div className='py-2 pt-3 px-3 w-100 d-flex justify-content-between align-items-center'>
                            <h5 className='w-100 text-center'>Vehicle Location</h5>
                            <RxCross1 className='cursor-pointer' onClick={() => {
                                setSelectedVehicle({});
                                setShowLocationOption(false);
                                setShowMap(false);
                            }} />
                        </div>
                        <LoadScript googleMapsApiKey={key}>
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={11}
                            >
                                <MarkerF
                                    // icon={image}
                                    position={center} />
                            </GoogleMap>
                        </LoadScript>
                    </div>
                ) : null
            } */}
            <Loader show={showLoader} />
            <div className='mt-5 my-3 px-5 pt-2 pb-5 bg-white rounded dashboard-main-container' onClick={() => handleShowOptions()}>
                <div className='w-100'>
                    <DashHead title="Vehicle Tracking Dashboard" />

                    <div className='mt-2'>
                        <Form onSubmit={handleSubmit}>
                            <Row className='dashoard-filter-form rounded'>
                                {
                                    selectformFields.map((data, index) => (
                                        <Col sm={12} md={6} lg={2} className='position-relative' key={index}>
                                            <Form.Label>{data?.label}</Form.Label>
                                            <Select
                                                options={data?.options}
                                                value={data?.value}
                                                onChange={data?.onChange}
                                                isClearable={true}
                                                styles={selectStyles}
                                            />
                                        </Col>
                                    ))
                                }

                                <Col sm={12} md={6} lg={2}>
                                    <Input label="Trip No." type='text' name='tripLogNo' value={form.tripLogNo} onChange={handleChange} placeholder='Trip No.' autocomplete="off" />
                                </Col>

                                <Col sm={12} md={6} lg={2} className='border-right border-secondary pt-4 d-flex justify-content-start align-items-center'>
                                    <Button type="button" className="px-3" onClick={() => handleFilterTrips()}>Show</Button>
                                    <HoveredButton type="button" className="px-3 ms-2"
                                        onClick={() => handleSelectFilter('All')}
                                    >Show All</HoveredButton>
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
                                            <div className='position-absolute bg-white px-0 d-flex justify-content-start align-items-center flex-column' style={{ top: 70, zIndex: 2, boxShadow: "0px 0px 10px 0px #c8c9ca" }}>
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
                                </Col>
                            </Row>
                        </Form>
                    </div>

                    <hr />

                    <div className='w-100 mt-5 d-flex justify-content-between align-items-center'>
                        <div className=''>
                            <span className='thm-dark fs-6 fw-bold'>Total Trips:</span>
                            <span className='fs-6 thm-dark ms-2'>{filteredTrips.length}</span>
                        </div>
                        <div className='me-5'>
                            <Tooltip title="Refresh Data">
                                <Link>
                                    <IoMdRefresh onClick={() => handleFilterTrips()}
                                        className='fs-2 refresh-button bg-thm-dark thm-white rounded p-1 cursor-pointer' />
                                </Link>
                            </Tooltip>
                        </div>
                    </div>
                    <div className='table-responsive mt-3' style={{ height: "50vh" }}>
                        <table className='table table-striped table-bordered w-100 position-relative'
                            style={{ overflowY: "scroll", overflowX: 'auto' }}
                        >
                            <thead className='table-head text-white' style={{ zIndex: 1, position: "sticky", top: 0 }}>
                                <tr style={{ borderRadius: "10px 0px 0px 10px" }}>
                                    {
                                        tableColumns.map((data, index) => (
                                            <th
                                                className={`text-nowrap ${(data?.label === 'Trip Status' || data?.label === 'Final Status') && 'width-150'} ${(data?.label === 'Driver Name' || data?.label === 'Static ETA') && 'width-200'} ${(data?.label === 'Location' || data?.label === 'Consignor Name') && 'width-300'}`}
                                                key={index}
                                                style={{ borderRadius: index === 0 ? "10px 0px 0px 0px" : index === tableColumns.length - 1 && "0px 10px 0px 0px" }}>
                                                <div className='d-flex justify-content-between align-items-center cursor-pointer' onClick={() => handleSortData(data?.value)}>
                                                    <span className='pe-3'>{data?.label}</span>
                                                    {
                                                        (data?.value !== "") && (
                                                            <FaSort />
                                                        )
                                                    }
                                                </div>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {currentTrips.length > 0 && currentTrips.map((data, index) => (
                                    <tr
                                        // className={`${getFinalStatus(data) === 'Mild Delayed' ? 'text-dark bg-warning' : getFinalStatus(data) === "Moderate Delayed" ? "text-dark bg-thm-gray" : getFinalStatus(data) === "Critical Delayed" && "text-white bg-danger"}`} 
                                        key={index}>
                                        <td>
                                            <button className="button" onClick={() => handleHideRow(data)}>
                                                <span className="button-decor"></span>
                                                <div className="button-content">
                                                    <div className="button__icon">
                                                        <BiSolidHide className='fs-6 text-white' />
                                                    </div>
                                                    <span className="button__text">Hide</span>
                                                </div>
                                            </button>
                                        </td>
                                        <td className='text-center fw-bold'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{data?.vehicleNo}</td>
                                        <td>{data?.tripLogNo}</td>
                                        <td>{handleFormateISTDate(data?.loadingDate)}</td>
                                        <td>{handleFormatDate(data?.vehicleExitDate)}</td>
                                        <td>{data?.consignorName}</td>
                                        <td>{data?.origin}</td>
                                        <td>{data?.destination}</td>
                                        <td>{handleSplitStaticEta(data?.staticETA)}</td>
                                        <td className={`${handleGPSDate(data?.locationTime) && 'bg-danger text-white'}`}>{handleFormatDate(data?.locationTime)}
                                        </td>
                                        <td>{data?.routeKM}</td>
                                        <td>{Math.floor(data?.runningKMs)}</td>
                                        <td>{Math.floor(data?.kmDifference)}</td>
                                        <td>{data?.unloadingReachDate === "" || data?.unloadingReachDate === null ? '' : handleFormatDate(data?.unloadingReachDate)}</td>
                                        <td>{data?.unloadingData === "" || data?.unloadingData === null ? '' : handleFormatDate(data?.unloadingDate)}</td>
                                        <td className='cursor-pointer position-relative'
                                            onMouseOver={() => setHovered(true)}
                                            onMouseOut={() => setHovered(false)}
                                            onClick={() => handleShowLocation(data)}>{data?.location}
                                            {
                                                (showLocationOption && data?.vehicleNo === currentVehicle) ? (
                                                    <div className='position-absolute bg-white p-3 rounded vehicle-details-popup'>
                                                        <h5 className='thm-dark d-inline'>{data?.vehicleNo}</h5>
                                                        <span className='ms-2 thm-dark'>2 Mins</span>
                                                        <p className='thm-dark mt-2 mb-0'>{data?.location}</p>
                                                        <p className='' style={{ fontSize: "0.8rem" }}>{handleFormatDate(data?.locationTime)}</p>
                                                        <div className='d-flex justify-content-around align-items-center border-top border-dark pt-2'>
                                                            {
                                                                locationOptionsBtns.map((location, i) => (
                                                                    <Link to={"#"} state={data} className='text-decoration-none'>
                                                                        <div className={`${location?.color} ${location?.cursor} mx-2`} key={i}
                                                                            onClick={() => {
                                                                                i === 1 && setShowLocation(true);
                                                                                i === 1 && setSelectedVehicle(data);
                                                                                i === 1 && setShowMap(true);
                                                                            }}
                                                                        >
                                                                            {location?.icon}
                                                                            <span className='fw-bold fs-6 mx-2'>{location.title}</span>
                                                                        </div>
                                                                    </Link>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                ) : null
                                            }
                                        </td>
                                        <td>{handleFormateISTDate(data?.estimatedArrivalDate)}</td>
                                        <td className={`${data?.finalStatus === 'Delayed'} pe-3 h-100`}>
                                            <div className='d-flex justify-content-between align-items-center w-100'>
                                                {getFinalStatus(data)}
                                                {showDelayedIcon(data)}
                                            </div>
                                        </td>
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
                            (currentTrips.length === 0 && !showLoader) ? (
                                <div className='pb-3 text-secondary d-flex justify-content-center align-items-center'>{errorMessage}</div>
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

                    <ForceCompleteForm handleFilterTrips={handleFilterTrips} show={showForceCompleteModal} setShow={setShowForceCompleteModal} data={selectedVehicle} />

                    <Modal show={showLocation} fullscreen onHide={() => {
                        setShowLocation(false);
                        setSelectedVehicle(null);
                        setShowMap(false);
                    }} className='p-5'>
                        <Modal.Header closeButton>
                            <Modal.Title className='w-100 text-center thm-dark'>Vehicle Location</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {
                                showMap ? (
                                    <LoadScript googleMapsApiKey={key}>
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={center}
                                            zoom={11}
                                            options={{ gestureHandling: 'greedy' }}
                                        >
                                            <MarkerF
                                                // icon={truck}
                                                position={center} />
                                        </GoogleMap>
                                    </LoadScript>
                                ) : null
                            }
                        </Modal.Body>
                    </Modal>
                    {/* <VehicleLocation show={showLocation} setShow={setShowLocation} vehicleData={vehicleData} /> */}
                </div>
            </div>
        </div>
    )
}

export default VehicleTrackDash;
