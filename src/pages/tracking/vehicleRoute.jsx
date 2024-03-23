import React, { useEffect, useRef, useState } from 'react'
import Card from '../../components/Card/card'
import { CircleF, GoogleMap, InfoWindowF, MarkerF, PolygonF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { Link, useNavigate } from 'react-router-dom';
import { getVehicleRoute } from '../../hooks/vehicleMasterHooks';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';
import { Modal } from 'react-bootstrap';

const VehicleRoute = ({ show, setShow, dealerCoords, plantCoordinates }) => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    // const svgIcon = `
    // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" id="truck"><path d="m3 28.3 13.1-7.5 27.9 14-14 7z" opacity=".3"></path><path fill="#2D3134" d="M5.3 25v3.8l2.5-1.3v-3.7z"></path><path d="M5.3 25v3.8l2.5-1.3v-3.7z" opacity=".39"></path><path fill="#2D3134" d="M26.2 32.9c-.7-.4-1.4-.4-1.9-.2l-1.4.7c-.6.2-.9.8-.9 1.6 0 1.5 1.3 3.4 2.8 4.2.8.4 1.5.4 2 .2 0 0 1.4-.7 1.5-.8.5-.3.7-.8.7-1.5 0-1.6-1.3-3.5-2.8-4.2z"></path><path d="M26.8 39.3c.2-.1 1.4-.7 1.5-.7.5-.3.7-.8.7-1.5 0-.6-.2-1.3-.5-1.9l-1.4.7c.3.6.5 1.3.5 1.9 0 .7-.3 1.3-.8 1.5z" opacity=".39"></path><path fill="#999" d="M26.9 37.4c0 1.2-.9 1.6-2.1 1-1.2-.6-2.1-2-2.1-3.2s.9-1.6 2.1-1c1.2.6 2.1 2 2.1 3.2z"></path><path d="M25 38.4c-1.2-.6-2.1-2-2.1-3.2 0-.6.2-1 .6-1.2-.5.1-.8.6-.8 1.2 0 1.2.9 2.6 2.1 3.2.6.3 1.1.3 1.5.1-.4.2-.8.1-1.3-.1z" opacity=".15"></path><path fill="#2D3134" d="M25.9 36.7c0 .5-.4.7-.9.4s-.9-.8-.9-1.3.4-.7.9-.4.9.8.9 1.3z"></path><path d="M25.9 36.7c0 .5-.4.7-.9.4s-.9-.8-.9-1.3.4-.7.9-.4.9.8.9 1.3z" opacity=".39"></path><path fill="#2D3134" d="M25.7 36.8c0 .5-.4.7-.9.4-.5-.2-.9-.8-.9-1.3s.4-.7.9-.4c.5.2.9.8.9 1.3z"></path><path d="M27.6 37.8c0 1.5-1.3 2.2-2.8 1.4-1.5-.8-2.8-2.7-2.8-4.2s1.3-2.2 2.8-1.4c1.5.7 2.8 2.6 2.8 4.2z" opacity=".06"></path><path fill="#2D3134" d="M9.7 24.6c-.7-.4-1.4-.4-1.9-.2l-1.4.7c-.5.2-.9.8-.9 1.6 0 1.5 1.3 3.4 2.8 4.2.8.4 1.5.4 2 .2 0 0 1.4-.7 1.5-.8.5-.3.7-.8.7-1.5 0-1.5-1.3-3.4-2.8-4.2z"></path><path d="M10.3 31.1c.2-.1 1.4-.7 1.5-.7.5-.3.7-.8.7-1.5 0-.6-.2-1.3-.5-1.9l-1.4.7c.3.6.5 1.3.5 1.9 0 .7-.3 1.2-.8 1.5z" opacity=".39"></path><path fill="#999" d="M10.4 29.2c0 1.2-.9 1.6-2.1 1s-2.1-2-2.1-3.2.9-1.6 2.1-1 2.1 2 2.1 3.2z"></path><path d="M8.5 30.1c-1.2-.6-2.1-2-2.1-3.2 0-.6.2-1 .6-1.2-.5.1-.8.6-.8 1.2 0 1.2.9 2.6 2.1 3.2.6.3 1.1.3 1.5.1-.4.2-.8.2-1.3-.1z" opacity=".15"></path><path fill="#2D3134" d="M9.4 28.5c0 .5-.4.7-.9.4-.5-.2-.9-.8-.9-1.3s.4-.7.9-.4c.5.2.9.8.9 1.3z"></path><path d="M9.4 28.5c0 .5-.4.7-.9.4-.5-.2-.9-.8-.9-1.3s.4-.7.9-.4c.5.2.9.8.9 1.3z" opacity=".39"></path><path fill="#2D3134" d="M9.2 28.5c0 .5-.4.7-.9.4s-.9-.8-.9-1.3.4-.7.9-.4.9.9.9 1.3z"></path><path d="M11.1 29.5c0 1.5-1.3 2.2-2.8 1.4-1.5-.8-2.8-2.7-2.8-4.2s1.3-2.2 2.8-1.4c1.5.8 2.8 2.7 2.8 4.2z" opacity=".06"></path><path fill="#F90" d="M17 1 3 8v15.3l18 9L35 25V10z"></path><path fill="#2D3134" d="M3 22v2l18 9v-2zM35 24v2l-14 7v-2z"></path><path d="M3 8v16l18 9V17z" opacity=".06"></path><path d="M35 10v16l-14 7V17z" opacity=".39"></path><path fill="#E5E5E5" d="m42 18-6-3-14 7v11.3c0 .3.4.5.7.3 1.2-1 3.3-.3 4.8 1.5.9 1.1 1.3 2.3 1.3 3.3l1.2.6 14-7v-8l-2-6z"></path><path fill="#39C" d="m30.4 30.5-1.7-5c-.1-.2 0-.3.2-.4l12.5-6.2c.2-.1.4 0 .5.2l1.6 4.7c.1.2 0 .3-.2.4l-12.4 6.5c-.2.1-.5 0-.5-.2z"></path><path d="m32.7 23.2 8.6-4.3c.2-.1.4 0 .5.2l1.5 4.4-10.6-.3z" opacity=".15"></path><path fill="#2D3134" d="m43.4 23.8-.1-.3c0 .2 0 .3-.2.4l-12.4 6.5c-.2.1-.4 0-.5-.2l.1.3c.1.2.3.3.5.2l12.4-6.5c.2-.1.3-.2.2-.4z"></path><path fill="#FFF" d="m33.5 30 7-3.5v5.8l-7 3.5z"></path><path fill="#2D3134" d="m34 35 6-3v-4.7l-6 3z"></path><path fill="#2D3134" d="M44 32v-2l-14 7v2zM28 38l2 1v-2l-2-1z"></path><path fill="#FFF" d="M34 35v1l6-3v-1z"></path><path fill="#39C" d="m27.5 25.3-3.8-1.9c-.1-.1-.3 0-.3.2v3c0 .2.1.4.3.4l1.3.7c.1.1.2.1.3.2l1.3 1.6h.1l2.2 1.1c.1.1.3-.1.2-.2l-1.7-5c.2 0 .2-.1.1-.1z"></path><path d="m29.3 30.3-2-1h-.1l-1.3-1.6c-.1-.1-.2-.2-.3-.2l-1.3-.7c-.2-.1-.3-.2-.3-.4v-2.9l-.2-.1c-.1-.1-.3 0-.3.2v3c0 .2.1.4.3.4l1.3.7c.1.1.2.1.3.2l1.3 1.6h.1l2.2 1.1c.2.1.3 0 .3-.3z" opacity=".15"></path><path fill="#FC0" d="M30 35v2l-.5-.2v-2z"></path><path fill="#E5E5E5" d="M34 31v.3l6-3V28zM34 32v.3l6-3V29zM34 33v.3l6-3V30zM34 34v.3l6-3V31z"></path><path fill="#2D3134" d="M23.5 28.3v.5l1 .5v-.5z" opacity=".5"></path><path fill="#FFF" d="m24.5 29.5-1-.5v-.2l1 .5z" opacity=".5"></path><path fill="#2D3134" d="M37.5 23.9c-.1-.1-.2-.1-.3 0l-3.8 4.3c-.1.1-.1.2 0 .3s.2.1.3 0l1-1.2v1h.3V27l2.5-2.9c.1 0 .1-.2 0-.2zM41.1 21.9c-.1-.1-.2-.1-.3 0L37 26.2c-.1.1-.1.2 0 .3.1.1.2.1.3 0l.9-1v1.1h.3v-1.4l2.6-3c.1-.1.1-.2 0-.3z"></path><path fill="#FFF" d="m42 31 2-1v-2l-1 .5c-.6.3-1 .9-1 1.6v.9z"></path><ellipse cx="42.7" cy="29.5" fill="#2D3134" opacity=".3" rx=".8" ry=".5" transform="rotate(129.144 42.715 29.544)"></ellipse><ellipse cx="43.2" cy="29.5" fill="#2D3134" opacity=".3" rx=".8" ry=".5" transform="rotate(129.144 43.216 29.544)"></ellipse><path fill="#FFF" d="m42 31 2-1v-2z" opacity=".3"></path><path fill="#FFF" d="m30 37 2-1v-.9c0-.5-.5-.8-1-.6l-1 .5v2z"></path><ellipse cx="31.2" cy="35.5" fill="#2D3134" opacity=".3" rx=".8" ry=".5" transform="rotate(129.144 31.216 35.544)"></ellipse><ellipse cx="30.7" cy="35.5" fill="#2D3134" opacity=".3" rx=".8" ry=".5" transform="rotate(129.144 30.716 35.544)"></ellipse><path fill="#FFF" d="m30 37 2-1-2-1z" opacity=".3"></path><path d="m28 25-6-3v11.3c0 .3.4.5.7.3 1.2-1 3.3-.3 4.8 1.5.3.3.5.6.6 1L28 36v2l2 1v-8l-2-6z" opacity=".06"></path><path d="m42 18-14 7 2 6v8l14-7v-8z" opacity=".39"></path></svg>
    // `

    const [angle, setAngle] = useState(180);

    const loggedInUser = localStorage.getItem('userId');

    const [routeData, setRouteData] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [currentPosition, setCurrentPosition] = useState([]);
    const [form, setForm] = useState([]);

    const [pause, setPause] = useState(true);
    const [nextCoordinates, setNextCoordinates] = useState({});
    const [currentCoordinates, setCurrentCoordinates] = useState({});
    const [currentCoordDetails, setCurrentCoordsDetails] = useState({});
    const [rangeValue, setRangeValue] = useState(0);

    const [stoppage, setStoppage] = useState([]);
    const [stopageCoords, setStopageCoord] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [markerDetails, setMarkerDetails] = useState({});
    const [center, setCenter] = useState({ lat: 26.858192, lng: 75.669163 });

    const [showGeofenceOption, setShowGeofenceOption] = useState(false);
    const [geofencePosition, setGeofencePosition] = useState({ lat: 26.858192, lng: 75.669163 });
    const [playbackSpeed, setPlayBackSpeed] = useState(1000);

    const [boundCenter, setBoundCenter] = useState(false);

    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: key
    });

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    const vehicleNo = localStorage.getItem("vehicle");
    const exitId = localStorage.getItem('vehicleExitDbID');
    const lastId = localStorage.getItem('lastDbID');

    const markerRef = useRef(null);
    const geofenceLat = localStorage.getItem('lat');
    const geofenceLng = localStorage.getItem('lng');


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

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.style.transform = `rotate(${90}deg)`;
        }
    }, []);

    useEffect(() => {
        arrayLocation.current = rangeValue;
    }, [rangeValue]);

    useEffect(() => {
        setForm([vehicleNo, exitId, lastId])
    }, [vehicleNo, exitId, lastId]);

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

    const handleSVGCallback = (svgContent) => {
        // console.log("contnet", svgContent);
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, 'image/svg+xml');
            // console.log(doc); // Log parsed document for inspection

            const groups = doc.querySelectorAll('g');
            // console.log(groups); // Log groups for inspection

            groups.forEach((group) => {
                const paths = group.querySelectorAll('path');
                paths.forEach((path) => {
                    const pathData = path.getAttribute('d');
                    // console.log(pathData);
                });
            });
        } catch (error) {
            console.error('Error parsing SVG content:', error);
        }
    };

    useEffect(() => {
        if (form.length > 0 && form[0] !== null) {
            getVehicleRoute(form).then((response) => {
                if (response.status === 200) {
                    const allData = response?.data;
                    // setRouteData(response?.data);

                    let finalCoords = [];
                    let finalRouteData = [];

                    allData.map((data, index) => {
                        if (index < allData?.length - 1) {
                            if (data?.lat !== allData[index + 1]?.lat) {
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
                    setCoordinates(finalCoords);

                    const latitudesMap = new Map(); // To store seen latitudes
                    const repeatedLatitudes = [];

                    allData.forEach(obj => {
                        // If the latitude has not been encountered yet, add it to the latitudes map
                        if (!latitudesMap.has(obj.lat)) {
                            latitudesMap.set(obj.lat, { count: 1, arrival: obj.date, exit: obj.date });
                        } else {
                            // Increase the count for the latitude in the map
                            const existingLatData = latitudesMap.get(obj.lat);
                            latitudesMap.set(obj.lat, {
                                count: existingLatData.count + 1,
                                arrival: existingLatData.arrival,
                                exit: obj.date,
                                lng: obj.long
                            });
                        }
                    });

                    // Filter latitudes that are repeated
                    latitudesMap.forEach((value, key) => {
                        if (value.count > 1) {
                            repeatedLatitudes.push({
                                lat: key,
                                lng: value.lng,
                                arrival: value.arrival,
                                exit: value.exit
                            });
                        }
                    });

                    setStoppage(repeatedLatitudes);

                    let repeatedCoords = [];

                    repeatedLatitudes.map((data) => {
                        repeatedCoords.push({ lat: parseFloat(data?.lat), lng: parseFloat(data?.lng) })
                    });

                    setStopageCoord(repeatedCoords);

                } else setRouteData([]);
            }).catch(err => console.log("error", err))
        }
    }, [form]);

    let arrayLocation = useRef(0);

    useEffect(() => {
        arrayLocation.current = rangeValue;
    }, [rangeValue]);


    useEffect(() => {
        let timeoutIds = [];
        setBoundCenter(false);

        const setNextCoordinate = (index) => {
            if (index < coordinates.length) {
                setCurrentCoordinates(coordinates[index]);
                index < coordinates.length ? setNextCoordinates(coordinates[index + 1]) : setNextCoordinates(coordinates[0]);
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
            if (coordinates.length > 0 && currentCoordDetails?.lat === undefined) {
                if (arrayLocation.current < coordinates.length - 1) {
                    setNextCoordinates({ lat: coordinates[arrayLocation.current + 1]?.lat, lng: coordinates[arrayLocation.current + 1]?.lng });
                } else {
                    setNextCoordinates({ lat: coordinates[0]?.lat, lng: coordinates[0]?.lng });
                }
                setCurrentCoordsDetails(routeData[arrayLocation.current]);
            }

            if (coordinates.length > 0 && currentCoordDetails?.lat !== undefined) {
                if (arrayLocation.current < coordinates.length - 1) {
                    setNextCoordinates({ lat: coordinates[arrayLocation.current + 1]?.lat, lng: coordinates[arrayLocation.current + 1]?.lng });
                    setCurrentCoordinates(coordinates[arrayLocation.current]);
                } else {
                    setNextCoordinates({ lat: coordinates[0].lat, lng: coordinates[0]?.lng });
                }
                setCurrentCoordsDetails(routeData[arrayLocation.current]);
                setCurrentCoordinates(coordinates[arrayLocation.current]);
            }
        }

        return () => {
            timeoutIds.forEach(clearTimeout);
        };
    }, [pause, playbackSpeed, rangeValue, routeData, currentCoordinates]);

    const convertDateTime = (originalDateTime) => {
        const [datePart, timePart] = routeData.length < 1 ? '' : originalDateTime.split(' ');
        const [year, day, month] = routeData.length < 1 ? '' : datePart.split('-');

        const formattedDate = routeData.length < 1 ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = routeData.length < 1 ? '' : `${formattedDate} ${timePart}`;

        return routeData.length < 1 ? '' : formattedDateTime;
    };

    const convertCurrentDateTime = (originalDateTime) => {
        const [datePart, timePart] = currentCoordDetails?.date === undefined ? '' : originalDateTime.split(' ');
        const [year, month, day] = currentCoordDetails?.date === undefined ? '' : datePart.split('-');

        const formattedDate = currentCoordDetails?.date === undefined ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = currentCoordDetails?.date === undefined ? '' : `${formattedDate} ${timePart}`;

        return currentCoordDetails?.date === undefined ? '' : formattedDateTime;
    };

    const convertMarkerDateTime = (originalDateTime) => {
        const [datePart, timePart] = selectedMarker === null ? '' : originalDateTime.split(' ');
        const [year, month, day] = selectedMarker === null ? '' : datePart.split('-');

        const formattedDate = selectedMarker === null ? '' : `${day}-${month}-${year}`;
        const formattedDateTime = selectedMarker === null ? '' : `${formattedDate} ${timePart}`;

        return selectedMarker === null ? '' : formattedDateTime;
    };

    // useEffect(() => {
    //     if (coordinates.length > 1) {
    //         const heading = new window.google.maps.geometry.spherical.computeHeading(
    //             new window.google.maps.LatLng(coordinates[0]),
    //             new window.google.maps.LatLng(coordinates[coordinates.length - 1])
    //         );

    //         setMarkerRotation(heading);
    //     }
    // }, [coordinates]);

    const handleCenter = () => {

        if (!boundCenter) {

            const geofence = localStorage.getItem("geofence");

            if (geofence !== null && geofence === 'false') {
                return { lat: parseFloat(geofenceLat), lng: parseFloat(geofenceLng) }
            } else {
                if (coordinates.length > 0) {
                    if (currentCoordinates?.lat === undefined) {
                        return { lat: coordinates[0]?.lat, lng: coordinates[0]?.lng }
                    } else {
                        if (currentCoordinates?.lat === coordinates[coordinates.length - 1]?.lat) {
                            return { lat: coordinates[coordinates.length - 1]?.lat, lng: coordinates[coordinates.length - 1]?.lng }
                        } else {
                            return { lat: currentCoordinates?.lat, lng: currentCoordinates?.lng }
                        }
                    }
                } else {
                    return { lat: 26.858192, lng: 75.669163 }
                }
            }
        }
    };

    const vehicleCenter = () => {
        // if (coordinates.length > 0) {
        //     if (currentCoordinates.lat === undefined) {
        //         return { lat: coordinates[0].lat, lng: coordinates[0].lng }
        //     } else {
        //         if (currentCoordinates.lat === coordinates[coordinates.length - 1].lat) {
        //             return { lat: coordinates[coordinates.length - 1].lat, lng: coordinates[coordinates.length - 1].lng }
        //         } else {
        //             return { lat: currentCoordinates.lat, lng: currentCoordinates.lng }
        //         }
        //     }
        // } else {
        //     return { lat: 26.858192, lng: 75.669163 }
        // }

        if (coordinates.length > 0) {
            if (currentCoordinates?.lat === undefined) {
                return { lat: coordinates[0]?.lat, lng: coordinates[0]?.lng }
            } else {
                if (currentCoordinates?.lat === coordinates[coordinates.length - 1]?.lat) {
                    return { lat: coordinates[coordinates.length - 1]?.lat, lng: coordinates[coordinates.length - 1]?.lng }
                } else {
                    return { lat: currentCoordinates?.lat, lng: currentCoordinates?.lng }
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

    const handleStartPosition = () => {
        if (coordinates.length > 0) {
            return { lat: coordinates[0]?.lat, lng: coordinates[0]?.lng }
        } else {
            return { lat: 26.858192, lng: 75.669163 }
        }
    };

    const handleEndPosition = () => {
        if (coordinates.length > 0) {
            return { lat: coordinates[coordinates.length - 1]?.lat, lng: coordinates[coordinates.length - 1]?.lng }
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

    const getBounds = () => {
        const bounds = new window.google.maps.LatLngBounds();
        stopageCoords.forEach((marker) => {
            bounds.extend(marker.position);
        });

        return bounds;
    };

    const handleSelectMarker = (data, index) => {
        setSelectedMarker(index);
        setMarkerDetails(data);
        setBoundCenter(true);
    };

    const handleCloseModal = () => {
        localStorage.removeItem('vehicle');
        localStorage.removeItem('vehicleExitDbID');
        localStorage.removeItem('lastDbID');
        localStorage.removeItem('lat');
        localStorage.removeItem('lng');
        arrayLocation.current = 0
        setShow(false);
        setPause(true);
        setPlayBackSpeed(1000);
        // setRouteData([]);
    }

    return (
        <Modal show={show} className='w-100 p-3' fullscreen centered onHide={() => handleCloseModal()} size='xl'>
            <Modal.Header closeButton>
                <div className='m-0 w-100 px-5 d-flex justify-content-between align-items-center'>
                    <h4>Vehicle Route</h4>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='me-2'>
                            <span className='fw-bold me-1'>Vehicle : </span>
                            <span>{vehicleNo}</span>
                        </div>

                        <div className='ps-2' style={{ borderLeft: "2px solid #000" }}>
                            <span className='fw-bold me-1'>Date: </span>
                            <span>{convertDateTime(routeData[routeData?.length - 1]?.date)}</span>

                            <span className='fw-bold mx-1'>To </span>
                            <span className='m-0 p-0'>{convertDateTime(routeData[0]?.date)}</span>
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ overflow: 'hidden' }}>
                <div className='thm-dark mx-5'>
                    <Card>
                        <div className=' side-map-container' style={{ minHeight: "60vh" }}>
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
                                        zoom={9}
                                        options={{ gestureHandling: 'greedy' }}
                                        onClick={handleShowGeofence}
                                    // mapContainerClassName='side-map-container'
                                    >
                                        <PolylineF
                                            path={coordinatesBeforeMarker}
                                            options={{
                                                strokeColor: '#000',
                                                strokeOpacity: 1.0,
                                                strokeWeight: 4
                                            }}
                                        />

                                        <PolylineF
                                            path={coordinatesAfterMarker}
                                            options={{
                                                strokeColor: '#f75f54',
                                                strokeOpacity: 1.0,
                                                strokeWeight: 4
                                            }}
                                        />

                                        {
                                            coordinates.length > 0 && (
                                                <MarkerF
                                                    key={angle} // Force re-render when angle changes
                                                    icon={{
                                                        path: "M 0,-4 L 8,0 L 0,4 L 2,0 Z",
                                                        scale: 2,
                                                        rotation: angle
                                                    }}
                                                    position={vehicleCenter()}
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

                                        {
                                            stoppage.length > 0 && stoppage.map((data, index) => (
                                                <MarkerF
                                                    label={`${index + 1}`}
                                                    position={{ lat: parseFloat(data?.lat), lng: parseFloat(data?.lng) }}
                                                    onClick={() => handleSelectMarker(data, index)}
                                                />

                                            ))
                                        }

                                        {selectedMarker !== null && (
                                            <InfoWindowF
                                                position={{ lat: parseFloat(stoppage[selectedMarker]?.lat), lng: parseFloat(stoppage[selectedMarker]?.lng) }}
                                                onCloseClick={() => setSelectedMarker(null)}
                                            >
                                                <div>
                                                    <div>
                                                        <span className='fw-bold'>Arrival Time :</span>
                                                        <span className='ps-1 fw-400'>{convertMarkerDateTime(markerDetails?.arrival)}</span>
                                                    </div>

                                                    <div className='mt-1'>
                                                        <span className='fw-bold'>Exit Time :</span>
                                                        <span className='ps-1 fw-400'>{convertMarkerDateTime(markerDetails?.exit)}</span>
                                                    </div>
                                                </div>
                                            </InfoWindowF>
                                        )}

                                        {
                                            showGeofenceOption && (
                                                <InfoWindowF
                                                    position={geofencePosition}
                                                    onCloseClick={() => setShowGeofenceOption(false)}
                                                >
                                                    <Link to="/create-polygon" className='text-decoration-none thm-dark fw-500' onClick={() => {
                                                        localStorage.setItem("geofence", 'true');
                                                        localStorage.setItem("path", '/vehicle-route')
                                                    }} state={geofencePosition}>
                                                        <div>Create Geofence</div>
                                                    </Link>
                                                </InfoWindowF>
                                            )
                                        }

                                        {/* Dealer */}
                                        {
                                            dealerCoords.length === 1 ? (
                                                <>
                                                    <CircleF
                                                        center={dealerCoords[0]}
                                                        radius={3500}
                                                        options={{
                                                            fillColor: 'rgba(255, 0, 0, 0.2)',
                                                            strokeColor: 'red',
                                                            strokeOpacity: 0.8,
                                                            strokeWeight: 2,
                                                        }}
                                                    />
                                                    <MarkerF position={dealerCoords[0]} />
                                                </>
                                            ) : (
                                                <PolygonF
                                                    paths={dealerCoords}
                                                    options={{
                                                        fillColor: 'rgba(255, 0, 0, 0.2)', // Transparent red
                                                        strokeColor: 'red',
                                                        strokeOpacity: 0.8,
                                                        strokeWeight: 2,
                                                    }}
                                                />
                                            )
                                        }

                                        {/* Plant */}
                                        {
                                            plantCoordinates.length > 0 ? (
                                                <>
                                                    {
                                                        plantCoordinates.length === 1 ? (
                                                            <>
                                                                <CircleF
                                                                    center={plantCoordinates[0]}
                                                                    radius={3500}
                                                                    options={{
                                                                        fillColor: 'rgba(255, 0, 0, 0.2)',
                                                                        strokeColor: 'red',
                                                                        strokeOpacity: 0.8,
                                                                        strokeWeight: 2,
                                                                    }}
                                                                />
                                                                <MarkerF position={plantCoordinates[0]} />
                                                            </>
                                                        ) : (
                                                            <PolygonF
                                                                paths={plantCoordinates}
                                                                options={{
                                                                    fillColor: 'rgba(255, 0, 0, 0.2)', // Transparent red
                                                                    strokeColor: 'red',
                                                                    strokeOpacity: 0.8,
                                                                    strokeWeight: 2,
                                                                }}
                                                            />
                                                        )
                                                    }
                                                </>
                                            ) : <></>
                                        }
                                    </GoogleMap>
                                ) : <></>
                            }
                        </div>

                        <div className='mt-2'>
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
                                    <p className='m-0 p-0'>{convertCurrentDateTime(currentCoordDetails?.date)}</p>
                                    <p className='m-0 p-0 fw-bold text-uppercase'>Date/Time</p>
                                </div>

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
                        </div>
                    </Card>
                </div>
            </Modal.Body >
        </Modal >
    );
};

export default VehicleRoute
