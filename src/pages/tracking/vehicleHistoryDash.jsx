import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Card from '../../components/Card/card'
import { Form, Row, Col } from 'react-bootstrap'
import { Input } from '../../components/form/Input';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { getAllPartiesList } from '../../hooks/clientMasterHooks';
import { getAllVehiclesList } from '../../hooks/vehicleMasterHooks';
import { ErrorToast } from '../../components/toast/toast';
import { Link } from 'react-router-dom';
import { FaRoute } from 'react-icons/fa';
// MUI

import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs'
import { getUnloadingReport } from '../../hooks/reportHooks';
import Pagination from '../../components/pagination';
import Button from '../../components/Button/coloredButton';
import HoveredButton from '../../components/Button/hoveredButton';
import Loader from '../../components/loader/loader';
import HistoryModal from './historyModal';

const useStyles = makeStyles({
    input: {
        '& input': {
            padding: '0.3rem !important',
        },
        overflow: 'hidden',
        padding: '0',
    },
});

const VehicleHistoryDash = () => {
    const classes = useStyles();

    const [form, setForm] = useState({});
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [partiesList, setPartiesList] = useState([]);
    const [originsList, setOriginsList] = useState([]);
    const [destinationList, setDestinationList] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);

    const [selectedParty, setSelectedParty] = useState('');
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [selectedVehicleNo, setSelectedVehicleNo] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [vehicleNo, setVehicleNo] = useState('');

    const [selectedVehicle, setSelectedVehicle] = useState({})
    const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
    const [showForce, setShowForce] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState('');
    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [showRoute, setShowRoute] = useState(false);

    const initialColumns = [
        { label: 'S.No.', value: 'tripCount', hidden: false },
        { label: 'Vehicle No.', value: 'vehicleNo', hidden: false },
        { label: 'Trip No.', value: 'tripLogNo', hidden: false },
        { label: 'Loading Date ', value: 'loadingDate', hidden: false },
        { label: 'Vehicle Exit Date', value: 'vehicleExitDate', hidden: false },
        { label: 'Consignor Name', value: 'consignorName', hidden: false },
        { label: 'Origin', value: 'origin', hidden: false },
        { label: 'Destination', value: 'destination', hidden: false },
        { label: 'Static ETA (PAPL)', value: 'staticETA', hidden: false },
        { label: 'Static ETA (OEM)', value: "oemReachTime", hidden: false },
        { label: 'Route (KM)', value: 'routeKM', hidden: false },
        { label: 'KM Covered', value: 'runningKMs', hidden: false },
        { label: 'Difference (Km)', value: 'kmDifference', hidden: false },
        { label: 'Last 10 hrs KM', value: 'last10HoursKms', hidden: false },
        { label: 'Report Unloading', value: 'unloadingReachDate', hidden: false },
        { label: 'Unloading End Date', value: 'unloadingDate', hidden: false },
        { label: 'Estimated Arrival Date', value: 'estimatedArrivalDate', hidden: false },
        { label: 'Final Status', value: 'finalStatus', hidden: false },
        { label: 'OEM Status', value: 'oemFinalStatus', hidden: false },
        { label: 'Delayed Hours', value: 'delayedHours', hidden: false },
        { label: 'Driver Name', value: 'driverName', hidden: false },
        { label: 'Driver Mobile No.', value: 'driverMobileNo', hidden: false },
        { label: 'Exit From', value: 'exitFrom', hidden: false },
        { label: 'Trip Status', value: 'tripStatus', hidden: false },
        { label: 'Track History', value: 'trackHistory', hidden: false },
        { label: 'Force Complete', value: 'forcecomplete', hidden: false }
    ];

    const [tableColumns, setTableColumns] = useState(initialColumns);

    const itemsPerPage = 20;
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    let currentTrips = filteredTrips.slice(indexOfFirstPost, indexOfLastPost);
    const pageCount = Math.ceil(filteredTrips.length / itemsPerPage);


    const getAllTrips = () => {
        getRunningTrips().then((response) => {
            if (response.status === 200) {
                const allData = response?.data;

                let allDestinations = [];
                let finalDestinationsList = [];

                allData.forEach(data => (data?.destination !== null && data?.destination !== '') && allDestinations.push(data?.destination));

                const repeatedDestinations = allDestinations.filter((data, index) => allDestinations.indexOf(data) !== index);

                [...new Set(repeatedDestinations)].forEach(data => {
                    finalDestinationsList.push({
                        label: data,
                        value: data
                    })
                })

                setDestinationList(finalDestinationsList);

                setAllTrips(allData);
            } else {
                setAllTrips([]);
            }
        }).catch((err) => {
            console.log(err);
            setAllTrips([]);
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

        setOriginsList(desiredOriginArray);
    }, [allTrips]);

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

    const handleChangeStartdate = (dateTime) => {
        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;
        const hours = dateTime?.$H < 10 ? `0${dateTime?.$H}` : dateTime?.$H;
        const minute = dateTime?.$m < 10 ? `0${dateTime?.$m}` : dateTime?.$m;
        const seconds = dateTime?.$s < 10 ? `0${dateTime?.$s}` : dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setStartDate(formattedDate);

        // setForm({
        //     ...form,
        //     applicationDate: formattedDate
        // });
    };

    const handleChangeEnddate = (dateTime) => {
        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;
        const hours = dateTime?.$H < 10 ? `0${dateTime?.$H}` : dateTime?.$H;
        const minute = dateTime?.$m < 10 ? `0${dateTime?.$m}` : dateTime?.$m;
        const seconds = dateTime?.$s < 10 ? `0${dateTime?.$s}` : dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setEndDate(formattedDate);

        // setForm({
        //     ...form,
        //     applicationDate: formattedDate
        // });
    };

    const handleShowLocation = (data) => {
        setCurrentVehicle(data?.vehicleNo)
        setShowLocationOption(true);
    };

    const handleChangeOrigin = (selectedValue) => {
        if (startDate !== "" && endDate !== "") {
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
        } else {
            if (startDate === "") {
                ErrorToast("Select From date first");
            }
            if (endDate === "") {
                ErrorToast("Select End date first");
            }
        }
    };

    const handleChangeDestination = (selectedValue) => {
        if (startDate !== "" && endDate !== "") {
            setSelectedDestination(selectedValue);

            if (selectedValue === null) {
                setForm({
                    ...form,
                    destination: ''
                });
            } else {
                setForm({
                    ...form,
                    destination: selectedValue?.value
                });
            }
        } else {
            if (startDate === "") {
                ErrorToast("Select From date first");
            }
            if (endDate === "") {
                ErrorToast("Select End date first");
            }
        }
    };

    const handleChangeParty = (selectedValue) => {
        if (startDate !== "" && endDate !== "") {
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
        } else {
            if (startDate === "") {
                ErrorToast("Select From date first");
            }
            if (endDate === "") {
                ErrorToast("Select End date first");
            }
        }
    };

    const handleChangeVehicle = (selectedValue) => {
        if (startDate !== "" && endDate !== "") {
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
        } else {
            if (startDate === "") {
                ErrorToast("Select From date first");
            }
            if (endDate === "") {
                ErrorToast("Select End date first");
            }
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
        // menu: provided => ({...provided, zIndex: 9999})
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const selectformFields = [
        {
            label: "Party",
            options: partiesList,
            value: selectedParty,
            onChange: handleChangeParty
        },
        {
            label: "Origin",
            options: originsList,
            value: selectedOrigin,
            onChange: handleChangeOrigin
        },
        {
            label: "Destination",
            options: destinationList,
            value: selectedDestination,
            onChange: handleChangeDestination
        },
        {
            label: "Vehicle",
            options: vehiclesList,
            value: selectedVehicleNo,
            onChange: handleChangeVehicle
        },
    ];


    const handleShowForceComplete = (data) => {
        if (data?.tripStatus === 'Trip Running' && data?.operationUniqueID.length > 0) {
            setSelectedVehicle(data);
            setShowForceCompleteModal(true);
            setShowForce(true);
        } else if (data?.tripStatus.length === 0 || data?.operationUniqueID.length === 0) {
            ErrorToast("Not Trip found");
        } else if (data?.tripStatus === 'Trip Completed') {
            ErrorToast("Trip already completed");
        }
    };


    const showDelayedIcon = (data, index, colIndex) => {
        // if (selectedFilter.includes('On Time & Early (As per OEM)') || selectedFilter.includes('Delayed (As per OEM)')) {
        //     if (data?.oemFinalStatus === 'Delayed') {
        //         if (data?.oemDelayedHours !== null && (data?.oemDelayedHours !== undefined || data?.oemDelayedHours.length > 0)) {
        //             const oemDelayedHours = parseInt(data?.oemDelayedHours);
        //             if (oemDelayedHours >= 0 && oemDelayedHours <= 18) {
        //                 return <span className={`py-1 px-2 ${data?.tripStatus === 'Trip Running' ? 'warn-icon bg-secondary text-white' : 'text-dark'} rounded text-center`}
        //                     id={`${data?.tripStatus === 'Trip Running' ? 'warn-icon' : ''}`}
        //                     key={`${index}-${colIndex}-${animationKey}`}
        //                     style={{ minWidth: "100%" }}>Mild Delayed</span>
        //             } else if (oemDelayedHours >= 19 && oemDelayedHours <= 35) {
        //                 return <span className={`py-1 px-2 m-0 ${data?.tripStatus === 'Trip Running' ? 'warn-icon bg-warning text-dark' : 'text-dark'} rounded`}
        //                     id={`${data?.tripStatus === 'Trip Running' ? 'warn-icon' : ''}`}
        //                     key={`${index}-${colIndex}-${animationKey}`}
        //                     style={{ minWidth: "100%" }}>Moderate Delayed</span>
        //             } else if (oemDelayedHours >= 36) {
        //                 return <span className={`py-1 px-2 ${data?.tripStatus === 'Trip Running' ? 'warn-icon bg-danger text-white' : 'text-dark'} rounded text-center`}
        //                     id={`${data?.tripStatus === 'Trip Running' ? 'warn-icon' : ''}`}
        //                     key={`${index}-${colIndex}-${animationKey}`}
        //                     style={{ minWidth: "100%" }}>Critical Delayed</span>
        //             }
        //         } else {
        //             return '';
        //         }
        //     } else if (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early' || data?.oemFinalStatus === "") {
        //         return <span className='px-2 text-center w-100' style={{ fontWeight: '400' }}>{data?.oemFinalStatus}</span>
        //     }
        // } else {
        // }

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

    console.log("selected vehicle", selectedVehicleNo);

    const handleShowRoute = (data) => {
        if (data?.vehicleNo === "") {
            ErrorToast("Select Vehicle First")
        } else {
            setShowRoute(true);
            setVehicleNo(data?.vehicleNo);
        }
    }

    const handleTableColumns = (data, column, value, index, colIndex) => {
        if (column.label === 'Loading Date ' || column.label === "Estimated Arrival Date" || column.label === "Static ETA (OEM)" || column.label === "Static ETA (PAPL)") {
            return <td key={colIndex}>{handleFormateISTDate(value)}</td>;
        } else if (column?.label === "Vehicle Exit Date" || column?.label === "GPS (Date / Time)" || column?.label === "Estimated Arrival Date") {
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
                                            // localStorage.setItem('filters', JSON.stringify(selectedFilter));
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
        } else if (column?.label === 'OEM Status') {
            return <td key={colIndex}>{data?.oemFinalStatus}</td>
        } else if (column?.label === 'Delayed Hours') {
            return <td key={colIndex}>{getDelayedHours(value)}</td>
        } else if (column?.label === 'Force Complete') {
            return <td key={colIndex} className='h-100'>
                <div className='h-100 py-3 d-flex justify-content-center align-items-center'>
                    <button className={`border border-none ${((data?.tripStatus === 'Trip Running') && (data?.operationUniqueID.length > 0)) ? 'force-complete-button' : 'force-complete-button-disabled'}`}
                        onClick={() => handleShowForceComplete(data)}>Force Complete</button>
                </div>
            </td>
        } else if (column?.label === 'S.No.') {
            return <td key={colIndex} className='text-center fw-bold'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
        } else if (column?.label === 'Status') {
            return <td className='h-100 '>
                <div className='h-100 d-flex justify-content-center align-items-center'>
                    <div className={`circle ${data?.currVehicleStatus === "On Hold" ? 'circle-yellow-blink' : data?.currVehicleStatus === 'Running' ? 'circle-green-blink' : data?.currVehicleStatus === 'GPS Off' ? 'circle-red-blink' : data?.currVehicleStatus === null && 'bg-white'}`}></div>
                </div>
            </td>
        } else if (column?.label === 'Vehicle No.') {
            return <td key={colIndex} className='fw-bold'>{value}</td>;
        } else if (column?.label === 'Track History') {
            return <td key={colIndex} className='h-100 text-center'>
                <FaRoute className='fs-5 text-success cursor-pointer' onClick={() => handleShowRoute(data)} />
            </td>
        }
        else {
            return <td key={colIndex}>{value}</td>;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (startDate !== "" && endDate !== "") {
            setShowLoader(true);

            getUnloadingReport().then(response => {
                if (response.status === 200) {
                    const allTrips = response?.data;
                    const allFilteredTrips = allTrips.filter(test => {
                        for (const key in form) {
                            const testValue = String(test[key]).toLowerCase();
                            const formValue = form[key].toLowerCase();
                            if ((testValue !== formValue && formValue.length > 0)) {
                                return false;
                            }
                        }
                        return true;
                    });

                    const formatLoadingDate = (dateString) => {
                        const parts = dateString.split(/[\s/:]+/);
                        const day = parts[0];
                        const month = parts[1];
                        const year = parts[2];
                        const hours = parseInt(parts[3]) + (parts[5] === "PM" ? 12 : 0);
                        const minutes = parts[4];
                        const seconds = parts[5];

                        const formattedDate = `${year}-${month}-${day} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
                        return formattedDate;
                    };

                    const filtered = allFilteredTrips.filter(data => ((new Date(formatLoadingDate(data?.loadingDate)) >= new Date(startDate)) && (new Date(formatLoadingDate(data?.loadingDate)) <= new Date(endDate))))
                    setFilteredTrips(filtered);
                    setShowLoader(false);
                } else {
                    setFilteredTrips([]);
                    setShowLoader(false)
                }
            }).catch(err => {
                console.log(err);
                setFilteredTrips([]);
                setShowLoader(false);
            })
        } else {
            if (startDate === "") {
                ErrorToast("Select Start date first");
            }
            if (endDate === "") {
                ErrorToast("Select End date first");
            }
        }
    };


    return (
        <div>
            <div className='thm-dark m-0 p-0 p-5 pt-3 position-relative'>
                <Loader show={showLoader} />

                <Card>
                    <div className='w-100 d-flex justify-content-between align-items-center'>
                        <h5 className='m-0 p-0'>Vehicle History</h5>
                    </div>
                </Card>

                <Card>
                    <div>
                        <Form onSubmit={handleSubmit}>
                            <Row className='mb-3'>
                                <Col lg={3}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>From</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                            <DemoItem>
                                                <DateTimePicker
                                                    views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                                    format="DD/MM/YYYY HH:mm:ss"
                                                    ampm={false}
                                                    value={startDate}
                                                    onChange={handleChangeStartdate}
                                                    style={{ height: '10px' }}
                                                    className={classes.input}
                                                />
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Col>

                                <Col lg={3}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>To</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                            <DemoItem>
                                                <DateTimePicker
                                                    views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                                    format="DD/MM/YYYY HH:mm:ss"
                                                    ampm={false}
                                                    value={endDate}
                                                    onChange={handleChangeEnddate}
                                                    style={{ height: '10px' }}
                                                    className={classes.input}
                                                />
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Col>
                            </Row>
                            <Row className='dashoard-filter-form rounded'>
                                {
                                    selectformFields.map((data, index) => (
                                        <Col sm={12} md={6} lg={data?.label === 'Vehicle' ? 2 : 2} className='position-relative' key={index} style={{ zIndex: 3 }}>
                                            <Form.Label>{data?.label}</Form.Label>
                                            <Select
                                                options={data?.options}
                                                value={data?.value}
                                                onChange={data?.onChange}
                                                isClearable={true}
                                                styles={selectStyles}
                                                placeholder={`Search ${data?.label}`}
                                            />
                                        </Col>
                                    ))
                                }

                                <Col sm={12} md={6} lg={2}>
                                    <Input label="Trip No." type='text' name='tripLogNo' value={form.tripLogNo} onChange={handleChange} placeholder='Trip No.' autocomplete="off" />
                                </Col>

                                <Col sm={12} md={6} lg={1} className='pt-4'>
                                    <Button type="submit" className="px-3">Show</Button>
                                </Col>

                                {/* <Col sm={12} md={6} lg={3} className='border-right border-secondary pt-4 d-flex justify-content-start align-items-center'>
                                <Button type="button" className="px-3" onClick={() => realTimeDataFilter()}>Show</Button>
                                <HoveredButton type="button" className="px-3 ms-2"
                                    onClick={() => handleSelectFilter('All')}
                                >Show All</HoveredButton>
                                <div className='ms-3 position-relative w-45'>
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
                                </div>
                            </Col> */}

                                {/* <Col sm={12} md={6} lg={2} className='pt-4 d-flex justify-content-start align-items-center position-relative'>
                                </Col> */}
                            </Row>
                        </Form>
                    </div>

                    <div className='d-flex justify-content-start align-items-start mt-5'>
                        <span className='fw-bold'>Total Trips:</span>
                        <span className='ms-2'>{filteredTrips.length}</span>
                    </div>
                    <div className='table-responsive mt-2'>
                        <table className='table table-striped table-bordered w-100 position-relative' style={{ overflowY: "scroll", overflowX: 'auto' }}>
                            <thead className='table-head text-white' style={{ zIndex: 2, position: "sticky", top: 0 }}>
                                <tr style={{ borderRadius: "10px 0px 0px 10px" }}>
                                    {
                                        tableColumns.map((data, index) => (
                                            <>
                                                {
                                                    data?.hidden === false ? (
                                                        <th
                                                            className={`text-nowrap 
                                                            ${(data?.label === 'S.No.') && 'width-50'} ${(data?.label === 'Vehicle No.') && 'width-100'} ${(data?.label === 'Status') && 'width-50'} ${(data?.label === 'Trip No.') && 'width-60'} ${(data?.label === 'Trip Status') && 'width-120'} ${(data?.label === 'Exit From') && 'width-120'} ${(data?.label === 'Final Status') && 'width-150'} ${(data?.label === 'Driver Name' || data?.label === 'Static ETA') && 'width-200'} ${(data?.label === 'Location') && 'width-200'} ${(data?.label === 'Consignor Name') && 'width-140'}
                                                            ${(data?.label === 'KM Covered') && 'width-90'} ${(data?.label === 'Final Status') && 'width-50'} ${(data?.label === 'Driver Name') && 'width-100'}
                                                            `}
                                                            key={index}
                                                            style={{
                                                                borderRadius: index === 0 ? "10px 0px 0px 0px" : index === tableColumns.length - 1 && "0px 10px 0px 0px"
                                                            }}>
                                                            <div className='d-flex justify-content-between align-items-center cursor-pointer'
                                                            // onClick={() => handleSortData(data?.value)}
                                                            >
                                                                <span className='pe-3' style={{ width: data?.label === 'Vehicle No.' ? '70px' : (data?.label === 'Route (KM)' || data?.label === 'KM Covered') ? '70px' : data?.label === 'Driver Name' && '50px' }}>{data?.label}</span>
                                                                {/* {
                                                                (data?.value !== "") && (
                                                                    <FaSort />
                                                                )
                                                            } */}
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
                                    No data found
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
                </Card>
            </div>
            <HistoryModal show={showRoute} setShow={setShowRoute} vehicleNo={vehicleNo} startDate={startDate} endDate={endDate} />
        </div>
    )
}

export default VehicleHistoryDash
