import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select';
import Card from '../../components/Card/card'
import { Col, Form, Row } from 'react-bootstrap'
import { getAllVehiclesList, getVehicleRoute } from '../../hooks/vehicleMasterHooks';
import Button from '../../components/Button/coloredButton';
import { GoogleMap, InfoWindowF, LoadScript, MarkerF, PolylineF } from '@react-google-maps/api';
import { ErrorToast } from '../../components/toast/toast';
import { truck } from '../../assets/images';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';
import { DisabledButton } from '../../components/Button/Button';

// MUI

import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
    input: {
        '& input': {
            padding: '0.3rem !important',
        },
        overflow: 'hidden',
        padding: '0',
    },
});

const RouteReport = () => {
    const classes = useStyles();

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";
    let arrayLocation = useRef(0);
    const [angle, setAngle] = useState(180);

    const [vehicleList, setVehiclesList] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [form, setForm] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [routeData, setRouteData] = useState([]);
    const [stoppage, setStoppage] = useState([]);
    const [stoppageCoords, setStoppageCoords] = useState([]);
    const [routeCoords, setRouteCoords] = useState([]);
    const [center, setCenter] = useState({ lat: 26.858192, lng: 75.669163 });

    const [speedMarkerData, setSpeedMarkerData] = useState([]);
    const [overSpeedMarkers, setOverSpeedMarkers] = useState([]);
    const [timeMakers, setTimeMakrkers] = useState([]);

    const [includeSpeed, setIncludeSpeed] = useState(false);
    const [includeTime, setIncludeTime] = useState(false);

    const [selectedTimeMarker, setSelectedTimeMarker] = useState(null);
    const [timeMarkerDetails, setTimeMarkerDetails] = useState({});

    const [selectedSpeedMarker, setSelectedSpeedMarker] = useState(null);
    const [speedMarkerDetails, setSpeedMarkerDetails] = useState({});

    const [pause, setPause] = useState(true);
    const [nextCoordinates, setNextCoordinates] = useState({});
    const [currentCoordinates, setCurrentCoordinates] = useState({});
    const [currentCoordDetails, setCurrentCoordsDetails] = useState({});
    const [rangeValue, setRangeValue] = useState(0);
    const [playbackSpeed, setPlayBackSpeed] = useState(1000);

    const [speedCoords, setSpeedCoords] = useState([]);
    const [speedCoordData, setSpeedCoordData] = useState([]);

    const coveredCoordinates = routeData.slice(0, arrayLocation.current + 1)
    const coordinatesBeforeMarker = speedCoords.slice(0, arrayLocation.current + 1);
    const coordinatesAfterMarker = speedCoords.slice(arrayLocation.current);

    const [showLoader, setShowLoader] = useState(false)
    const [boundCenter, setBoundCenter] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);

    const loggedInUser = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        if (!loggedInUser) {
            localStorage.clear();
            navigate('/');
        }
    }, []);

    const calculateAngle = (lat1, lon1, lat2, lon2) => {
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        const brng = Math.atan2(y, x);
        const angle = (brng * 180) / Math.PI;
        setAngle(angle - 92.1);
    };

    useEffect(() => {

        const lat1 = currentCoordinates?.lat * Math.PI / 180;
        const lon1 = currentCoordinates?.lng * Math.PI / 180;
        const lat2 = nextCoordinates?.lat * Math.PI / 180;
        const lon2 = nextCoordinates?.lng * Math.PI / 180;

        calculateAngle(lat1, lon1, lat2, lon2);
    }, [currentCoordinates, nextCoordinates]);

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
        arrayLocation.current = rangeValue;
    }, [rangeValue]);

    useEffect(() => {
        let timeoutIds = [];
        setBoundCenter(false);

        const setNextCoordinate = (index) => {
            if (index < speedCoords.length) {
                setCurrentCoordinates(speedCoords[index]);
                index < speedCoords.length ? setNextCoordinates(speedCoords[index + 1]) : setNextCoordinates(speedCoords[0]);
                arrayLocation.current = index;
                timeoutIds.push(setTimeout(() => setNextCoordinate(index + 1), playbackSpeed));
            }
        };

        const setNextCoord = (index) => {
            if (index < speedCoordData.length) {
                setCurrentCoordsDetails(speedCoordData[index]);
                timeoutIds.push(setTimeout(() => setNextCoord(index + 1), playbackSpeed));
            }
        };

        if (pause === false) {
            timeoutIds = [];
            setNextCoord(arrayLocation.current);
            setNextCoordinate(arrayLocation.current);
        } else {
            timeoutIds.forEach(clearTimeout);
            if (speedCoords.length > 0 && currentCoordDetails.lat === undefined) {
                if (arrayLocation.current < speedCoords.length - 1) {
                    setNextCoordinates({ lat: speedCoords[arrayLocation.current + 1].lat, lng: speedCoords[arrayLocation.current + 1].lng });
                } else {
                    setNextCoordinates({ lat: speedCoords[0].lat, lng: speedCoords[0].lng });
                }
                setCurrentCoordinates({ lat: speedCoords[arrayLocation.current].lat, lng: speedCoords[arrayLocation.current].lng });
                setCurrentCoordsDetails(speedCoordData[arrayLocation.current]);
            }

            if (speedCoords.length > 0 && currentCoordDetails.lat !== undefined) {
                if (arrayLocation.current < speedCoords.length - 1) {
                    setNextCoordinates({ lat: speedCoords[arrayLocation.current + 1].lat, lng: speedCoords[arrayLocation.current + 1].lng });
                } else {
                    setNextCoordinates({ lat: speedCoords[0].lat, lng: speedCoords[0].lng });
                }
                setCurrentCoordinates({ lat: speedCoords[arrayLocation.current].lat, lng: speedCoords[arrayLocation.current].lng });
                setCurrentCoordsDetails(speedCoordData[arrayLocation.current]);
            }
        }

        return () => {
            timeoutIds.forEach(clearTimeout);
        };
    }, [pause, playbackSpeed, rangeValue, routeData]);

    const handleChangeVehicle = (selectedValue) => {
        setSelectedVehicle(selectedValue);

        if (selectedValue === null) {
            setForm({
                ...form,
                vehicle: ''
            });
        } else {
            setForm({
                ...form,
                vehicle: selectedValue?.value
            });
        }
    };

    const handleChangeRange = (e) => {
        setRangeValue(parseInt(e.target.value));
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


    const handleStartDateChange = (dateTime) => {
        setStartDate(dateTime);

        const day = dateTime?.$D;
        const month = dateTime?.$M + 1;
        const year = dateTime?.$y;
        const hours = dateTime?.$H;
        const minute = dateTime?.$m;
        const seconds = dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setForm({
            ...form,
            startDate: formattedDate
        });
    };

    const handleEndDateChange = (dateTime) => {
        setEndDate(dateTime);

        const day = dateTime?.$D;
        const month = dateTime?.$M + 1;
        const year = dateTime?.$y;
        const hours = dateTime?.$H;
        const minute = dateTime?.$m;
        const seconds = dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setForm({
            ...form,
            endDate: formattedDate
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setShowLoader(true);
        setBtnDisabled(true);

        const payload = [form?.vehicle, form?.startDate, form?.endDate];

        if (form?.vehicle) {
            getVehicleRoute(payload).then((response) => {
                if (response.status === 200) {
                    setBtnDisabled(false);
                    setShowLoader(false);

                    const allData = response?.data;
                    let coords = [];

                    setRouteCoords(coords);
                    setRouteData(response?.data);
                    const latitudesMap = new Map();
                    const repeatedLatitudes = [];

                    allData.map((data) => {
                        coords.push(
                            {
                                lat: parseFloat(data?.lat),
                                lng: parseFloat(data?.long)
                            }
                        )
                    });

                    allData.forEach(obj => {
                        if (!latitudesMap.has(obj.lat)) {
                            latitudesMap.set(obj.lat, { count: 1, arrival: obj.date, exit: obj.date });
                        } else {
                            const existingLatData = latitudesMap.get(obj.lat);
                            latitudesMap.set(obj.lat, {
                                id: obj?.id,
                                latLongDistance: obj?.latLongDistance,
                                vehicleNo: obj?.vehicleNo,
                                date: obj?.date,
                                speed: obj?.speed,
                                count: existingLatData.count + 1,
                                arrival: existingLatData.arrival,
                                exit: obj.date,
                                lng: obj.long
                            });
                        }
                    });

                    latitudesMap.forEach((value, key) => {
                        if (value.count > 1) {
                            repeatedLatitudes.push({
                                id: value?.id,
                                latLongDistance: value?.latLongDistance,
                                vehicleNo: value?.vehicleNo,
                                date: value?.date,
                                speed: value?.speed,
                                lat: key,
                                lng: value.lng,
                                arrival: value.arrival,
                                exit: value.exit
                            });
                        }
                    });


                    const testArr = allData.filter(item => (
                        parseFloat(item?.latLongDistance) > 0
                    ));

                    let testArrCoords = [];

                    testArr.map(data => {
                        testArrCoords.push({
                            lat: parseFloat(data?.lat),
                            lng: parseFloat(data?.long)
                        })
                    });
                    setSpeedCoords(testArrCoords);
                    setSpeedCoordData(testArr);

                    // Stop Time 

                    if (form?.time) {
                        if (includeTime && form?.time.length > 0) {
                            const latitudesMap = new Map();
                            const repeatedLatitudes = [];

                            let coords = [];

                            allData.forEach(obj => {
                                if (!latitudesMap.has(obj.lat)) {
                                    latitudesMap.set(obj.lat, { count: 1, arrival: obj.date, exit: obj.date });
                                } else {
                                    const existingLatData = latitudesMap.get(obj.lat);
                                    latitudesMap.set(obj.lat, {
                                        id: obj?.id,
                                        latLongDistance: obj?.latLongDistance,
                                        vehicleNo: obj?.vehicleNo,
                                        date: obj?.date,
                                        speed: obj?.speed,
                                        count: existingLatData.count + 1,
                                        arrival: existingLatData.arrival,
                                        exit: obj.date,
                                        lng: obj.long
                                    });
                                }
                            });

                            latitudesMap.forEach((value, key) => {
                                if (value.count > 1) {
                                    repeatedLatitudes.push({
                                        id: value?.id,
                                        latLongDistance: value?.latLongDistance,
                                        vehicleNo: value?.vehicleNo,
                                        date: value?.date,
                                        speed: value?.speed,
                                        lat: key,
                                        lng: value.lng,
                                        arrival: value.arrival,
                                        exit: value.exit
                                    });
                                }
                            });


                            const testArr = allData.filter(item => (
                                parseFloat(item?.latLongDistance) > 1
                            ));

                            let testArrCoords = [];

                            testArr.map(data => {
                                testArrCoords.push({
                                    lat: parseFloat(data?.lat),
                                    lng: parseFloat(data?.long)
                                })
                            });
                            setSpeedCoords(testArrCoords);
                            setSpeedCoordData(testArr);

                            const filteredTest = repeatedLatitudes.filter(item => {
                                const arrivalTime = new Date(item.arrival);
                                const exitTime = new Date(item.exit);
                                const timeDifferenceInMinutes = (exitTime - arrivalTime) / (1000 * 60); // Convert milliseconds to minutes
                                return timeDifferenceInMinutes > form?.time;
                            });

                            filteredTest.map(data => {
                                coords.push({
                                    lat: parseFloat(data?.lat),
                                    lng: parseFloat(data?.lng)
                                })
                            })

                            setStoppage(filteredTest);
                            setStoppageCoords(coords);
                        }
                    }

                    // Over Speed

                    if (form?.speed) {
                        if (includeSpeed && form?.speed.length >= 0) {
                            const overSpeeded = allData.filter(data => parseFloat(data?.speed) > form?.speed);
                            let coordinates = [];

                            overSpeeded.map((data) => {
                                coordinates.push({
                                    lat: parseFloat(data?.lat),
                                    lng: parseFloat(data?.long)
                                });
                            });

                            setSpeedMarkerData(overSpeeded);
                            setOverSpeedMarkers(coordinates);
                        }
                    }

                } else {
                    setRouteData([])
                };
            }).catch((err) => {
                setRouteData([]);
            })
        } else {
            ErrorToast("Select Vehicle")
        };
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
        menu: provided => ({ ...provided, zIndex: 9999 })
    };

    const mapContainerStyle = {
        width: '100%',
        // height: "60vh"
    };

    const getBounds = () => {
        const bounds = new window.google.maps.LatLngBounds();
        routeCoords.forEach((marker) => {
            bounds.extend(marker.position);
        });

        return bounds;
    };

    const handleCenter = () => {
        if (!boundCenter) {
            if (routeCoords.length > 0) {
                if (currentCoordinates.lat === undefined) {
                    return { lat: routeCoords[0].lat, lng: routeCoords[0].lng }
                } else {
                    if (currentCoordinates.lat === routeCoords[routeCoords.length - 1].lat) {
                        return { lat: routeCoords[routeCoords.length - 1].lat, lng: routeCoords[routeCoords.length - 1].lng }
                    } else {
                        return { lat: currentCoordinates.lat, lng: currentCoordinates.lng }
                    }
                }
            } else {
                return { lat: 26.858192, lng: 75.669163 }
            }
        }
    };

    const vehicleCenter = () => {
        if (speedCoords.length > 0) {
            if (currentCoordinates.lat === undefined) {
                return { lat: speedCoords[0].lat, lng: speedCoords[0].lng }
            } else {
                if (currentCoordinates.lat === speedCoords[speedCoords.length - 1].lat) {
                    return { lat: speedCoords[speedCoords.length - 1].lat, lng: routeCoords[routeCoords.length - 1].lng }
                } else {
                    return { lat: currentCoordinates.lat, lng: currentCoordinates.lng }
                }
            }
        } else {
            return { lat: 26.858192, lng: 75.669163 }
        }
    }

    const handleClickTimeMarker = (data, index) => {
        setSelectedTimeMarker(index);
        setTimeMarkerDetails(data);
        setBoundCenter(true);
    };

    const handleClickSpeedMarker = (data, index) => {
        setSelectedSpeedMarker(index);
        setSpeedMarkerDetails(data);
        setBoundCenter(true);
    };


    const handleGetCoveredDistance = () => {
        console.log("covered", coordinatesBeforeMarker);
        coveredCoordinates.map((data) => {
            console.log("km", data?.latLongDistance);
        });

        return (coveredCoordinates.reduce((prev, curr) => prev + parseFloat(curr.latLongDistance), 0)).toFixed(2)
    };

    const convertMarkerDateTime = (originalDateTime) => {
        const [datePart, timePart] = selectedTimeMarker === null ? '' : originalDateTime.split(' ');
        const [year, day, month] = selectedTimeMarker === null ? '' : datePart.split('-');

        const formattedDate = selectedTimeMarker === null ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = selectedTimeMarker === null ? '' : `${formattedDate} ${timePart}`;

        return selectedTimeMarker === null ? '' : formattedDateTime;
    };

    const convertSpeedMarkerDateTime = (originalDateTime) => {
        const [datePart, timePart] = selectedSpeedMarker === null ? '' : originalDateTime.split(' ');
        const [year, day, month] = selectedSpeedMarker === null ? '' : datePart.split('-');

        const formattedDate = selectedSpeedMarker === null ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = selectedSpeedMarker === null ? '' : `${formattedDate} ${timePart}`;

        return selectedSpeedMarker === null ? '' : formattedDateTime;
    };

    const convertCurrentDateTime = (originalDateTime) => {
        const [datePart, timePart] = currentCoordDetails?.date === undefined ? '' : originalDateTime.split(' ');
        const [year, day, month] = currentCoordDetails?.date === undefined ? '' : datePart.split('-');

        const formattedDate = currentCoordDetails?.date === undefined ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = currentCoordDetails?.date === undefined ? '' : `${formattedDate} ${timePart}`;

        return currentCoordDetails?.date === undefined ? '' : formattedDateTime;
    };

    const getTimeDifferece = (arrival, exit) => {
        const arrivalTime = new Date(arrival);
        const exitTime = new Date(exit);
        const timeDifferenceInMinutes = (exitTime - arrivalTime) / (1000 * 60); // Convert milliseconds to minutes

        const hours = timeDifferenceInMinutes < 60 ? Math.floor(timeDifferenceInMinutes) : parseFloat((Math.floor(timeDifferenceInMinutes) / 60).toFixed(2));

        // console.log("hours", hours, timeDifferenceInMinutes);

        const hourArr = Number.isInteger(hours) ? hours : hours.toString().split('.');
        const minutes = Number.isInteger(hours) ? 0 : parseInt((hourArr[1]));
        const finalHours = minutes > 60 ? parseInt(hourArr[0]) + 1 : parseInt(hourArr[0]);
        const timeDiffereceInHours = `${finalHours}:${minutes > 60 ? minutes - 60 : minutes === 60 ? '00' : minutes}`

        return `${Number.isInteger(hours) ? `${timeDifferenceInMinutes < 60 ? `00:${hours}` : `${hours}:00`}` : timeDiffereceInHours} ${timeDiffereceInHours < 60 ? 'mins' : 'hrs'}`;

    }

    return (
        <div className='thm-dark m-0 p-0 p-5 pt-3'>
            <Card>
                <div className='w-100 d-flex justify-content-between align-items-center'>
                    <h5 className='m-0 p-0'>Route Report</h5>
                </div>
            </Card>

            <Card>
                <Row>
                    <Col sm={12} md={12} lg={4} style={{ borderRight: '1px solid #000' }}>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className='mb-2'>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className='fw-400 thm-dark'>Select Vehicle</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Select
                                            options={vehicleList}
                                            value={selectedVehicle}
                                            onChange={handleChangeVehicle}
                                            isClearable={true}
                                            styles={selectStyles}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className='fw-400 thm-dark'>Start Date</Form.Label>
                                    </Col>
                                    <Col>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                                <DemoItem>
                                                    <DateTimePicker
                                                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                                        format="DD/MM/YYYY HH:mm:ss"
                                                        ampm={false}
                                                        value={startDate}
                                                        onChange={handleStartDateChange}
                                                        // style={{ height: '10px' }}
                                                        className={classes.input}
                                                    />
                                                </DemoItem>
                                            </DemoContainer>
                                        </LocalizationProvider>
                                        {/* <Form.Control type='text' name="startDate" onChange={handleChange} className='inputfield p-1' placeholder='DD/MM/YYYY HH:MM:SS' required /> */}
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group className='my-2'>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className='fw-400 thm-dark'>End Date</Form.Label>
                                    </Col>
                                    <Col className='mt-0 pt-0'>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                                <DemoItem>
                                                    <DateTimePicker
                                                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                                        format="DD/MM/YYYY HH:mm:ss"
                                                        ampm={false}
                                                        value={endDate}
                                                        onChange={handleEndDateChange}
                                                        className={classes.input}
                                                    />
                                                </DemoItem>
                                            </DemoContainer>
                                        </LocalizationProvider>

                                        {/* <Form.Control type='text' name="endDate" onChange={handleChange} className='inputfield p-1' placeholder='DD/MM/YYYY HH:MM:SS' required /> */}
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group>
                                <Row>
                                    <Col sm={4} className='d-flex jusfity-content-start align-items-center'>
                                        <Form.Check name='speedLimit' onChange={() => setIncludeSpeed(!includeSpeed)} checked={includeSpeed} />
                                        <Form.Label className='ps-2 mt-1'>Speed Limit</Form.Label>
                                    </Col>
                                    <Col sm className='d-flex jusfity-content-start align-items-center'>
                                        <Form.Control type='number' name="speed" onChange={handleChange} className='inputfield p-1' placeholder='Speed' />
                                        <span className='ms-3'>(KM/H)</span>
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group className='mt-2'>
                                <Row>
                                    <Col sm={4} className='d-flex jusfity-content-start align-items-center'>
                                        <Form.Check name='timeLimit' onChange={() => setIncludeTime(!includeTime)} checked={includeTime} />
                                        <Form.Label className='ps-2 mt-1'>Stop Time</Form.Label>
                                    </Col>
                                    <Col sm className='d-flex jusfity-content-start align-items-center'>
                                        <Form.Control type='number' name="time" onChange={handleChange} className='inputfield p-1' placeholder='Time' />
                                        <span className='ms-4'>(Min)</span>
                                    </Col>
                                </Row>
                            </Form.Group>

                            <div className='d-flex justify-content-center align-items-center mt-5'>
                                {
                                    btnDisabled ? (
                                        <DisabledButton className="px-4">View</DisabledButton>
                                    ) : (
                                        <Button className="px-4">View</Button>
                                    )
                                }

                            </div>
                        </Form>
                    </Col>
                    <Col sm={12} md={12} lg={8}>
                        <div className='w-100 position-relative'>
                            <div>
                                <LoadScript googleMapsApiKey={key}>
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        onLoad={(map) => {
                                            const bounds = boundCenter && getBounds();
                                            boundCenter && map.fitBounds(bounds);

                                            boundCenter && setCenter(map.getCenter());
                                        }}
                                        center={handleCenter()}
                                        zoom={11}
                                        options={{ gestureHandling: 'greedy' }}
                                        mapContainerClassName='side-map-container'
                                    >
                                        {/* Route History */}

                                        {
                                            coordinatesAfterMarker.length > 0 && (
                                                <PolylineF
                                                    path={coordinatesBeforeMarker}
                                                    options={{
                                                        strokeColor: '#000',
                                                        strokeOpacity: 1.0,
                                                        strokeWeight: 2
                                                    }}
                                                />
                                            )
                                        }

                                        {
                                            coordinatesAfterMarker.length > 0 && (
                                                <PolylineF
                                                    path={coordinatesAfterMarker}
                                                    options={{
                                                        strokeColor: '#f75f54',
                                                        strokeOpacity: 1.0,
                                                        strokeWeight: 2
                                                    }}
                                                />
                                            )
                                        }

                                        {
                                            speedCoords.length > 0 && (
                                                <div className='marker-container'>
                                                    <MarkerF
                                                        key={angle}
                                                        icon={{
                                                            path: "M 0,-4 L 8,0 L 0,4 L 2,0 Z",
                                                            scale: 2,
                                                            rotation: angle
                                                        }}
                                                        position={vehicleCenter()}
                                                        className='marker-container'
                                                    />
                                                </div>
                                            )
                                        }

                                        {/* Stopage marker */}
                                        {
                                            includeSpeed ? (
                                                <>
                                                    {
                                                        speedMarkerData.length > 0 && speedMarkerData.map((data, index) => (
                                                            <MarkerF
                                                                icon={{
                                                                    url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F7F719"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
                                                                    scaledSize: new window.google.maps.Size(40, 40),
                                                                    fillColor: "#ffff00",
                                                                    fillOpacity: 1,
                                                                }}
                                                                label={`${index + 1}`}
                                                                position={{ lat: parseFloat(data?.lat), lng: parseFloat(data?.long) }}
                                                                onClick={() => handleClickSpeedMarker(data, index)}
                                                            />

                                                        ))
                                                    }
                                                </>
                                            ) : null
                                        }

                                        {/* Time marker */}

                                        {
                                            includeTime ? (
                                                <>
                                                    {
                                                        stoppage.length > 0 && stoppage.map((data, index) => (
                                                            <MarkerF
                                                                label={`${index + 1}`}
                                                                position={{ lat: parseFloat(data?.lat), lng: parseFloat(data?.lng) }}
                                                                onClick={() => handleClickTimeMarker(data, index)}
                                                            />

                                                        ))
                                                    }
                                                </>
                                            ) : null
                                        }

                                        {
                                            routeData?.length > 0 && (
                                                <MarkerF
                                                    label="Start"
                                                    position={{ lat: routeCoords[0]?.lat, lng: routeCoords[0]?.lng }}
                                                />

                                            )
                                        }


                                        {
                                            routeData?.length > 1 && (
                                                <MarkerF
                                                    label="End"
                                                    position={{ lat: routeCoords[routeCoords.length - 1]?.lat, lng: routeCoords[routeCoords.length - 1]?.lng }}
                                                />

                                            )
                                        }


                                        {/* Marker details */}
                                        {selectedTimeMarker !== null && (
                                            <InfoWindowF
                                                position={{ lat: parseFloat(stoppage[selectedTimeMarker]?.lat), lng: parseFloat(stoppage[selectedTimeMarker]?.lng) }}
                                                onCloseClick={() => setSelectedTimeMarker(null)}
                                            >
                                                <div>
                                                    <div>
                                                        <span className='fw-bold'>Arrival Time :</span>
                                                        <span className='ps-1 fw-400'>{convertMarkerDateTime(timeMarkerDetails?.arrival)}</span>
                                                    </div>

                                                    <div className='mt-1'>
                                                        <span className='fw-bold'>Exit Time :</span>
                                                        <span className='ps-1 fw-400'>{convertMarkerDateTime(timeMarkerDetails?.exit)}</span>
                                                    </div>

                                                    <div className='mt-1'>
                                                        <span className='fw-bold'>Duration :</span>
                                                        <span className='ps-1 fw-400'>{getTimeDifferece(timeMarkerDetails?.arrival, timeMarkerDetails?.exit)}</span>
                                                    </div>
                                                </div>
                                            </InfoWindowF>
                                        )}

                                        {selectedSpeedMarker !== null && (
                                            <InfoWindowF
                                                position={{ lat: parseFloat(speedMarkerData[selectedSpeedMarker]?.lat), lng: parseFloat(speedMarkerData[selectedSpeedMarker]?.long) }}
                                                onCloseClick={() => setSelectedSpeedMarker(null)}
                                            >
                                                <div>
                                                    <div>
                                                        <span className='fw-bold'>Date/Time :</span>
                                                        <span className='ps-1 fw-400'>{convertSpeedMarkerDateTime(speedMarkerDetails?.date)}</span>
                                                    </div>

                                                    <div>
                                                        <span className='fw-bold'>Speed :</span>
                                                        <span className='ps-1 fw-400'>{speedMarkerDetails?.speed} (KM/P)</span>
                                                    </div>
                                                </div>
                                            </InfoWindowF>
                                        )}
                                    </GoogleMap>
                                </LoadScript>
                            </div>

                            <div className='w-100 mt-2'>
                                <input type="range"
                                    min={0} max={speedCoords.length - 1}
                                    // value={rangeValue}
                                    value={arrayLocation?.current}
                                    onChange={handleChangeRange}
                                    className='w-100' />
                            </div>

                            <div className='w-100 mt-2 py-2 bg-thm-dark rounded d-flex justify-content-around align-items-center'>
                                <div>
                                    {
                                        pause ? (
                                            <FaPlay className='text-white fs-4 cursor-pointer' onClick={() => setPause(false)} />
                                        ) : (
                                            <IoMdPause className='text-white fs-4 cursor-pointer' onClick={() => setPause(true)} />
                                        )
                                    }
                                </div>

                                {/* {
                        currentPosition.map((data, index) => (
                            <div className='text-center text-white' key={index}>
                                <p className='m-0 p-0'>{data?.value}</p>
                                <p className='m-0 p-0 fw-bold text-uppercase'>{data?.title}</p>
                            </div>
                        ))
                    } */}

                                <div className='text-center text-white'>
                                    <p className='m-0 p-0'>{convertCurrentDateTime(currentCoordDetails?.date)}</p>
                                    <p className='m-0 p-0 fw-bold text-uppercase'>Date/Time</p>
                                </div>

                                <div className='text-center text-white'>
                                    {/* <p className='m-0 p-0'>{100}</p> */}
                                    <p className='m-0 p-0'>{handleGetCoveredDistance()}</p>
                                    <p className='m-0 p-0 fw-bold text-uppercase'>Km Run</p>
                                </div>

                                <div className='text-center text-white'>
                                    <p className='m-0 p-0'>{currentCoordDetails?.speed}</p>
                                    <p className='m-0 p-0 fw-bold text-uppercase'>Speed</p>
                                </div>

                                <div className='text-center text-white'>
                                    <p className='m-0 p-0'>{currentCoordDetails?.lat}</p>
                                    <p className='m-0 p-0 fw-bold text-uppercase'>Latitude</p>
                                </div>

                                <div className='text-center text-white'>
                                    <p className='m-0 p-0'>{currentCoordDetails?.long}</p>
                                    <p className='m-0 p-0 fw-bold text-uppercase'>Longitude</p>
                                </div>

                                <div className='text-center text-white'>
                                    <select className='bg-white py-2 px-3' onChange={(e) => setPlayBackSpeed(e.target.value)}>
                                        <option className='bg-white p-2' value={500}>1x</option>
                                        <option className='bg-white p-2' value={1000}>0.5x</option>
                                        <option className='bg-white p-2' value={250}>2x</option>
                                        <option className='bg-white p-2' value={125}>3x</option>
                                        <option className='bg-white p-2' value={100}>4x</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={`position-absolute ${!showLoader && 'd-none'}`} style={{ width: "61%", height: "67%", top: 162 }}>
                            <div className={`main-loader-container h-100`}>
                                <div className="dot-spinner">
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                    <div className="dot-spinner__dot"></div>
                                </div>
                            </div>
                        </div>
                    </Col>

                </Row>
            </Card>
        </div>
    )
}

export default RouteReport
