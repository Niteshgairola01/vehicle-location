import React, { useEffect, useState } from 'react'
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
        'Final Status', 'Driver Name', 'Driver Mobile No.', 'Exit From', 'Trip Status', 'Force Complete'
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
            (response.status === 200) ? setPartiesList(response?.data) : setPartiesList([]);
        }).catch(() => setPartiesList([]));
    }, []);

    useEffect(() => {
        getAllVehiclesList().then((response) => {
            (response.status === 200) ? setVehiclesList(response?.data) : setVehiclesList([]);
        }).catch(() => setVehiclesList([]));
    }, []);

    // useEffect(() => {
    //     getAllOfficesList().then((response) => {
    //         (response.status === 200) ? setofficesList(response?.data) : setofficesList([]);
    //     }).catch(() => setofficesList([]));
    // }, []);

    const [eventKey, setEventKey] = useState(0);
    const [selectedElement, setSelectedElement] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const filteredArr = [
        {
            id: 1,
            title: 'title 1'
        },
        {
            id: 2,
            title: 'title 2'
        },
        {
            id: 3,
            title: 'title 3'
        },
    ];

    document.addEventListener("keydown", function (event) {
        setEventKey(event.keyCode);
    });

    useEffect(() => {
        if (eventKey === 40) {
            filteredPartyOptions.forEach((option, index) => {
            });
        }
    }, [eventKey]);

    const handleInputChangeParty = (e) => {
        setSelectedParty(e.target.value);

        let key;
        if (eventKey === 40) {
            for (let index = 0; index < filteredPartyOptions.length; index++) {
                key = index++;
            }
        }

        setIsOpenParty(true);
        setForm({
            ...form,
            consignorName: e.target.value
        })
    };

    const handleOptionClickParty = (i) => {
        setSelectedParty(i)
        setForm({
            ...form,
            consignorName: i
        })
        setIsOpenParty(false);
    };

    const filteredPartyOptions = partiesList.filter((option) =>
        (option?.clientName).toLowerCase().includes(selectedParty.toLowerCase())
    );

    const handleOpenParty = () => {
        setIsOpenParty(true);

        const handleKeyDown = (event) => {
            if (event.keyCode === 40) {
                setSelectedIndex((prevIndex) =>
                    prevIndex < filteredPartyOptions.length - 1 ? prevIndex + 1 : prevIndex
                );

            } else if (event.keyCode === 38) {
                setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };


    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 40) {
            setSelectedIndex((prevIndex) =>
                prevIndex < filteredPartyOptions.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (event.keyCode === 38) {
            setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex !== -1) {
            setSelectedElement(filteredPartyOptions[selectedIndex]);
        } else {
            setSelectedElement({});
        }
    }, [selectedIndex]);


    const handleInputChangeOffice = (e) => {
        setSelectedOffice(e.target.value);

        setIsOpenParty(true);
        setForm({
            ...form,
            office: e.target.value
        })
    };

    const handleOptionClickOffice = (i) => {
        setSelectedOffice(i)
        setForm({
            ...form,
            office: i
        })
        setIsOpenOffice(false);
    };

    const filteredOfficeOptions = allOffices.filter((option) =>
        (option).toLowerCase().includes(selectedOffice.toLowerCase())
    );

    const handleInputChangeVehicle = (e) => {
        setSelectedVehicleNo(e.target.value);

        setIsOpenVehicle(true);
        setForm({
            ...form,
            vehicleNo: e.target.value
        })
    };

    const handleOptionClickVehicle = (i) => {
        setSelectedVehicleNo(i)
        setForm({
            ...form,
            vehicleNo: i
        })
        setIsOpenVehicle(false);
    };

    const filteredVehicleOptions = vehiclesList.filter((option) =>
        (option?.vehicleNo).toLowerCase().includes(selectedVehicleNo.toLowerCase())
    );

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let trips = [];

        getRunningTrips().then((response) => {
            if (response.status === 200) {
                trips = response?.data;

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
                            }
                            else if (selectedFilter.includes('Delayed') || selectedFilter.includes('Critical Delayed')) {
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

                                    testArr.map((data) => {
                                        const staticETA = data?.staticETA !== null && parseDate(data?.staticETA);
                                        const estimatedArrivalDate = data?.estimatedArrivalDate && parseDate(data?.estimatedArrivalDate);

                                        if (staticETA && estimatedArrivalDate) {
                                            const timeDiffInDays = Math.floor((estimatedArrivalDate - staticETA) / (1000 * 60 * 60 * 24));

                                            if (timeDiffInDays < 2 && data.finalStatus === "Delayed") {
                                                tripsFilteredByTripStatus.push(data);
                                            }
                                        }
                                    });

                                } else if (!selectedFilter.includes('Delayed') && selectedFilter.includes('Critical Delayed')) {

                                    let testArr;
                                    if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Completed')) {
                                        testArr = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus));
                                    } else {
                                        testArr = allFilteredTrip.filter((data) => data?.finalStatus === 'Delayed');
                                    }

                                    testArr.map((data) => {
                                        const staticETA = data?.staticETA !== null && parseDate(data?.staticETA);
                                        const estimatedArrivalDate = data?.estimatedArrivalDate && parseDate(data?.estimatedArrivalDate);

                                        if (staticETA && estimatedArrivalDate) {
                                            const timeDiffInDays = Math.floor((estimatedArrivalDate - staticETA) / (1000 * 60 * 60 * 24));

                                            if (timeDiffInDays > 2 && data.finalStatus === "Delayed") {
                                                tripsFilteredByTripStatus.push(data);
                                            }
                                        }
                                    });
                                } else {
                                    allFilteredTrip.filter(data => data?.finalStatus === 'Delayed')
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
                    } else {
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
        // setIsGreaterThan4Hours(hoursDifference > 4);

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

    // useEffect(() => {
    //     const allFilteredTrip = allTrips.filter(test => {
    //         for (const key in form) {
    //             const testValue = String(test[key]).toLowerCase();
    //             const formValue = form[key].toLowerCase();
    //             if (testValue !== formValue && formValue.length > 0) {
    //                 return false;
    //             }
    //         }
    //         return true;
    //     });

    //     setFilteredTrips(allFilteredTrip);

    //     if (selectedFilter.length > 0) {
    //         let tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && selectedFilter.includes(data?.finalStatus));
    //         if (selectedFilter.includes('Delayed') || selectedFilter.includes('Early') || selectedFilter.includes('On Time')) {
    //             if (selectedFilter.includes('Trip Running') || selectedFilter.includes('Trip Running')) {
    //                 tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus) && selectedFilter.includes(data?.finalStatus));
    //             } else {
    //                 tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.finalStatus));
    //             }
    //         } else {
    //             tripsFilteredByTripStatus = allFilteredTrip.filter((data) => selectedFilter.includes(data?.tripStatus));
    //         }
    //         setFilteredTrips(tripsFilteredByTripStatus);
    //     } else {
    //         setFilteredTrips(allFilteredTrip);
    //     }
    // }, [refreshClicked]);

    // document.addEventListener("keydown", function (event) {
    //     console.log(event);
    // })

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
                                <Input label="Party" name="consignorName" onChange={handleInputChangeParty} value={selectedParty} onClick={() => handleOpenParty()} placeholder="Party Name" autocomplete="off" />
                                {isOpenParty && (
                                    <>
                                        <div style={{ maxHeight: "15rem", position: 'absolute', top: '4.5rem', width: '90%', zIndex: '999', border: "black", background: 'white', overflowY: "scroll" }} className="border px-3 py-2 border-2 d-flex flex-column">
                                            {
                                                partiesList.length > 0 ? (
                                                    filteredPartyOptions.length > 0 ? (
                                                        filteredPartyOptions.map((option, i) => (
                                                            <div className={`${selectedParty === option?.clientName ? 'bg-thm-dark thm-white' : 'bg-thm-white text-dark'} mt-2`} style={{ fontSize: "0.8rem", cursor: 'pointer' }} key={i} onClick={() => handleOptionClickParty(option?.clientName)}>
                                                                {option?.clientName}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="mt-2">No match found</div>
                                                    )
                                                ) : (
                                                    <div className="mt-2">Loading . . . . </div>
                                                )
                                            }
                                        </div>
                                    </>
                                )}
                            </Col>

                            {/* <Col sm={12} md={6} lg={2} className='position-relative'>
                                <Input label="Organization Office" name="orgOffice" onChange={handleInputChangeOffice} value={selectedOffice} onClick={() => setIsOpenOffice(true)} placeholder="Organization Office" autocomplete="off" />
                                {isOpenOffice && (
                                    <>
                                        <div style={{ maxHeight: "15rem", position: 'absolute', top: '4.5rem', width: '90%', zIndex: '999', border: "black", background: 'white', overflowY: "scroll" }} className="border px-3 py-2 border-2 d-flex flex-column">
                                            {
                                                allOffices.length > 0 ? (
                                                    filteredOfficeOptions.length > 0 ? (
                                                        filteredOfficeOptions.map((option, i) => (
                                                            <div className='mt-2' style={{ fontSize: "0.8rem", cursor: 'pointer' }} key={i} onClick={() => handleOptionClickOffice(option)}>
                                                                {option}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="mt-2">No match found</div>
                                                    )
                                                ) : (
                                                    <div className="mt-2">Loading . . . . </div>
                                                )
                                            }
                                        </div>
                                    </>
                                )}
                            </Col> */}

                            <Col sm={12} md={6} lg={2} className='position-relative'>
                                <Input label="Vehicle" name="vehicleNo" onChange={handleInputChangeVehicle} value={selectedVehicleNo} onClick={() => setIsOpenVehicle(true)} placeholder="Vehicle No." autocomplete="off" />
                                {isOpenVehicle && (
                                    <>
                                        <div style={{ maxHeight: "15rem", position: 'absolute', top: '4.5rem', width: '90%', zIndex: '999', border: "black", background: 'white', overflowY: "scroll" }} className="border px-3 py-2 border-2 d-flex flex-column">
                                            {
                                                vehiclesList.length > 0 ? (
                                                    filteredVehicleOptions.length > 0 ? (
                                                        filteredVehicleOptions.map((option, i) => (
                                                            <div className={`${selectedVehicleNo === option?.vehicleNo ? 'bg-thm-dark thm-white' : 'bg-thm-white text-dark'}`} style={{ fontSize: "0.8rem", cursor: 'pointer' }} key={i} onClick={() => handleOptionClickVehicle(option?.vehicleNo)}>
                                                                {option?.vehicleNo}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="mt-2">No match found</div>
                                                    )
                                                ) : (
                                                    <div className="mt-2">Loading . . . . </div>
                                                )
                                            }
                                        </div>
                                    </>
                                )}
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

export default VehicleTrackDash
