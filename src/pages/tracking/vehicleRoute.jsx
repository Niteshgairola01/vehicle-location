import React, { useEffect, useRef, useState } from 'react'
import Card from '../../components/Card/card'
import { GoogleMap, LoadScript, MarkerF, Polyline, PolylineF } from '@react-google-maps/api'
import { useLocation, useNavigate } from 'react-router-dom';
import { getVehicleRoute } from '../../hooks/vehicleMasterHooks';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';
import { truck } from '../../assets/images';
import { Modal } from 'react-bootstrap';

const VehicleRoute = () => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    const [routeData, setRouteData] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [currentPosition, setCurrentPosition] = useState([]);
    const [form, setForm] = useState([]);

    const [pause, setPause] = useState(true);
    const [currentCoordinates, setCurrentCoordinates] = useState({});
    const [currentCoordDetails, setCurrentCoordsDetails] = useState({});
    const [rangeValue, setRangeValue] = useState(0);

    const [playbackSpeed, setPlayBackSpeed] = useState(1000);
    const navigate = useNavigate();
    const mapContainerStyle = {
        width: '100%',
        height: '95%',
    };

    const history = useLocation();
    const vehicleData = history.state;

    useEffect(() => {
        arrayLocation.current = rangeValue;
    }, [rangeValue]);

    useEffect(() => {
        setForm([vehicleData?.vehicleNo, vehicleData?.vehicleExitDbID, vehicleData?.lastDbID])
    }, [vehicleData]);

    useState(() => {
        setCurrentPosition([
            {
                title: 'Date/Time',
                value: currentCoordDetails?.date
            },
            {
                title: 'Km Run',
                value: currentCoordDetails?.km
            },
            {
                title: 'Speed',
                value: currentCoordDetails?.speed
            },
            {
                title: 'Latitude',
                value: currentCoordDetails?.lat
            },
            {
                title: 'Longitude',
                value: currentCoordDetails?.lng
            }
        ]);
    }, [currentCoordDetails]);

    useEffect(() => {
        if (form.length > 0) {
            getVehicleRoute(form).then((response) => {
                if (response.status === 200) {
                    const allData = response?.data;
                    setRouteData(response?.data);

                    let coords = [];

                    allData.map((data) => {
                        coords.push(
                            {
                                lat: parseFloat(data?.lat),
                                lng: parseFloat(data?.long)
                            }
                        )
                    });

                    setCoordinates(coords)

                } else setRouteData([]);
            }).catch(err => console.log("error", err))
        }
    }, [form]);

    // const [arrayLocation, setArrayLocation] = useState(0);
    let arrayLocation = useRef(0);

    useEffect(() => {
        let timeoutIds = [];

        const setNextCoordinate = (index) => {
            if (index < coordinates.length) {
                setCurrentCoordinates(coordinates[index]);
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
            if (coordinates.length > 0 && currentCoordDetails.lat === undefined) {
                setCurrentCoordinates({ lat: coordinates[arrayLocation.current].lat, lng: coordinates[arrayLocation.current].lng });
                setCurrentCoordsDetails(routeData[arrayLocation.current]);
            }

            if (coordinates.length > 0 && currentCoordDetails.lat !== undefined) {
                setCurrentCoordinates({ lat: coordinates[arrayLocation.current].lat, lng: coordinates[arrayLocation.current].lng });
                setCurrentCoordsDetails(routeData[arrayLocation.current]);
            }
        }

        return () => {
            timeoutIds.forEach(clearTimeout);
        };
    }, [pause, playbackSpeed, rangeValue, routeData]);

    const convertDateTime = (originalDateTime) => {
        const [datePart, timePart] = routeData.length < 1 ? '' : originalDateTime.split(' ');
        const [year, day, month] = routeData.length < 1 ? '' : datePart.split('-');

        const formattedDate = routeData.length < 1 ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = routeData.length < 1 ? '' : `${formattedDate} ${timePart}`;

        return routeData.length < 1 ? '' : formattedDateTime;
    };


    const [markerRotation, setMarkerRotation] = useState(0);

    useEffect(() => {
        if (coordinates.length > 1) {
            const heading = new window.google.maps.geometry.spherical.computeHeading(
                new window.google.maps.LatLng(coordinates[0]),
                new window.google.maps.LatLng(coordinates[coordinates.length - 1])
            );

            setMarkerRotation(heading);
        }
    }, [coordinates]);

    const handleCenter = () => {
        if (coordinates.length > 0) {
            if (currentCoordinates.lat === undefined) {
                return { lat: coordinates[0].lat, lng: coordinates[0].lng }
            } else {
                if (currentCoordinates.lat === coordinates[coordinates.length - 1].lat) {
                    return { lat: coordinates[coordinates.length - 1].lat, lng: coordinates[coordinates.length - 1].lng }
                } else {
                    return { lat: currentCoordinates.lat, lng: currentCoordinates.lng }
                }
            }
        } else {
            return { lat: 26.858192, lng: 75.669163 }
        }
    };

    const handleStartPosition = () => {
        if (coordinates.length > 0) {
            return { lat: coordinates[0].lat, lng: coordinates[0].lng }
        } else {
            return { lat: 26.858192, lng: 75.669163 }
        }
    };

    const handleEndPosition = () => {
        if (coordinates.length > 0) {
            return { lat: coordinates[coordinates.length - 1].lat, lng: coordinates[coordinates.length - 1].lng }
        } else {
            return { lat: 26.858192, lng: 75.669163 }
        }
    };

    const handleChange = (e) => {
        setRangeValue(parseInt(e.target.value));
    };

    const coveredCoordinates = routeData.slice(0, arrayLocation.current + 1)
    const coordinatesBeforeMarker = coordinates.slice(0, arrayLocation.current + 1);
    const coordinatesAfterMarker = coordinates.slice(arrayLocation.current);

    const handleGetCoveredDistance = () => {
        return (coveredCoordinates.reduce((prev, curr) => prev + parseFloat(curr.latLongDistance), 0)).toFixed(2)
    };

    return (
        <Modal show={true} className='w-100 p-5' fullscreen centered onHide={() => navigate('/track')} size='xl'>
            <Modal.Header closeButton>
                <div className='m-0 w-100 px-5 d-flex justify-content-between align-items-center'>
                    <h4>Vehicle Route</h4>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='me-2'>
                            <span className='fw-bold me-1'>Vehicle : </span>
                            <span>{vehicleData?.vehicleNo}</span>
                        </div>

                        <div className='ps-2' style={{ borderLeft: "2px solid #000" }}>
                            <span className='fw-bold me-1'>Date: </span>
                            <span>{convertDateTime(routeData[routeData?.length - 1]?.date)}</span>

                            <span className='fw-bold mx-1'>To </span>
                            <span className='m-0 p-0'>{convertDateTime(routeData[0]?.date)}</span>
                        </div>
                    </div>
                </div>
                {/* <Modal.Title className='thm-dark w-100 text-center'>Vehicle Route</Modal.Title> */}
            </Modal.Header>

            <Modal.Body>
                <div className='thm-dark mx-5'>
                    <Card>
                        <div style={{ height: "60vh" }}>
                            <LoadScript googleMapsApiKey={key}>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={handleCenter()}
                                    zoom={11}
                                    options={{ gestureHandling: 'greedy' }}
                                >
                                    <PolylineF
                                        path={coordinatesBeforeMarker}
                                        options={{
                                            strokeColor: '#000',
                                            strokeOpacity: 1.0,
                                            strokeWeight: 2
                                        }}
                                    />

                                    <PolylineF
                                        path={coordinatesAfterMarker}
                                        options={{
                                            strokeColor: '#f75f54',
                                            strokeOpacity: 1.0,
                                            strokeWeight: 2
                                        }}
                                    />

                                    {
                                        coordinates.length > 0 && (
                                            <MarkerF
                                                icon={{
                                                    url: truck,
                                                    scaledSize: new window.google.maps.Size(40, 40),
                                                    anchor: new window.google.maps.Point(30, 25),
                                                    // rotation: 150,
                                                    // path: new window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                                                    // rotation: new window.google.maps.geometry.spherical.computeHeading(
                                                    //     { lat: coordinates[0].lat, lng: coordinates[0].lng },
                                                    //     { lat: coordinates[1].lat, lng: coordinates[1].lng },
                                                    // )
                                                }}
                                                position={handleCenter()}
                                            />
                                        )
                                    }

                                    <MarkerF
                                        label="Start"
                                        position={handleStartPosition()}
                                    />

                                    <MarkerF
                                        label="End"
                                        position={handleEndPosition()}
                                    />

                                </GoogleMap>
                            </LoadScript>
                        </div>

                        <div className='w-100'>
                            <input type="range"
                                min={0} max={coordinates.length - 1}
                                value={arrayLocation?.current}
                                onChange={handleChange}
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
                    </Card>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default VehicleRoute
