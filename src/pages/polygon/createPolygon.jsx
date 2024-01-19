import React, { useEffect, useState } from 'react'
import { CircleF, GoogleMap, LoadScript, MarkerF, PolygonF } from '@react-google-maps/api';
import Button from '../../components/Button/hoveredButton'
import ColoredButton from '../../components/Button/coloredButton'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import Card from '../../components/Card/card'
import Select from 'react-select';
import { Input } from '../../components/form/Input';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';
import { createNewPolygonArea, updatePolygonArea } from '../../hooks/polygonHooks';
import { RxCross1 } from "react-icons/rx";
import { useLocation, useNavigate } from 'react-router-dom';

const CreatePolygon = () => {

    const [form, setForm] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCoordinates, setSelectedCoordinates] = useState([]);
    const [finalCoords, setFinalCoords] = useState([]);
    const [shape, setShape] = useState('');

    const [placeName, setPlaceName] = useState('');
    const [geoName, setGeoName] = useState('');
    const [polygonCategory, setPolygonCategory] = useState('');

    const [searchCoords, setSearchCoords] = useState([]);
    const [searchLatLong, setSearchLatLong] = useState({});

    const [showModal, setShowModal] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const editData = location?.state;
    const edit = location.pathname == '/editPolygon' ? true : false;

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    useEffect(() => {
        if (editData === null) {
            setSelectedCategory('');
            setSelectedCoordinates([]);
            setFinalCoords([]);
            setShape('');
            setPlaceName('');
            setGeoName('');
            setPolygonCategory('');
        } else {
            setSelectedCategory({
                label: editData?.geofenceType,
                value: editData?.geofenceType,
            });
            let initialCoords = [];
            let previousCoords = [];

            editData?.coordinates.map(data => {

                const singleCoords = data?.split(', ');

                initialCoords.push({
                    lat: parseFloat(singleCoords[0]),
                    lng: parseFloat(singleCoords[1])
                });
            });

            setFinalCoords(initialCoords);

            setSelectedCoordinates(initialCoords);

            if (editData?.coordinates.length === 1) {
                setShape({
                    label: 'Circle',
                    value: 'Circle',
                });
                editData?.coordinates.map(data => {
                    const singleCoords = data?.split(', ');
                    previousCoords.push({
                        lat: parseFloat(singleCoords[0]),
                        lng: parseFloat(singleCoords[1])
                    });
                });
            } else if (editData?.coordinates.length > 1) {
                setShape({
                    label: 'Polygon',
                    value: 'Polygon'
                });
                editData?.coordinates.map(data => {
                    const singleCoords = data?.split(', ');
                    previousCoords.push({
                        lat: parseFloat(singleCoords[0]),
                        lng: parseFloat(singleCoords[1])
                    });
                });

                const firstCoord = previousCoords[1].split(', ');
                previousCoords.push({
                    lat: parseFloat(firstCoord[0]),
                    lat: parseFloat(firstCoord[2]),
                })
            };

            setPlaceName(editData?.placeName);
            setGeoName(editData?.geoName);
            setPolygonCategory(editData?.geofenceType);
        }
    }, [editData]);

    const getPolygonPath = () => {
        return selectedCoordinates.map((place) => ({ lat: place.lat, lng: place.lng }));
    };

    useEffect(() => {
        const handleUndo = (event) => {
            if (event.ctrlKey && event.key === 'z') {
                const previousCoords = selectedCoordinates;
                previousCoords.pop();
                setSelectedCoordinates(previousCoords);
            }
        };

        window.addEventListener('keydown', handleUndo);
        
        return () => {
            window.removeEventListener('keydown', handleUndo);
        }
    });

    useEffect(() => {
        getPolygonPath();
    }, [selectedCoordinates]);

    const polygonTypes = [
        {
            label: 'Polygon',
            value: 'Polygon'
        },
        {
            label: 'Circle',
            value: 'Circle'
        },
    ];

    const allCategories = [
        {
            label: 'Reach Point',
            value: 'Reach Point'
        },
        {
            label: 'Parking',
            value: 'Parking'
        },
        {
            label: 'Plant',
            value: 'Plant'
        },
        {
            label: 'Dealer',
            value: 'Dealer'
        }
    ];

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

    const handleSelectCtegory = (category) => {
        setSelectedCategory(category);
        setPolygonCategory(category?.value)
    };

    const handleSelectPolygonType = (type) => {
        setShape(type);
        setSelectedCoordinates([]);
        setFinalCoords([]);
    };

    const handleMapClick = (event) => {
        if (shape === "") {
            ErrorToast('Select Polygon Type First')
        } else {
            const clickedPlace = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };

            setSelectedCoordinates((prevPlaces) => [...prevPlaces, clickedPlace]);
            setFinalCoords((prevPlaces) => [...prevPlaces, clickedPlace]);
        }
    };

    const [coords, setCoords] = useState([]);

    useEffect(() => {
        let coordinates = [];
        finalCoords.map((data) => {
            coordinates.push(`${data?.lat.toFixed(6)}, ${data?.lng.toFixed(6)}`)
        });

        setCoords(coordinates)

        setForm({
            ...form,
            geoName: geoName,
            placeName: placeName,
            geofenceType: selectedCategory?.value,
            coordinates: coordinates
        });

    }, [finalCoords, geoName, placeName, selectedCategory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCoordinates.length === 0) {
            ErrorToast("Select Coordinates")
        } else {
            if (shape === 'Polygon' && selectedCoordinates.length < 3) {
                ErrorToast("Polygon is not closed")
            } else {

                let testcoords = coords;
                selectedCoordinates.length > 1 && testcoords.push(coords[0]);

                const form = {
                    geoName: geoName,
                    placeName: placeName,
                    geofenceType: selectedCategory?.value,
                    coordinates: testcoords
                }

                if (!edit) {
                    createNewPolygonArea(form).then((response) => {
                        if (response?.status === 200) {
                            SuccessToast("New polygon area created");
                            setShowModal(false);
                        } else {
                            ErrorToast("")
                        }
                    }).catch((err) => ErrorToast(err?.message))
                } else {
                    updatePolygonArea(form).then((response) => {
                        if (response?.status === 200) {
                            SuccessToast("Polygon area updated");
                            setShowModal(false)
                        } else {
                            ErrorToast("")
                        }
                    }).catch((err) => ErrorToast(err?.message))
                }
            }
        }

    };

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    const handleSearchByCoords = (e) => {
        e.preventDefault();
        setSearchLatLong({
            lat: parseFloat(searchCoords[0]),
            lng: parseFloat(searchCoords[1])
        })
    };

    const handleChangeSearchCoords = (e) => {
        const targetValue = e.target.value;
        setSearchCoords(targetValue.split(', '));
    }

    const handleMapCenter = () => {
        if (searchLatLong?.lat && selectedCoordinates.length === 0) {
            return searchLatLong;
        } else {
            return selectedCoordinates.length > 0 ? selectedCoordinates[0] : { lat: 26.858192, lng: 75.669163 }
        }
    }

    console.log("selected coords", selectedCoordinates);

    return (
        <Modal show={showModal} fullscreen centered onHide={() => {
            setForm({});
            setShowModal(false);
            navigate('/polygon');
        }} size='xl'
            className='w-100 p-5'>
            <Modal.Header closeButton>
                <Modal.Title className='thm-dark w-100 text-center'>{!edit ? 'Create Polygon' : 'Edit Polygon'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='px-5'>
                    <div>
                        <Row>
                            <Col sm={12} md={12} lg={4} className='pe-3'>
                                <Card>
                                    <h6 className='thm-dark'>{!edit ? "Create New Polygon" : 'Edit Polygon'}</h6>
                                    <hr />
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col sm={6} style={{ zIndex: 2 }}>
                                                <Form.Label className='thm-dark'>Category</Form.Label>
                                                <Select
                                                    options={allCategories}
                                                    value={selectedCategory}
                                                    onChange={handleSelectCtegory}
                                                    isClearable={true}
                                                    styles={selectStyles}
                                                />
                                            </Col>

                                            <Col sm={6} className='position-relative '>
                                                <Form.Label className='thm-dark'>Polygon Type</Form.Label>
                                                <Select
                                                    options={polygonTypes}
                                                    value={shape}
                                                    onChange={handleSelectPolygonType}
                                                    isClearable={true}
                                                    styles={selectStyles}
                                                />
                                            </Col>
                                        </Row>

                                        <Col sm={12} className='mt-3'>
                                            <Input className="py-2" label="Place" type="text" name="placeName" value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Place Name" />
                                        </Col>

                                        {
                                            (selectedCategory?.value === "Dealer" || selectedCategory?.value === "Plant") ? (
                                                <div>
                                                    {
                                                        selectedCategory?.value === 'Dealer' ? (
                                                            <Col sm={12} className='mt-3'>
                                                                <Input className="py-2" label="Dealer" type="text" value={geoName} name="geoName" onChange={(e) => setGeoName(e.target.value)} placeholder="Delaer" />
                                                            </Col>
                                                        ) : (
                                                            <Col sm={12} className='mt-3'>
                                                                <Input className="py-2" label="Plant" type="text" value={geoName} name="geoName" onChange={(e) => setGeoName(e.target.value)} placeholder="Plant" />
                                                            </Col>
                                                        )
                                                    }
                                                </div>
                                            ) : null
                                        }

                                        <div className='mt-5 d-flex justify-content-center align-items-center'>
                                            <ColoredButton className="px-5 w-75 py-1" type="submit">{!edit ? 'Create' : 'Update'}</ColoredButton>
                                        </div>
                                    </Form>
                                </Card>

                                <Card>
                                    <Col sm={12} md={12} lg={6} className='pt-3'>
                                        <div className='p-3 rounded border border-dark'>
                                            <p className='thm-dark'>Selected Coordinates</p>
                                            <hr />
                                            <div>
                                                {
                                                    selectedCoordinates.length === 0 ? (
                                                        <div className='thm-dark d-flex justify-content-between align-items-center' style={{ width: "80%" }}>
                                                            <p className='m-0 p-0 text-secondary'>Selected Coordinates</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {
                                                                selectedCoordinates.map((data, index) => (
                                                                    <div className='thm-dark d-flex justify-content-between align-items-center' key={index} style={{ width: "80%" }}>
                                                                        <span>{data?.lat.toFixed(6)}</span>
                                                                        <span>{data?.lng.toFixed(6)}</span>
                                                                    </div>
                                                                ))
                                                            }

                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </Col>
                                </Card>
                            </Col>
                            <Col sm={12} md={12} lg={8} className='position-relative' style={{ height: "75vh" }}>
                                <div className='d-flex justify-conten-end align-items-start flex-row position-absolute' style={{ top: 10, right: 20, zIndex: 1, }}>
                                    {
                                        selectedCoordinates.length > 0 ? (
                                            <div className='me-3 bg-white p-2 rounded cursor-pointer d-flex justify-content-between align-items-start'
                                                onClick={() => setSelectedCoordinates([])}
                                                style={{ width: '200px', }}
                                            >
                                                <p className='m-0 p-0'>Clear Coordinates</p>
                                                <RxCross1 />
                                            </div>
                                        ) : null
                                    }

                                    <div className='bg-white px-3 py-2 thm-dark rounded'>
                                        <Form onSubmit={handleSearchByCoords}>
                                            <Input label="Search By Coordinates" type="search" onChange={handleChangeSearchCoords} placeholder="Ex: 20.876787, 70.984886" />
                                        </Form>
                                    </div>
                                </div>
                                <LoadScript googleMapsApiKey={key}>
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={handleMapCenter()}
                                        zoom={11}
                                        onClick={handleMapClick}
                                        options={{ gestureHandling: 'greedy' }}
                                    >
                                        {
                                            shape.value === 'Polygon' ? (
                                                <PolygonF
                                                    path={selectedCoordinates.map((place) => ({ lat: place.lat, lng: place.lng }))}
                                                    options={{
                                                        fillColor: 'rgba(255, 0, 0, 0.2)',
                                                        strokeColor: 'red',
                                                        strokeOpacity: 0.8,
                                                        strokeWeight: 2,
                                                    }}
                                                />
                                            ) : shape.value === 'Circle' ? (
                                                <>
                                                    <CircleF options={{
                                                        center: selectedCoordinates[0],
                                                        radius: 500,
                                                        fillColor: 'rgba(255, 0, 0, 0.2)',
                                                        strokeColor: 'red',
                                                        strokeOpacity: 0.8,
                                                        strokeWeight: 2,
                                                    }} />
                                                </>
                                            ) : null
                                        }
                                        {
                                            selectedCoordinates.length > 0 ? (
                                                <MarkerF position={selectedCoordinates[0]} />
                                            ) : (selectedCoordinates.length === 0 && searchLatLong?.lat) ? (
                                                <MarkerF position={handleMapCenter()} />
                                            ) : null
                                        }
                                    </GoogleMap>
                                </LoadScript>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default CreatePolygon
