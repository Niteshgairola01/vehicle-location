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
import { ErrorToast } from '../components/toast/toast';
import { Input } from '../components/form/Input';
import { getRunningTrips } from '../hooks/tripsHooks';
import { getAllVehiclesList } from '../hooks/vehicleMasterHooks';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Pagination from '../components/pagination';
import ForceCompleteForm from './forceCompleteForm';
import Loader from '../components/loader/loader';
import DashHead from '../components/dashboardHead';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { FaSort } from "react-icons/fa";
import '../assets/styles/home.css';
import VehicleRoute from './tracking/vehicleRoute';

const VehicleTrackDash = () => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    const loggedInUser = localStorage.getItem('userId');
    const navigate = useNavigate();

    const [showMap, setShowMap] = useState(false);

    const [form, setForm] = useState({});
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState([]);
    const [partiesList, setPartiesList] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [originsList, setOriginsList] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState({});
    const [hovered, setHovered] = useState(false);
    const [selectedParty, setSelectedParty] = useState('');
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [isOpenParty, setIsOpenParty] = useState(false);
    const [isOpenOffice, setIsOpenOffice] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [errorMessage, setErrorMessage] = useState('No data found');
    const [selectedVehicleNo, setSelectedVehicleNo] = useState('');
    const [isOpenVehicle, setIsOpenVehicle] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showLocation, setShowLocation] = useState(false);
    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showHideToggle, setShowHideToggle] = useState(false);
    const [showRoute, setShowRoute] = useState(false);
    const [isHovered, setIsHovered] = useState(true);
    const [currentVehicle, setCurrentVehicle] = useState('');

    const [allTripsMild, setAllTripsMild] = useState(0);
    const [allTripsModerate, setAllTripsModerate] = useState(0);
    const [allTripsCritical, setAllTripsCritical] = useState(0);


    const [mildCounts, setMildCounts] = useState(0);
    const [moderateCounts, setModerateCounts] = useState(0);
    const [criticalCounts, setCriticalCounts] = useState(0);

    const [animationKey, setAnimationKey] = useState(0);

    const [tableColumns, setTableColumns] = useState(
        [
            { label: 'Trip Count', value: 'tripCount', hidden: false },
            { label: 'Vehicle No.', value: 'vehicleNo', hidden: false },
            { label: 'Status', value: 'status', hidden: false },
            { label: 'Trip No.', value: 'tripLogNo', hidden: false },
            { label: 'Loading (Date / Time)', value: 'loadingDate', hidden: false },
            { label: 'Vehicle Exit (Date / Time)', value: 'vehicleExitDate', hidden: false },
            { label: 'Consignor Name', value: 'consignorName', hidden: false },
            { label: 'Origin', value: 'origin', hidden: false },
            { label: 'Destination', value: 'destination', hidden: false },
            { label: 'Static ETA (PAPL)', value: 'staticETA', hidden: false },
            { label: 'Static ETA (OEM)', value: "oemReachTime", hidden: false },
            { label: 'GPS (Date / Time)', value: 'locationTime', hidden: false },
            { label: 'Location', value: 'location', hidden: false },
            { label: 'Route (KM)', value: 'routeKM', hidden: false },
            { label: 'KM Covered', value: 'runningKMs', hidden: false },
            { label: 'Difference (Km)', value: 'kmDifference', hidden: false },
            { label: 'Report Unloading', value: 'unloadingReachDate', hidden: false },
            { label: 'Unloading End Date', value: 'unloadingDate', hidden: false },
            { label: 'Estimated Arrival Date', value: 'estimatedArrivalDate', hidden: false },
            { label: 'Final Status', value: 'finalStatus', hidden: false },
            { label: 'OEM Final Status', value: 'oemFinalStatus', hidden: false },
            { label: 'Delayed Hours', value: 'delayedHours', hidden: false },
            { label: 'Driver Name', value: 'driverName', hidden: false },
            { label: 'Driver Mobile No.', value: 'driverMobileNo', hidden: false },
            { label: 'Exit From', value: 'exitFrom', hidden: false },
            { label: 'Trip Status', value: 'tripStatus', hidden: false },
            { label: 'Force Complete', value: 'forcecomplete', hidden: false }
        ]
    );

    const closed = localStorage.getItem('reload');
    const filtersArr = localStorage.getItem('filters');

    useEffect(() => {
        console.log("filtersArr", JSON.parse(filtersArr));
        if (filtersArr !== null) {
            const parsedFilters = JSON.parse(filtersArr);

            if (parsedFilters.length > 0) {
                setSelectedFilter(parsedFilters);
                setTimeout(() => {
                    localStorage.removeItem('filters');
                }, 1000);
            }
        }
    }, [filtersArr]);

    useEffect(() => {
        if (!loggedInUser) {
            localStorage.clear();
            navigate('/');
        }
    }, [loggedInUser, navigate]);

    useEffect(() => {
        if (closed === 'true') {
            window.location.reload();
            localStorage.setItem("reload", "false");
        }
    }, [closed]);


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
        setAnimationKey(previousKey => previousKey + 1);
    }, [filteredTrips]);

    useEffect(() => {
        currentTrips = filteredTrips.slice(indexOfFirstPost, indexOfLastPost);
        currentPage > pageCount && setCurrentPage(1);
    }, [filteredTrips]);

    const allFilters = ['Trip Running', 'Trip Completed', 'Trip not Assgined', 'Early', 'On Time', 'Mild Delayed', 'Moderate Delayed',
        'Critical Delayed', 'On Time & Early (As per OEM)', 'Delayed (As per OEM)', 'Manual Bind'];

    const getAllTrips = () => {
        setShowLoader(true)
        getRunningTrips().then((response) => {
            if (response.status === 200) {
                setShowLoader(false);
                const allData = response?.data;

                setAllTrips(allData);
                setFilteredTrips(allData);
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
    }, []);

    useEffect(() => {
        const uniqueOriginsSet = new Set();

        allTrips.forEach(item => {
            item?.origin !== null && uniqueOriginsSet.add(item.origin.toLowerCase());
        });

        const uniqueOriginsArray = Array.from(uniqueOriginsSet);

        const desiredOriginArray = uniqueOriginsArray.map(origin => {
            return {
                origin: origin.charAt(0).toUpperCase() + origin.slice(1),
                label: origin.charAt(0).toUpperCase() + origin.slice(1),
                value: origin.charAt(0).toUpperCase() + origin.slice(1),
            };
        });

        setOriginsList(desiredOriginArray)

    }, [allTrips, filteredTrips]);

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
    }, [selectedOrigin, selectedParty, selectedVehicleNo]);


    const getDelayCount = () => {
        const allMildTrips = allTrips.map(data => {
            const delayedHours = parseInt(data?.delayedHours);
            return ((delayedHours >= 0 && delayedHours <= 18) === true && data?.tripStatus === 'Trip Running');
        });

        const allModerateTrips = allTrips.map(data => {
            const delayedHours = parseInt(data?.delayedHours);
            return ((delayedHours >= 19 && delayedHours <= 35) === true && data?.tripStatus === 'Trip Running');
        });

        const allCriticalTrips = allTrips.map(data => {
            const delayedHours = parseInt(data?.delayedHours);
            return ((delayedHours >= 36) === true && data?.tripStatus === 'Trip Running');
        });

        const allMilds = allMildTrips.filter(data => data);
        const allModerates = allModerateTrips.filter(data => data);
        const allCriticals = allCriticalTrips.filter(data => data);

        setAllTripsMild(allMilds?.length);
        setAllTripsModerate(allModerates?.length);
        setAllTripsCritical(allCriticals?.length);

        const mildTrips = filteredTrips.map(data => {
            const delayedHours = parseInt(data?.delayedHours);
            return ((delayedHours >= 0 && delayedHours <= 18) === true && data?.tripStatus === 'Trip Running');
        });
        const milds = mildTrips.filter(data => data);

        const moderateTrips = filteredTrips.map(data => {
            const delayedHours = parseInt(data?.delayedHours);
            return ((delayedHours >= 19 && delayedHours <= 35) === true && data?.tripStatus === 'Trip Running');
        });
        const moderates = moderateTrips.filter(data => data);

        const criticalTrips = filteredTrips.map(data => {
            const delayedHours = parseInt(data?.delayedHours);
            return ((delayedHours >= 36) === true && data?.tripStatus === 'Trip Running');
        });
        const criticals = criticalTrips.filter(data => data);

        setMildCounts(milds.length);
        setModerateCounts(moderates?.length);
        setCriticalCounts(criticals?.length);
    };

    useEffect(() => {
        getDelayCount();
    }, [allTrips, filteredTrips, currentTrips]);

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

                const allFilteredTrip = allData.filter(test => {
                    for (const key in form) {
                        const testValue = String(test[key]).toLowerCase();
                        const formValue = form[key].toLowerCase();
                        if ((testValue !== formValue && formValue.length > 0)) {
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

                        if (selectedFilter.includes("On Time & Early (As per OEM)") || selectedFilter.includes("Delayed (As per OEM)") || selectedFilter.includes('Mild Delayed') || selectedFilter.includes('Moderate Delayed') || selectedFilter.includes('Critical Delayed') || selectedFilter.includes('Early') || selectedFilter.includes('On Time')) {
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

                            if (
                                (selectedFilter.includes('Mild Delayed') || selectedFilter.includes('Moderate Delayed') || selectedFilter.includes('Critical Delayed')) &&
                                (!selectedFilter.includes('On Time & Early (As per OEM)') && !selectedFilter.includes('Delayed (As per OEM)'))
                            ) {
                                if (selectedFilter.includes('Mild Delayed')) {
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed') || selectedFilter.includes('On Time & Early (As per OEM)') || selectedFilter.includes('Delayed (As per OEM)')) {
                                        const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 0 && delayedHours <= 18) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 0 && delayedHours <= 18) {
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
                                        });
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

                            if (selectedFilter.includes("On Time & Early (As per OEM)") || selectedFilter.includes("Delayed (As per OEM)")) {
                                if (selectedFilter.includes('On Time & Early (As per OEM)')) {
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        allFilteredTrip.forEach(data => {
                                            const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })

                                    } else if (selectedFilter.includes('Mild Delayed') || selectedFilter.includes('Moderate Delayed') || selectedFilter.includes('Critical Delayed')) {
                                        if (selectedFilter.includes('Mild Delayed')) {
                                            if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                                const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilter.includes('Moderate Delayed')) {
                                            if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                                const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilter.includes('Critical Delayed')) {
                                            if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                                const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    else {
                                        allFilteredTrip.forEach(data => {
                                            const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })
                                    }
                                }

                                if (selectedFilter.includes('Delayed (As per OEM)')) {

                                    // if(selectedFilter.includes('Delayed (As per OEM)') && (
                                    //     (!selectedFilter.includes('Trip Tunning') && !selectedFilter.includes('Trip Completed') && !selectedFilter.includes('Mo'))
                                    // ))

                                    if (((selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) && (selectedFilter.includes('Delayed (As per OEM)')))
                                        && (!selectedFilter.includes('Mild Delayed') && !selectedFilter.includes('Moderate Delayed') && !selectedFilter.includes('Critical Delayed'))
                                    ) {
                                        allFilteredTrip.forEach(data => {
                                            const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })

                                    }

                                    // if ((selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed') && (selectedFilter.includes('On Time & Early (As per OEM)') || selectedFilter.includes('Delayed (As per OEM)'))) &&
                                    //     (!selectedFilter.includes('On Time & Early (As per OEM)') && !selectedFilter.includes('Delayed (As per OEM)'))) {
                                    //     allFilteredTrip.forEach(data => {
                                    //         const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                    //         if (testData === true) {
                                    //             finalStatusTrips.push(data)
                                    //         }
                                    //     })

                                    // }

                                    if (selectedFilter.includes('Mild Delayed') || selectedFilter.includes('Moderate Delayed') || selectedFilter.includes('Critical Delayed')) {
                                        if (selectedFilter.includes('Mild Delayed')) {
                                            if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                                const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })

                                            } else {
                                                const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilter.includes('Moderate Delayed')) {
                                            if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                                const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilter.includes('Critical Delayed')) {
                                            if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                                const delayedArr1 = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilter.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    // else {
                                    //     allFilteredTrip.forEach(data => {
                                    //         const testData = (data?.oemFinalStatus === 'Delayed');
                                    //         if (testData === true) {
                                    //             finalStatusTrips.push(data)
                                    //         }
                                    //     })
                                    // }
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
            setSelectedOrigin('')
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

    const showDelayedIcon = (data, index, colIndex) => {
        if (data?.finalStatus === 'Delayed') {
            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                const delayedHours = parseInt(data?.delayedHours);
                if (delayedHours >= 0 && delayedHours <= 18) {
                    return <span className={`py-1 px-2 ${data?.tripStatus === 'Trip Running' ? 'warn-icon bg-secondary text-white' : 'text-dark'} rounded text-center`}
                        id={`${data?.tripStatus === 'Trip Running' ? 'warn-icon' : ''}`}
                        key={`${index}-${colIndex}-${animationKey}`}
                        style={{ minWidth: "100%" }}>Mild Delayed</span>
                } else if (delayedHours >= 19 && delayedHours <= 35) {
                    return <span className={`py-1 px-2 m-0 ${data?.tripStatus === 'Trip Running' ? 'warn-icon bg-warning text-dark' : 'text-dark'} rounded`}
                        id={`${data?.tripStatus === 'Trip Running' ? 'warn-icon' : ''}`}
                        key={`${index}-${colIndex}-${animationKey}`}
                        style={{ minWidth: "100%" }}>Moderate Delayed</span>
                } else if (delayedHours >= 36) {
                    return <span className={`py-1 px-2 ${data?.tripStatus === 'Trip Running' ? 'warn-icon bg-danger text-white' : 'text-dark'} rounded text-center`}
                        id={`${data?.tripStatus === 'Trip Running' ? 'warn-icon' : ''}`}
                        key={`${index}-${colIndex}-${animationKey}`}
                        style={{ minWidth: "100%" }}>Critical Delayed</span>
                }
            } else {
                return '';
            }
        } else if (data?.finalStatus === 'On Time' || data?.finalStatus === 'Early' || data?.finalStatus === "") {
            return <span className='px-2 text-center w-100' style={{ fontWeight: '400' }}>{data?.finalStatus}</span>
        }
    };

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

    const convertTo24HourFormat = (timeString) => {

        var timeComponents = timeString.split(" ");
        var date = timeComponents[0];
        var time = timeComponents[1];
        var period = timeComponents[2];

        var timeParts = time.split(":");
        var hours = parseInt(timeParts[0]);
        var minutes = parseInt(timeParts[1]);
        var seconds = parseInt(timeParts[2]);

        if (period === "PM" && hours < 12) {
            hours += 12;
        }

        if (period === "AM" && hours === 12) {
            hours = 0;
        }

        hours = String(hours).padStart(2, "0");
        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");

        var time24Hour = hours + ":" + minutes + ":" + seconds;

        return date + " " + time24Hour;
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

    const handleChangeOrigin = (selectedValue) => {
        setSelectedOrigin(selectedValue);

        if (selectedValue === null) {
            setForm({
                ...form,
                origin: ''
            });
        } else {
            setForm({
                ...form,
                origin: selectedValue?.origin
            });
        }
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
            label: "Origin",
            options: originsList,
            value: selectedOrigin,
            onChange: handleChangeOrigin
        },
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
        setCurrentVehicle(data?.vehicleNo)
        setShowLocationOption(true);
    };

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

            // Sort 0
            if (valueA === '0' || valueB === '0') {
                return order === 'asc' ? (valueA.localeCompare(valueB)) : (valueB.localeCompare(valueA));
            }

            // // Sort date / time
            const [dayA, monthA, yearA, timeA] = valueA.split(/[\/\s:]/);
            const [dayB, monthB, yearB, timeB] = valueB.split(/[\/\s:]/);

            const dateValueA = new Date(yearA, monthA - 1, dayA, timeA);
            const dateValueB = new Date(yearB, monthB - 1, dayB, timeB);

            const numericValueA = parseFloat(valueA);
            const numericValueB = parseFloat(valueB);

            if (valueA.length > 10) {
                if (!isNaN(dateValueA.getTime()) && !isNaN(dateValueB.getTime())) {
                    return order === 'asc' ? dateValueA - dateValueB : dateValueB - dateValueA;
                }
            } else {
                if (!isNaN(numericValueA) && !isNaN(numericValueB)) {
                    return order === 'asc' ? numericValueA - numericValueB : numericValueB - numericValueA;
                }
            }

            // Set string values
            const stringA = String(valueA);
            const stringB = String(valueB);

            return order === 'asc' ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
        });

        setSortOrder(order);
        setFilteredTrips(sorted);
    };

    const handleHideColumns = (index) => {
        setTableColumns((prevColumns) => {
            const updatedColumns = [...prevColumns];
            updatedColumns[index] = {
                ...updatedColumns[index],
                hidden: !updatedColumns[index].hidden,
            };
            return updatedColumns;
        });
    };

    const handleTableColumns = (data, column, value, index, colIndex) => {
        if (column.label === 'Loading (Date / Time)' || column.label === "Estimated Arrival Date" || column.label === "Static ETA (OEM)" || column.label === "Static ETA (PAPL)") {
            return <td key={colIndex}>{handleFormateISTDate(value)}</td>;
        } else if (value === "Delayed Hours") {
            return <td key={colIndex}>{getDelayedHours(value)}</td>;
        } else if (column?.label === "Vehicle Exit (Date / Time)" || column?.label === "GPS (Date / Time)" || column?.label === "Estimated Arrival Date") {
            return <td key={colIndex}>{handleFormatDate(value)}</td>;
        } else if (column?.label === "Static ETA") {
            return <td key={colIndex}>{(data?.staticETA === '' || data?.staticETA === null) ? ' ' : convertTo24HourFormat(data?.staticETA)}</td>;
        } else if (column?.label === "Report Unloading") {
            return <td key={colIndex} className=''>{data?.unloadingReachDate === "" || data?.unloadingReachDate === null ? '' : handleFormatDate(data?.unloadingReachDate)}</td>
        } else if (column?.label === "Unloading End Date") {
            return <td key={colIndex}>{data?.unloadingDate === "" || data?.unloadingDate === null ? '' : handleFormatDate(data?.unloadingDate)}</td>
        } else if (column?.label === 'Difference (Km)') {
            return <td key={colIndex} className='text-center'>{Math.floor(value)}</td>
        } else if (column?.label === 'Route (KM)') {
            return <td key={colIndex} className='text-center'>{data?.routeKM !== "" ? Math.floor(value) : ""}</td>
        } else if (column?.label === 'KM Covered') {
            return <td key={colIndex} className='text-center'>{data?.runningKMs}</td>
        } else if (column?.label === 'Location') {
            return <td key={colIndex} className={`${data?.location !== "" && data?.location !== null && 'cursor-pointer'} vehicle-location position-relative`}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
                onClick={() => handleShowLocation(data)}>
                {data?.location}
                <>
                    {
                        (data?.location !== "" && data?.location !== null && showLocationOption && data?.vehicleNo === currentVehicle) ? (
                            <div className='position-absolute bg-white p-3 rounded vehicle-details-popup'>
                                <h5 className='thm-dark d-inline'>{data?.vehicleNo}</h5>
                                <span className='ms-2 thm-dark'>2 Mins</span>
                                <p className='thm-dark mt-2 mb-0'>{data?.location}</p>
                                <p className='' style={{ fontSize: "0.8rem" }}>{handleFormatDate(data?.locationTime)}</p>
                                <div className='d-flex justify-content-around align-items-center border-top border-dark pt-2'>
                                    <Link to={'#'} state={data}
                                        onClick={() => {
                                            setShowRoute(true)
                                            localStorage.setItem('filters', JSON.stringify(selectedFilter));
                                            localStorage.setItem("vehicle", data?.vehicleNo);
                                            localStorage.setItem("vehicleExitDbID", data?.vehicleExitDbID);
                                            localStorage.setItem("lastDbID", data?.lastDbID);
                                        }}
                                        className='text-decoration-none'>
                                        <div className={`thm-dark cursor-pointer mx-2`}>
                                            <FaRoute />
                                            <span className='fw-bold fs-6 mx-2'>{'History'}</span>
                                        </div>
                                    </Link>

                                    <Link to={'#'} state={data} className='text-decoration-none'>
                                        <div className={`thm-dark cursor-pointer mx-2`}
                                            onClick={() => {
                                                setShowLocation(true);
                                                setSelectedVehicle(data);
                                                setShowMap(true);
                                            }}
                                        >
                                            <FaRoute />
                                            <span className='fw-bold fs-6 mx-2'>{'Track'}</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ) : null
                    }
                </>
            </td>
        } else if (column?.label === 'Final Status') {
            return <td key={colIndex}>
                <div className='d-flex justify-content-between fw-bold align-items-center m-0 p-0 w-100'>
                    {showDelayedIcon(data, index, colIndex)}
                </div>
            </td>
        } else if (column?.label === 'OEM Final Status') {
            return <td key={colIndex}>{data?.oemFinalStatus}</td>
        } else if (column?.label === 'Delayed Hours') {
            return <td key={colIndex}>{getDelayedHours(value)}</td>
        } else if (column?.label === 'Force Complete') {
            return <td key={colIndex} className='h-100 py-3 d-flex justify-content-center align-items-center'>
                <button className={`border border-none ${((data?.tripStatus === 'Trip Running') && (data?.operationUniqueID.length > 0)) ? 'force-complete-button' : 'force-complete-button-disabled'}`}
                    onClick={() => handleShowForceComplete(data)}>Force Complete</button>
            </td>
        } else if (column?.label === 'Trip Count') {
            return <td key={colIndex} className='text-center fw-bold'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
        } else if (column?.label === 'Vehicle No.') {
            return <td key={colIndex}
            //  style={{ background: data?.currVehicleStatus === "On Hold" ? '#fffc00cc' : data?.currVehicleStatus === 'Running' ? '#47ff47cf' : data?.currVehicleStatus === 'GPS Off' && '#ff0000cf', color: data?.currVehicleStatus === 'GPS Off' && '#fff', fontWeight: data?.currVehicleStatus === 'GPS Off' && 'bold' }}
            >{value}</td>
        } else if (column?.label === 'Status') {
            return <td className='h-100 py-3  pb-4 d-flex justify-content-center align-items-center'>
                <div className='h-100'>
                    <div className={`circle ${data?.currVehicleStatus === "On Hold" ? 'circle-yellow-blink' : data?.currVehicleStatus === 'Running' ? 'circle-green-blink' : data?.currVehicleStatus === 'GPS Off' ? 'circle-red-blink' : data?.currVehicleStatus === null && 'bg-white'}`}></div>
                </div>
            </td>
        }
        else {
            return <td key={colIndex}>{value}</td>;
        }
    };

    const handleHideOptions = () => {
        !isHovered && setShowHideToggle(false);
    };

    return (
        <div className='m-0 p-0 position-relative' onClick={() => handleHideOptions()}>
            <Loader show={showLoader} />
            <div className='mt-5 my-3 px-5 pt-2 pb-5 bg-white rounded dashboard-main-container' onClick={() => handleShowOptions()}>
                <div className='w-100'>
                    <DashHead title="Vehicle Tracking Dashboard" />
                    <div className='w-100 m-0 p-0 d-flex justify-content-end align-items-center mb-3'>
                        <div className='d-flex justify-content-center align-items-center'>
                            <div className='mx-1 px-2 thm-dark'>
                                <span>Current Status </span>
                            </div>
                            <div className='mx-1 thm-white bg-secondary px-2'>
                                <span>Mild Delayed: </span>
                                <span>{allTripsMild}</span>
                            </div>
                            <div className='mx-1 px-2 text-dark bg-warning'>
                                <span>Moderate Delayed: </span>
                                <span>{allTripsModerate}</span>
                            </div>
                            <div className='mx-1 px-2 fw-bold blink'>
                                <span>Critical Delayed: </span>
                                <span>{allTripsCritical}</span>
                            </div>
                        </div>
                    </div>
                    <div className='mt-2'>
                        <Form onSubmit={handleSubmit}>
                            <Row className='dashoard-filter-form rounded'>
                                {
                                    selectformFields.map((data, index) => (
                                        <Col sm={12} md={6} lg={2} className='position-relative' key={index} style={{ zIndex: 3 }}>
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
                                            <div className='position-absolute bg-white px-0 d-flex justify-content-start align-items-center flex-column' style={{ top: 70, zIndex: 3, boxShadow: "0px 0px 10px 0px #c8c9ca" }}>
                                                {
                                                    allFilters.map((data, index) => (
                                                        <div className={` py-2 ps-3 pe-5 w-100 ${selectedFilter.includes(data) ? 'filter-options-active' : 'filter-options'} border-bottom cursor-pointer`}
                                                            onMouseOver={() => setHovered(true)}
                                                            onMouseOut={() => setHovered(false)}
                                                            key={index}
                                                            onClick={() => handleSelectFilter(data)}
                                                        >{data}</div>
                                                    ))
                                                }
                                                <div className='d-flex justify-content-end align-items-center w-100'>
                                                    <HoveredButton className="me-2 my-2 py-1 px-4">OK</HoveredButton>
                                                </div>
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
                        <div className='d-flex justify-content-start align-items-start'>
                            <div className=''>
                                <span className='thm-dark fs-6 fw-bold'>Total Trips:</span>
                                <span className='fs-6 thm-dark ms-2'>{filteredTrips.length}</span>
                            </div>
                            <div className='ms-3 bg-white position-relative'>
                                <div className='hide-columns thm-dark fs-6 cursor-pointer px-5 py-1 rounded text-center'
                                    onClick={() => {
                                        setShowHideToggle(!showHideToggle);
                                        setIsHovered(true)
                                    }}>Hide Columns</div>
                                {
                                    showHideToggle ? (
                                        <div className='position-absolute pt-3 pb-0 px-0 bg-white column-items-div rounded'>
                                            <div className='column-items'>
                                                {
                                                    tableColumns.map((data, index) => (
                                                        <div key={index}
                                                            onMouseOver={() => setIsHovered(true)}
                                                            onMouseOut={() => setIsHovered(false)}
                                                            onClick={() => handleHideColumns(index)}
                                                            className='hide-colums-item py-2 ps-3 d-flex justify-content-start align-items-start cursor-pointer'>
                                                            <input className="switch" type="checkbox"
                                                                checked={data?.hidden === true}
                                                            />
                                                            <span className='ms-3'>{data?.label}</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            <div className='d-flex justify-content-end align-items-center w-100'>
                                                <HoveredButton className="me-3 mb-2 py-1 px-4">OK</HoveredButton>
                                            </div>
                                        </div>
                                    ) : null
                                }
                            </div>
                        </div>
                        <div className='me-5 d-flex jsutify-conent-end align-items-center'>
                            <div className='d-flex me-3 justify-content-cennter align-items-center'>
                                <div className='mx-1 thm-white bg-secondary px-2'>
                                    <span>Mild Delayed: </span>
                                    <span>{mildCounts}</span>
                                </div>
                                <div className='mx-1 px-2 text-dark bg-warning'>
                                    <span>Moderate Delayed: </span>
                                    <span>{moderateCounts}</span>
                                </div>
                                <div className='mx-1 px-2 bg-danger text-white'>
                                    <span>Critical Delayed: </span>
                                    <span>{criticalCounts}</span>
                                </div>
                            </div>
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
                            <thead className='table-head text-white' style={{ zIndex: 2, position: "sticky", top: 0 }}>
                                <tr style={{ borderRadius: "10px 0px 0px 10px" }}>
                                    {
                                        tableColumns.map((data, index) => (
                                            <>
                                                {
                                                    data?.hidden === false ? (
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
                                                    ) : null
                                                }
                                            </>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {currentTrips.length > 0 && currentTrips.map((data, index) => (
                                    <tr key={index}>
                                        {tableColumns.map((column, colIndex) => (
                                            <>
                                                {
                                                    column?.hidden === false && handleTableColumns(data, column, data[column.value], index, colIndex)
                                                }
                                            </>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                        {
                            (currentTrips.length === 0 && !showLoader) ? (
                                <div className='pb-3 text-secondary d-flex justify-content-center align-items-center'>
                                    {errorMessage}
                                </div>
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

                    <VehicleRoute show={showRoute} setShow={setShowRoute} />
                </div>
            </div>
        </div>
    )
}

export default VehicleTrackDash;
