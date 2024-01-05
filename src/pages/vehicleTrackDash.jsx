import React, { useEffect, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import Button from '../components/Button/coloredButton'
import HoveredButton from '../components/Button/hoveredButton';
import { CiFilter } from "react-icons/ci";
import { getAllPartiesList } from '../hooks/clientMasterHooks';
import { getAllOfficesList } from '../hooks/officeMasterHooks';
import { ErrorToast, WarningToast } from '../components/toast/toast';
import Input from '../components/form/Input';
import { getRunningTrips } from '../hooks/tripsHooks';
import { getAllVehiclesList } from '../hooks/vehicleMasterHooks';

const VehicleTrackDash = () => {

    const [form, setForm] = useState({});
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [allOffices, setAllOffices] = useState([]);
    const [partiesList, setPartiesList] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [selectedDate, setSelectedDate] = useState('custom');
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

    const [allSelectedFilters, setAllSelectedFilters] = useState([]);

    // const allOffices = ["Office 1", 'Office 2', "Office 3", "Office 4", "Office 5", "Office 6", "Office 7"];

    const tableColumns = ['Vehicle No.', 'Trip No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Consignor Name', 'Origin', 'Destination', 'Static ETA',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Report Unloading', 'Unloading End Date', 'GPS Location Time', 'Location', 'Estimated Arrival Date',
        'Final Status', 'Driver Name', 'Driver Mobile No.', 'GPS Exit Vehicle No.', 'Exit From', 'Trip Status', 'Force Complete'
    ];

    const allFilters = ['Trip Running', 'Trip Completed', 'Delayed', 'Early', 'On Time', 'Critical Delay'];

    useEffect(() => {
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

    // console.log("vehicles", vehiclesList.map((data) => console.log(data?.vehicleNo)));

    // useEffect(() => {
    //     getAllOfficesList().then((response) => {
    //         (response.status === 200) ? setofficesList(response?.data) : setofficesList([]);
    //     }).catch(() => setofficesList([]));
    // }, []);


    const handleInputChangeParty = (e) => {
        setSelectedParty(e.target.value);

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
        const filteredTrips = allTrips.filter(test => {
            for (const key in form) {
                const testValue = String(test[key]).toLowerCase();  // Convert test value to lowercase
                const formValue = form[key].toLowerCase();  // Convert form value to lowercase

                if (testValue !== formValue && formValue.length > 0) {
                    return false;
                }
            }
            return true;
        });

        setFilteredTrips(filteredTrips);
    };

    // const handleSelectFilter = (filter) => {
    //     setSelectedFilter(filter);
    //     setShowFilters(false);

    //     if (filter === 'Trip Running') {
    //         const filteredData = allTrips.filter(data => data?.tripStatus === 'Trip Running');
    //         setFilteredTrips(filteredData);
    //     } else if (filter == 'Trip Completed') {
    //         const filteredData = allTrips.filter(data => data?.tripStatus === 'Trip Completed');
    //         setFilteredTrips(filteredData);
    //     } else if (filter === 'Delayed') {
    //         const filteredDdelayedData = allTrips.filter(data => data?.finalStatus === 'Delayed');
    //         filteredDdelayedData.map((data) => {
    //             const staticETA = parseDate(data?.staticETA);
    //             const estimatedArrivalDate = parseDate(data?.estimatedArrivalDate);

    //             if (staticETA && estimatedArrivalDate) {
    //                 const criticalDelayedTrips = filteredDdelayedData.filter((data) => Math.floor((parseDate(data?.estimatedArrivalDate) - parseDate(data?.staticETA)) / (1000 * 60 * 60 * 24)) <= 2)
    //                 setFilteredTrips(criticalDelayedTrips);
    //             }
    //         })
    //     } else if (filter === 'Critical Delay') {
    //         const filteredDdelayedData = allTrips.filter(data => data?.finalStatus === 'Delayed');
    //         filteredDdelayedData.map((data) => {
    //             const staticETA = parseDate(data?.staticETA);
    //             const estimatedArrivalDate = parseDate(data?.estimatedArrivalDate);

    //             if (staticETA && estimatedArrivalDate) {
    //                 const criticalDelayedTrips = filteredDdelayedData.filter((data) => Math.floor((parseDate(data?.estimatedArrivalDate) - parseDate(data?.staticETA)) / (1000 * 60 * 60 * 24)) > 2)
    //                 setFilteredTrips(criticalDelayedTrips);
    //             }
    //         })
    //     } else if (filter === 'Early') {
    //         const filteredData = allTrips.filter(data => data?.finalStatus === 'Early');
    //         setFilteredTrips(filteredData);
    //     } else if (filter === 'On Time') {
    //         const filteredData = allTrips.filter(data => data?.finalStatus === 'On Time');
    //         setFilteredTrips(filteredData);
    //     } else if ("All") {
    //         setFilteredTrips(allTrips);
    //         setSelectedFilter('');
    //         setForm({
    //             tripLogNo: ''
    //         });
    //         setSelectedParty('');
    //         setSelectedOffice('');
    //         setSelectedVehicleNo('');
    //     }
    // };

    // const handleSelectFilter = (filter) => {
    //     if (filter === 'All') {

    //         setFilteredTrips(allTrips);
    //         setSelectedFilter('');
    //         setForm({
    //             tripLogNo: ''
    //         });
    //         setSelectedParty('');
    //         setSelectedOffice('');
    //         setSelectedVehicleNo('');
    //     } else {
    //         if (filter === 'Trip Running' || filter === 'Trip Completed') {
    //             setForm({
    //                 ...form,
    //                 tripStatus: filter
    //             })
    //         } else if (filter === 'Eearly' || filter === 'On Time') {
    //             setForm({
    //                 ...form,
    //                 finalStatus: filter
    //             })
    //         }
    //         else if (filter === 'Delayed') {

    //             const filtered = allTrips.filter(test => {
    //                 for (const key in form) {
    //                     console.log("key", form[key]);
    //                     if (test[key] !== form[key] && form[key].length > 0) {
    //                         return false;
    //                     }
    //                 }
    //                 return true;
    //             });

    //             console.log("filteredTips", filtered);
    //         }

    //         setSelectedFilter(filter)
    //     }
    //     setShowFilters(false);
    // }

    var newArr = [];
    // var newTripsArr = [];
    const [newTripsArr, setNewTrpsArr] = useState([]);

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
            setSelectedFilter([...selectedFilter, filter]);
            newArr.push(filter);

            const filteredData = allTrips.filter(data => newArr.includes(data?.tripStatus));
            setNewTrpsArr(...newTripsArr, filteredData);
            // newTripsArr.push(filteredData);
            // console.log("filtered", newTripsArr);
            // newArr.push(filteredData);
            // if(newArr.includes())
        }
    }

    console.log("selected filters", newTripsArr);

    const handleShowForceComplete = (data) => {
        const loadingDateTime = data?.loadingDateTime;
        const unLoadingDateTime = data?.unloadingEndDate;

        if (data?.tripStatus === 'Trip Running') {
            setSelectedVehicle(data);
            setShowForceCompleteModal(true);
        } else if (data?.tripStatus.length === 0) {
            ErrorToast("Enter Trip");
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

    const handleFormatDate = (date) => {
        const originalDate = new Date(date);

        const day = originalDate.getDate();
        const month = originalDate.getMonth() + 1;
        const year = originalDate.getFullYear();
        const hours = originalDate.getHours();
        const minutes = originalDate.getMinutes();
        const seconds = originalDate.getSeconds();

        const amPM = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        const formattedDate = `${day}/${month}/${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${amPM}`;

        return formattedDate;
    }

    return (
        <div className='mt-5 my-3 px-5 pt-2 pb-5 bg-white rounded dashboard-main-container' onClick={() => handleShowOptions()}>
            <div className='w-100'>
                <h4 className='text-primary text-uppercase w-100 text-center my-5'>Vehicle Tracking Dashboard</h4>
                <div className='mt-2'>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col sm={12} md={6} lg={2} className='position-relative'>
                                <Input label="Party" name="consignorName" onChange={handleInputChangeParty} value={selectedParty} onClick={() => setIsOpenParty(true)} placeholder="Party Name" autocomplete="off" />
                                {isOpenParty && (
                                    <>
                                        <div style={{ maxHeight: "15rem", position: 'absolute', top: '4.5rem', width: '90%', zIndex: '999', border: "black", background: 'white', overflowY: "scroll" }} className="border px-3 py-2 border-2 d-flex flex-column">
                                            {
                                                partiesList.length > 0 ? (
                                                    filteredPartyOptions.length > 0 ? (
                                                        filteredPartyOptions.map((option, i) => (
                                                            <div className='mt-2' style={{ fontSize: "0.8rem", cursor: 'pointer' }} key={i} onClick={() => handleOptionClickParty(option?.clientName)}>
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
                                                            <div className='mt-2' style={{ fontSize: "0.8rem", cursor: 'pointer' }} key={i} onClick={() => handleOptionClickVehicle(option?.vehicleNo)}>
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
                                <div className='border border-secondary rounded p-2 cursor-pointer d-flex justify-content-between align-items-center'
                                    onMouseOver={() => setHovered(true)}
                                    onMouseOut={() => setHovered(false)}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <span className='' style={{ width: "8rem", fontSize: "0.8rem" }}>
                                        {selectedFilter.length === 0 ? 'Filter' : selectedFilter}
                                    </span>
                                    <CiFilter />
                                </div>
                                {
                                    showFilters ? (
                                        <div className='position-absolute bg-white px-0 d-flex justify-content-start align-items-center flex-column' style={{ top: 70, zIndex: "1", boxShadow: "0px 0px 10px 0px #c8c9ca" }}>
                                            {
                                                allFilters.map((data, index) => (
                                                    <span className={` py-2 ps-3 pe-5 w-100 ${selectedFilter === data ? 'filter-options-active' : 'filter-options'} ${index !== allFilters.length - 1 && 'border-bottom'} cursor-pointer`}
                                                        onMouseOver={() => setHovered(true)}
                                                        onMouseOut={() => setHovered(false)}
                                                        key={index}
                                                        onClick={() => handleSelectFilter(data)}
                                                    >{data}</span>
                                                ))
                                            }
                                        </div>
                                    ) : null
                                }
                            </Col>
                        </Row>
                    </Form>
                </div>

                <hr />

                <div className='table-responsive mt-5' style={{ height: "55vh" }}>
                    <table className='table table-bordered table-striped w-100 positon-relative' style={{ overflowY: "scroll", overflowX: 'auto' }}>
                        <thead className='table-head bg-primary text-white' style={{ position: "static" }}>
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
                            {filteredTrips.length > 0 && filteredTrips.map((data, index) => (
                                <tr key={index}>
                                    <td>{data?.vehicleNo}</td>
                                    <td>{data?.tripLogNo}</td>
                                    <td>{data?.loadingDate}</td>
                                    <td>{handleFormatDate(data?.vehicleExitDate)}</td>
                                    <td>{data?.consignorName}</td>
                                    <td>{data?.origin}</td>
                                    <td>{data?.destination}</td>
                                    <td>{data?.staticETA}</td>
                                    <td>{data?.routeKM}</td>
                                    <td>{Math.floor(data?.runningKMs) > 0 ? Math.floor(data?.runningKMs) : ''}</td>
                                    <td>{Math.floor(data?.kmDifference) > 0 ? Math.floor(data?.kmDifference) : ''}</td>
                                    <td>{data?.tripStatus !== 'Trip Running' ? handleFormatDate(data?.unloadingDate) : ''}</td>
                                    <td>{data?.tripStatus !== 'Trip Running' ? handleFormatDate(data?.unloadingReachDate) : ''}</td>
                                    <td>{handleFormatDate(data?.locationTime)}</td>
                                    <td>{data?.location}</td>
                                    <td>{data?.estimatedArrivalDate}</td>
                                    <td className={`${getFinalStatus(data) === 'Delayed' ? 'fw-bold text-warning' : getFinalStatus(data) === "Critical Delayed" && "fw-bold text-danger"}`}>{getFinalStatus(data)}</td>
                                    <td>{data?.driverName}</td>
                                    <td>{data?.driverMobileNo}</td>
                                    <td>{data?.gpsExitVehicleNo}</td>
                                    <td>{data?.exitFrom}</td>
                                    <td>{data?.tripStatus}</td>
                                    <td className='h-100 d-flex justify-content-center align-items-center'>
                                        <button className={`border border-none ${data?.tripStatus === 'Trip Running' ? 'force-complete-button' : 'force-complete-button-disabled'}`}
                                            onClick={() => handleShowForceComplete(data)}>Force Complete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {
                        filteredTrips.length === 0 ? (
                            <div className='pb-3 text-secondary d-flex justify-content-center align-items-center'>No data found</div>
                        ) : null
                    }
                </div>

                <Modal show={showForceCompleteModal} centered onHide={() => setShowForceCompleteModal(false)} size='lg'>
                    <Form>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <h5 className='text-primary'>Force Complete</h5>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <Row className='mb-3'>
                                    <Col sm={12} md={12} lg={4}>
                                        <Form.Group>
                                            <Form.Label>Vehicle No.</Form.Label>
                                            <Form.Control placeholder='Vehicle No.' required />
                                        </Form.Group>
                                    </Col>
                                    <Col sm={12} md={12} lg={4}>
                                        <Form.Group>
                                            <Form.Label>Trip No.</Form.Label>
                                            <Form.Control placeholder='Trip No.' required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr />

                                <Row className='mt-3'>
                                    <Col sm={12} md={12} lg={4}>
                                        <Form.Group>
                                            <Form.Check name='date' className='d-inline cursor-pointer mt-2 me-2' checked={selectedDate === 'custom'} onChange={() => setSelectedDate('custom')} type='radio' required />
                                            <Form.Label className='cursor-pointer' onClick={() => setSelectedDate('custom')}>Custom</Form.Label>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={12} md={12} lg={4}>
                                        <Form.Group>
                                            <Form.Check name='date' className='d-inline cursor-pointer mt-2 me-2' checked={selectedDate === 'current'} onChange={() => setSelectedDate('current')} type='radio' required />
                                            <Form.Label className='cursor-pointer' onClick={() => setSelectedDate('current')}>Current</Form.Label>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className='mt-3'>
                                    <Col sm={12} md={12} lg={4}>
                                        <Form.Group>
                                            <Form.Label>Loading Date Time</Form.Label>
                                            <Form.Control type='datetime-local' placeholder='DD/MM/YYYY' required />
                                        </Form.Group>
                                    </Col>
                                    <Col sm={12} md={12} lg={4}>
                                        <Form.Group>
                                            <Form.Label>Unloading Date Time</Form.Label>
                                            <Form.Control type='datetime-local' placeholder='DD/MM/YYYY' required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className='d-flex justify-content-end align-items-end'>
                            <Button type="submit" className="px-3">Save</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
        </div>
    )
}

export default VehicleTrackDash
