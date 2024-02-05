import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { GoogleMap, LoadScript, MarkerF, Polyline, PolylineF } from '@react-google-maps/api'
import { useLocation } from 'react-router-dom';
import { getVehicleRoute } from '../../hooks/vehicleMasterHooks';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';

const VehicleRoute = () => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    const rouetObject = Object.freeze({
        id: 1234,
        dateTime: 'Feb 3 2024 16:00',
        km: 240,
        latLongDistance: 0.44,
        lat: 19.0760,
        lng: 72.8777,
        speed: 40,
    })
    const [routeData, setRouteData] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [currentPosition, setCurrentPosition] = useState([]);
    const [form, setForm] = useState([]);

    const [pause, setPause] = useState(true);

    const mapContainerStyle = {
        width: '100%',
        height: '95%',
    };


    const history = useLocation();
    const vehicleData = history.state;

    useEffect(() => {
        setForm([vehicleData?.vehicleNo, vehicleData?.vehicleExitDbID, vehicleData?.lastDbID])
    }, [vehicleData]);

    useState(() => {
        setCurrentPosition([
            {
                title: 'Date/Time',
                value: routeData[0]?.dateTime
            },
            {
                title: 'Km Run',
                value: routeData[0]?.km
            },
            {
                title: 'Speed',
                value: routeData[0]?.speed
            },
            {
                title: 'Latitude',
                value: routeData[0]?.lat
            },
            {
                title: 'Longitude',
                value: routeData[0]?.lng
            }
        ]);
    }, [routeData]);



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

    const handleCenter = () => {
        if (coordinates.length > 0) {
            return { lat: coordinates[0].lat, lng: coordinates[0].lng }
        } else {
            return { lat: 0, lng: 0 }
        }
    };

    console.log("coordinates", coordinates);

    return (
        <div className='thm-dark mt-5 mx-5'>
            <Card>
                <div className='m-0 w-100 d-flex justify-content-between align-items-center'>
                    <h4>Vehicle Route</h4>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='me-2'>
                            <span className='fw-bold me-1'>Vehicle : </span>
                            <span>{vehicleData?.vehicleNo}</span>
                        </div>

                        <div className='ps-2' style={{ borderLeft: "2px solid #000" }}>
                            <span className='fw-bold me-1'>Date: </span>
                            <span>{routeData[routeData?.length - 1]?.date}</span>

                            <span className='fw-bold mx-1'>To </span>
                            <span className='m-0 p-0'>{routeData[0]?.date}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div style={{ height: "60vh" }}>
                    <LoadScript googleMapsApiKey={key}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={handleCenter()}
                            // center={{ lat: coordinates[0].lat, lng: coordinates[0].lng }}
                            zoom={11}
                            options={{ gestureHandling: 'greedy' }}
                        >
                            <PolylineF
                                path={coordinates}
                                options={{
                                    strokeColor: "#000",
                                    strokeOpacity: 1,
                                    strokeWeight: 2,
                                }}
                            />
                            <MarkerF position={handleCenter()} />
                        </GoogleMap>
                    </LoadScript>
                </div>

                <div className='w-100'>
                    <input type="range" min="0" max="100" className='w-100' />
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
                    {
                        currentPosition.map((data, index) => (
                            <div className='text-center text-white' key={index}>
                                <p className='m-0 p-0'>{data?.value}</p>
                                <p className='m-0 p-0 fw-bold text-uppercase'>{data?.title}</p>
                            </div>
                        ))
                    }
                </div>
            </Card>
        </div>
    )
}

export default VehicleRoute
