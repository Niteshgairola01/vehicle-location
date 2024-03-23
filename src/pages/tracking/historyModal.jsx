import React, { useEffect, useRef, useState } from 'react'
import { getAllVehiclesList, getVehicleRoute } from '../../hooks/vehicleMasterHooks';
import { GoogleMap, InfoWindowF, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import { ErrorToast } from '../../components/toast/toast';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

const HistoryModal = ({ show, setShow, selectedRange, selectedRouteData, vehicleNo, selectedTrip, startDate, endDate }) => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";
    const [form, setForm] = useState({});

    let arrayLocation = useRef(0);
    const [angle, setAngle] = useState(180);
    const [routeData, setRouteData] = useState([]);
    const [routeCoords, setRouteCoords] = useState([]);
    const [center, setCenter] = useState({ lat: 26.858192, lng: 75.669163 });

    const [pause, setPause] = useState(true);
    const [nextCoordinates, setNextCoordinates] = useState({});
    const [currentCoordinates, setCurrentCoordinates] = useState({});
    const [currentCoordDetails, setCurrentCoordsDetails] = useState({});
    const [rangeValue, setRangeValue] = useState(0);
    const [playbackSpeed, setPlayBackSpeed] = useState(1000);

    const coveredCoordinates = routeData.slice(0, arrayLocation.current + 1)
    const coordinatesBeforeMarker = routeCoords.slice(0, arrayLocation.current + 1);
    const coordinatesAfterMarker = routeCoords.slice(arrayLocation.current);

    const [showLoader, setShowLoader] = useState(false)
    const [boundCenter, setBoundCenter] = useState(false);
    const [singleLoad, setSingleLoad] = useState(false);

    const [showGeofenceOption, setShowGeofenceOption] = useState(false);
    const [geofencePosition, setGeofencePosition] = useState({ lat: 26.858192, lng: 75.669163 })

    const loggedInUser = localStorage.getItem('userId');
    const navigate = useNavigate();
    const location = useLocation();

    const geofenceLat = localStorage.getItem('lat');
    const geofenceLng = localStorage.getItem('lng');

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: key
    });

    useEffect(() => {
        if (!loggedInUser) {
            localStorage.clear();
            navigate('/');
        }
    }, []);

    useEffect(() => {
        setForm({
            vehicle: vehicleNo,
            startDate: startDate,
            endDate: endDate
        });
    }, [show, vehicleNo, startDate, endDate]);

    useEffect(() => {
        if (geofenceLat === null) {
            setGeofencePosition({ lat: 26.858192, lng: 75.669163 })
        } else {
            setShowGeofenceOption(true);
            setBoundCenter(true);
            setGeofencePosition({ lat: parseFloat(geofenceLat), lng: parseFloat(geofenceLng) });
        }
    }, []);


    useEffect(() => {
        setTimeout(() => {
            localStorage.removeItem("geofence");
        }, 500);
    }, []);

    const calculateAngle = (lat1, lon1, lat2, lon2) => {
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        const brng = Math.atan2(y, x);
        const angle = (brng * 180) / Math.PI;
        lat1 === lat2 ? setAngle(180) : setAngle(angle - 92.1);
    };

    useEffect(() => {

        const lat1 = currentCoordinates?.lat * Math.PI / 180;
        const lon1 = currentCoordinates?.lng * Math.PI / 180;
        const lat2 = nextCoordinates?.lat * Math.PI / 180;
        const lon2 = nextCoordinates?.lng * Math.PI / 180;

        calculateAngle(lat1, lon1, lat2, lon2);
    }, [currentCoordinates, nextCoordinates]);

    useEffect(() => {
        arrayLocation.current = rangeValue;
    }, [rangeValue]);

    useEffect(() => {
        if (routeData.length > 0) {
            let timeoutIds = [];
            setBoundCenter(false);

            const setNextCoordinate = (index) => {
                if (index < routeCoords.length) {
                    setCurrentCoordinates(routeCoords[index]);

                    index < routeCoords.length ? setNextCoordinates(routeCoords[index + 1]) : setNextCoordinates(routeCoords[0]);
                    arrayLocation.current = index;
                    timeoutIds.push(setTimeout(() => setNextCoordinate(index + 1), playbackSpeed));
                }
            };

            const setNextCoord = (index) => {
                if (index < routeData.length) {
                    setCurrentCoordsDetails(routeData[index]);
                    timeoutIds.push(setTimeout(() => setNextCoord(index + 1), playbackSpeed));
                }
            };

            if (pause === false) {
                timeoutIds = [];
                setNextCoord(arrayLocation.current);
                setNextCoordinate(arrayLocation.current);
            } else {
                timeoutIds.forEach(clearTimeout);
                if (routeCoords.length > 0 && currentCoordDetails?.lat === undefined) {
                    if (arrayLocation.current < routeCoords.length - 1) {
                        setNextCoordinates({ lat: routeCoords[arrayLocation.current + 1].lat, lng: routeCoords[arrayLocation.current + 1].lng });
                    } else {
                        setNextCoordinates({ lat: routeCoords[0].lat, lng: routeCoords[0].lng });
                    }

                    setCurrentCoordsDetails(routeData[arrayLocation.current]);
                    setCurrentCoordinates(routeCoords[arrayLocation.current]);
                }

                if (routeCoords.length > 0 && currentCoordDetails.lat !== undefined) {
                    if (arrayLocation.current < routeCoords.length - 1) {
                        setNextCoordinates({ lat: routeCoords[arrayLocation.current + 1].lat, lng: routeCoords[arrayLocation.current + 1].lng });
                    } else {
                        setNextCoordinates({ lat: routeCoords[0].lat, lng: routeCoords[0].lng });
                    }
                    setCurrentCoordsDetails(routeData[arrayLocation.current]);
                    setCurrentCoordinates(routeCoords[arrayLocation.current]);
                }
            }

            return () => {
                timeoutIds.forEach(clearTimeout);
            };
        }
    }, [pause, playbackSpeed, rangeValue, routeData]);

    const handleChangeRange = (e) => {
        setRangeValue(parseInt(e.target.value));
    };

    useEffect(() => {

        const handleGetRoute = (allData) => {
            arrayLocation.current = 0;
            let coords = [];
            let finalCoords = [];
            let finalRouteData = [];

            allData.map((data, index) => {
                if (index < allData?.length - 1) {
                    if (parseFloat(data?.lat) !== parseFloat(allData[index + 1]?.lat)) {
                        finalCoords.push({
                            lat: parseFloat(data?.lat),
                            lng: parseFloat(data?.long)
                        });

                        finalRouteData.push(data);
                    };
                };
            });

            finalCoords.push({
                lat: parseFloat(allData[allData?.length - 1]?.lat),
                lng: parseFloat(allData[allData?.length - 1]?.long),
            });

            finalRouteData.push(allData[allData?.length - 1])

            setRouteData(finalRouteData);
            setRouteCoords(finalCoords);

            allData.map((data) => {
                coords.push(
                    {
                        lat: parseFloat(data?.lat),
                        lng: parseFloat(data?.long)
                    }
                )
            });

            if (selectedRouteData === 0) {
                ErrorToast("No Data Found")
            }
        };

        if (location.pathname === '/track') {
            if (show && selectedRouteData.length > 0) {
                handleGetRoute(selectedRouteData);
            }
        } else {
            setTimeout(() => {
                if (show && form?.startDate && form?.vehicle) {
                    arrayLocation.current = 0;
                    setPause(true);
                    setShowLoader(true);

                    const payload = [form?.vehicle, form?.startDate, form?.endDate];

                    if (!singleLoad) {
                        getVehicleRoute(payload).then((response) => {
                            if (response.status === 200) {
                                setShowLoader(false);
                                setSingleLoad(true);

                                handleGetRoute(response?.data);
                            } else {
                                setRouteData([]);
                                setSingleLoad(true);
                            };
                        }).catch((err) => {
                            setRouteData([]);
                            setSingleLoad(true);
                            setShowLoader(false);
                            console.log(err);
                        })
                    }
                }
            }, 1000);
        }
    }, [show, form, selectedRouteData]);

    const mapContainerStyle = {
        width: '100%',
        height: "60vh"
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
    };


    const handleShowGeofence = (event) => {
        setShowGeofenceOption(true);
        // const lat = 
        // console.log("event", event.latLng.lat());
        setGeofencePosition({
            lat: parseFloat((event.latLng.lat().toFixed(6))),
            lng: parseFloat((event.latLng.lng().toFixed(6))),
        });

        localStorage.setItem('lat', parseFloat((event.latLng.lat().toFixed(6))));
        localStorage.setItem('lng', parseFloat((event.latLng.lng().toFixed(6))));

        setBoundCenter(true);
    };

    const handleGetCoveredDistance = () => {

        if (coveredCoordinates[0] === undefined) {
            // ErrorToast("No data found");
            return '';
        } else {
            return (coveredCoordinates.reduce((prev, curr) => prev + parseFloat(curr.latLongDistance), 0)).toFixed(2)
        }
    };

    const convertCurrentDateTime = (originalDateTime) => {
        const [datePart, timePart] = currentCoordDetails?.date === undefined ? '' : originalDateTime.split(' ');
        const [year, month, day] = currentCoordDetails?.date === undefined ? '' : datePart.split('-');

        const formattedDate = currentCoordDetails?.date === undefined ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = currentCoordDetails?.date === undefined ? '' : `${formattedDate} ${timePart}`;

        return currentCoordDetails?.date === undefined ? '' : formattedDateTime;
    };

    const getTimeDifferece = (arrival, exit) => {
        const arrivalTime = new Date(arrival);
        const exitTime = new Date(exit);

        const differenceMs = exitTime - arrivalTime;

        let seconds = Math.floor(differenceMs / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        const formattedHours = hours < 10 ? "0" + hours : hours;
        const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
        const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

        const formattedDifference = `${formattedHours}:${formattedMinutes}:${formattedSeconds} hrs`;

        return formattedDifference;
    };

    return (
        <Modal className='w-100 p-3' show={show} onHide={() => {
            setForm({})
            setShow(false);
            setSingleLoad(false);
            setPause(true);
            setPlayBackSpeed(1000);
            setRouteCoords([]);
        }} fullscreen centered size="xl">
            <Modal.Header closeButton>
                <div className='m-0 w-100 px-5 d-flex justify-content-between align-items-center'>
                    <h4>Trip Route</h4>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='me-2 pe-2' style={{ borderRight: "2px solid #000" }}>
                            <span className='fw-bold mx-1 ps-2'>Trip No.</span>
                            <span className='m-0 p-0'>{selectedTrip?.tripLogNo !== null && selectedTrip?.tripLogNo}</span>
                        </div>
                        <div className='me-2'>
                            <span className='fw-bold me-1'>Vehicle : </span>
                            <span>{vehicleNo}</span>
                        </div>

                        <div className='ps-2' style={{ borderLeft: "2px solid #000" }}>
                            <span className='fw-bold me-1'>Date: </span>
                            <span>{selectedRange}</span>

                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className='thm-dark m-0 p-0 p-5 pt-3'>
                    <div className='w-100 position-relative'>
                        <div style={{ minHeight: '60vh' }}>
                            {
                                isLoaded ? (
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
                                        onClick={handleShowGeofence}
                                    >
                                        {/* Route History */}

                                        {
                                            coordinatesAfterMarker.length > 0 && (
                                                <PolylineF
                                                    path={coordinatesBeforeMarker}
                                                    options={{
                                                        strokeColor: '#000',
                                                        strokeOpacity: 1.0,
                                                        strokeWeight: 4
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
                                                        strokeWeight: 4
                                                    }}
                                                />
                                            )
                                        }

                                        {
                                            routeCoords.length > 0 && (
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
                                    </GoogleMap>
                                ) : <></>
                            }
                        </div>

                        <div className='w-100 mt-2'>
                            <input type="range"
                                min={0} max={routeCoords.length - 1}
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

                    <div className={`position-absolute ${!showLoader && 'd-none'}`} style={{ width: "95%", height: "100%", top: 10 }}>
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
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default HistoryModal
