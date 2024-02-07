import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import Card from '../../components/Card/card'
import { Col, Form, Row } from 'react-bootstrap'
import { Input, SearchField } from '../../components/form/Input'
import { getAllVehiclesList, getVehicleRoute } from '../../hooks/vehicleMasterHooks';
import Button from '../../components/Button/coloredButton';
import { GoogleMap, LoadScript, MarkerF, PolylineF } from '@react-google-maps/api';
import { getAllPolygonAreas } from '../../hooks/polygonHooks';

const RouteReport = () => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    const [vehicleList, setVehiclesList] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [form, setForm] = useState({});

    const [routeData, setRouteData] = useState([]);
    const [stoppage, setStoppage] = useState([]);
    const [routeCoords, setRouteCoords] = useState([]);
    const [center, setCenter] = useState({ lat: 26.858192, lng: 75.669163 });

    const [includeSpeed, setIncludeSpeed] = useState(false);
    const [includeTime, setIncludeTime] = useState(false);

    const [polygonAreas, setPolygonAreas] = useState([]);
    const [polygonCoords, setPolygonCoords] = useState([]);

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
        getAllPolygonAreas().then((response) => {
            if (response.status === 200) {
                const allData = response?.data;

                let coords = [];

                allData.map(data => {

                    const currentCoords = data?.coords.split(' ');
                    console.log('current', currentCoords );

                    coords.push({
                        lat: parseFloat(currentCoords[0]),
                        lng: parseFloat(currentCoords[1]),
                    })
                })

                setPolygonCoords(coords);
                setPolygonAreas(response?.data);

            } else {
                setPolygonCoords([]);
                setPolygonAreas([]);
            }
        }).catch(() => {
            setPolygonCoords([]);
            setPolygonAreas([]);
        })
    }, []);

    console.log("polygons", polygonCoords);

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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formatDate = (dateString) => {
            const newDate = `${dateString}:00`
            const currentDate = newDate.length === undefined ? '' : newDate.split('T');
            const formated = currentDate.join(' ');

            return formated;
        };

        formatDate(form?.startDate);

        const payload = [form?.vehicle, formatDate(form?.startDate), formatDate(form?.endDate)]

        getVehicleRoute(payload).then((response) => {
            if (response.status === 200) {
                const allData = response?.data;

                const latitudesMap = new Map();
                const repeatedLatitudes = [];

                allData.forEach(obj => {
                    if (!latitudesMap.has(obj.lat)) {
                        latitudesMap.set(obj.lat, { count: 1, arrival: obj.date, exit: obj.date });
                    } else {
                        const existingLatData = latitudesMap.get(obj.lat);
                        latitudesMap.set(obj.lat, {
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
                            lat: key,
                            lng: value.lng,
                            arrival: value.arrival,
                            exit: value.exit
                        });
                    }
                });

                setStoppage(repeatedLatitudes);

                let coords = [];

                allData.map((data) => {
                    coords.push(
                        {
                            lat: parseFloat(data?.lat),
                            lng: parseFloat(data?.long)
                        }
                    )
                });

                setRouteCoords(coords);

                setRouteData(response?.data);
            } else setRouteData([]);
        }).catch(err => {
            console.log("err", err);
            setRouteData([]);
        })
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
        height: '70vh',
    };

    const getBounds = () => {
        const bounds = new window.google.maps.LatLngBounds();
        routeCoords.forEach((marker) => {
            bounds.extend(marker.position);
        });

        return bounds;
    };

    const handleCenter = () => {
        if (routeData.length > 0) {
            return routeCoords[0];
        } else {
            return { lat: 26.858192, lng: 75.669163 }
        }
    };

    return (
        <div className='thm-dark m-0 p-0 position-relative p-5'>
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
                                        <Form.Control type='datetime-local' name="startDate" onChange={handleChange} className='inputfield p-1' required />
                                    </Col>
                                </Row>
                            </Form.Group>

                            <Form.Group className='my-2'>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className='fw-400 thm-dark'>End Date</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control type='datetime-local' name="endDate" onChange={handleChange} className='inputfield p-1' required />
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
                                <Button className="px-4">View</Button>
                            </div>
                        </Form>
                    </Col>
                    <Col sm={12} md={12} lg={8}>
                        <LoadScript googleMapsApiKey={key}>
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                onLoad={(map) => {
                                    const bounds = routeData.length > 0 && getBounds();
                                    routeData.length > 0 && map.fitBounds(bounds);

                                    routeData.length > 0 && setCenter(map.getCenter());
                                }}
                                center={handleCenter()}
                                zoom={11}
                                options={{ gestureHandling: 'greedy' }}
                            >

                                {/* Route */}
                                <PolylineF
                                    path={routeCoords}
                                    options={{
                                        strokeColor: 'red',
                                        strokeOpacity: 1.0,
                                        strokeWeight: 2
                                    }}
                                />

                                {/* Stopage marker */}
                                {
                                    stoppage.map((data, index) => (
                                        <MarkerF
                                            label={`${index + 1}`}
                                            position={{ lat: parseFloat(data?.lat), lng: parseFloat(data?.lng) }}
                                        />

                                    ))
                                }
                            </GoogleMap>
                        </LoadScript>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default RouteReport
