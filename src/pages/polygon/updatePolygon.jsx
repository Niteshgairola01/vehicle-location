import React, { memo, useEffect, useRef, useState } from 'react'
import { CircleF, GoogleMap, LoadScript, MarkerF, PolygonF, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import Button from '../../components/Button/hoveredButton'
import ColoredButton from '../../components/Button/coloredButton'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import Card from '../../components/Card/card'
import Select from 'react-select';
import { Input } from '../../components/form/Input';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';
import { updatePolygonArea } from '../../hooks/polygonHooks';
import { RxCross1, RxEnterFullScreen } from "react-icons/rx";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoTriangleOutline } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";


// MUI form
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import { Circle } from '../../assets/images';
import { Tooltip } from '@mui/material';
import { getAllPartiesList } from '../../hooks/clientMasterHooks';


const UpdatePolygon = () => {
    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    const [prevoiusValues, setPreviousValues] = useState({});
    const [form, setForm] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCoordinates, setSelectedCoordinates] = useState([]);
    const [partiesList, setPartiesList] = useState([]);
    const [selectedParty, setSelectedParty] = useState('');

    const [placeName, setPlaceName] = useState('');
    const [geoName, setGeoName] = useState('');
    const [polygonCategory, setPolygonCategory] = useState('');

    const [searchCoords, setSearchCoords] = useState([]);
    const [searchLatLong, setSearchLatLong] = useState({});
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPolygonClosed, setIsPolygonClosed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const loggedInUser = localStorage.getItem('userId');

    const navigate = useNavigate();
    const location = useLocation();
    // const polygonData = location?.state;
    const polygonData = JSON.parse(localStorage.getItem("polygonData"));
    let editData;

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
        editData = polygonData;
    }, []);

    // console.log();

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

    // const key = "ABC";
    const fullScreen = useRef(null);

    useEffect(() => {
        if (editData === null) {
            setSelectedCategory('');
            setSelectedCoordinates([]);
            setIsPolygonClosed(false);
            setPlaceName('');
            setGeoName('');
            setPolygonCategory('');
        } else {
            setSelectedCategory({
                label: editData?.geofenceType,
                value: editData?.geofenceType,
            });

            setSelectedParty({
                label: editData?.dealerOEM,
                value: editData?.dealerOEM
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

            setSelectedCoordinates(initialCoords);

            if (editData?.coordinates.length === 1) {
                editData?.coordinates.map(data => {
                    const singleCoords = data?.split(', ');
                    previousCoords.push({
                        lat: parseFloat(singleCoords[0]),
                        lng: parseFloat(singleCoords[1])
                    });
                });
            } else if (editData?.coordinates.length > 1) {
                editData?.coordinates.map(data => {
                    const singleCoords = data?.split(', ');
                    previousCoords.push({
                        lat: parseFloat(singleCoords[0]),
                        lng: parseFloat(singleCoords[1])
                    });
                });
            };

            setPlaceName(editData?.placeName);
            setGeoName(editData?.geoName);
            setPolygonCategory(editData?.geofenceType);

            editData?.coordinates.length === 1 ? setSelectedPolygonType('Circle') : setSelectedPolygonType('Polygon')
        }
    }, [editData]);

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
        menu: provided => ({ ...provided, zIndex: 9999 })
    };

    const handleSelectCtegory = (category) => {
        setSelectedCategory(category);
        setPolygonCategory(category?.value)
    };

    const handleSelectParty = (party) => {
        setSelectedParty(party);
    };

    const handleMapClick = (event) => {
        if (selectedPolygonType === "") {
            ErrorToast('Select Polygon Type First')
        } else {
            const clickedCoordinate = { lat: event.latLng.lat(), lng: event.latLng.lng() };

            const firtsCoordLat = selectedCoordinates[0]?.lat;
            const firtsCoordLong = selectedCoordinates[0]?.lng;

            const lastCoordLat = selectedCoordinates[selectedCoordinates?.length - 1]?.lat;
            const lastCoordLong = selectedCoordinates[selectedCoordinates?.length - 1]?.lng;

            if (selectedPolygonType === 'Circle') {
                if (selectedCoordinates.length === 1) {
                    ErrorToast("Polygon Is closed");
                } else {
                    setSelectedCoordinates([clickedCoordinate]);
                }
            } else if (selectedPolygonType === 'Polygon') {
                if (selectedCoordinates.length > 1 && firtsCoordLat === lastCoordLat && firtsCoordLong === lastCoordLong) {
                    ErrorToast("Polygon Is closed");
                } else {
                    setSelectedCoordinates([...selectedCoordinates, clickedCoordinate]);
                }
            }
        }
    };


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsDrawing(false);
                setSelectedCoordinates([]);
                setIsPolygonClosed(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDrawing]);

    const [coords, setCoords] = useState([]);

    useEffect(() => {
        let coordinates = [];
        selectedCoordinates.map((data) => {
            const lat = data?.lat.toFixed(6).split('.');
            const lng = data?.lng.toFixed(6).split('.');

            let finalLat = 0;
            let finalLong = 0;

            if (parseInt(lat[0]) < 10) {
                finalLat = `0${lat[0]}.${lat[1]}`;
            } else {
                finalLat = `${lat[0]}.${lat[1]}`;
            };

            if (parseInt(lng[0]) < 10) {
                finalLat = `0${lng[0]}.${lng[1]}`;
            } else {
                finalLong = `${lng[0]}.${lng[1]}`;
            };

            coordinates.push(`${finalLat}, ${finalLong}`);
            // coordinates.push(`${data?.lat.toFixed(6)}, ${data?.lng.toFixed(6)}`)
        });

        setCoords(coordinates);

        setForm({
            ...form,
            geoName: geoName,
            placeName: placeName,
            geofenceType: selectedCategory?.value,
            coordinates: coordinates
        });
    }, [selectedCoordinates, geoName, placeName, selectedCategory]);


    useEffect(() => {
        setPreviousValues({
            ...form,
            geoName: geoName,
            placeName: placeName,
            geofenceType: selectedCategory?.value,
            // coordinates: coordinates,
        });
    }, []);

    const handleUpdate = () => {
        if (selectedCategory?.value === null) {
            ErrorToast("Select Category")
        } else {
            if (selectedCategory?.value === 'Reach Point' || selectedCategory?.value === 'Parking') {

                const arraysAreEqual = polygonData?.coordinates.every(coord => coords.includes(coord));

                const form = [
                    polygonData,
                    {
                        createdByUserId: loggedInUser,
                        ...(placeName !== polygonData?.placeName && { placeName: placeName }),
                        ...(selectedCategory?.value !== polygonData?.geofenceType && { geofenceType: selectedCategory?.value }),
                        ...((!arraysAreEqual) && { coordinates: coords })
                    }
                ];

                updatePolygonArea(form).then((response) => {
                    if (response?.status === 200) {
                        SuccessToast("Polygon area Updated");
                        navigate('/polygon');
                    } else {
                        ErrorToast("")
                    }
                }).catch((err) => ErrorToast(err?.message));
            } else if (geoName.length > 0) {

                const arraysAreEqual = polygonData?.coordinates.every(coord => coords.includes(coord));

                const form = [
                    polygonData,
                    {
                        createdByUserId: loggedInUser,
                        ...(geoName !== polygonData?.geoName && { geoName: geoName }),
                        ...(placeName !== polygonData?.placeName && { placeName: placeName }),
                        ...(selectedCategory?.value !== polygonData?.geofenceType && { geofenceType: selectedCategory?.value }),
                        ...((((selectedCategory?.value === 'Dealer') && (selectedParty?.value !== polygonData?.dealerOEM))) && { dealerOEM: selectedParty?.value }),
                        ...((!arraysAreEqual) && { coordinates: coords })
                    }
                ];

                updatePolygonArea(form).then((response) => {
                    if (response?.status === 200) {
                        SuccessToast("Polygon area Updated");
                        navigate('/polygon');
                    } else {
                        ErrorToast("")
                    }
                }).catch((err) => {
                    err?.response?.data ? ErrorToast(err?.response?.data) : ErrorToast(err?.message);
                });
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeStep === 0) {
            placeName.length === 0 ? setActiveStep(0) : setActiveStep(1);
        } else if (activeStep === 1) {
            selectedCoordinates.length === 0 ? setActiveStep(1) : setActiveStep(2);
            selectedCoordinates.length === 0 && ErrorToast("Select Coordinates");
        } else if (activeStep === 2) {
            selectedCategory?.label === undefined && selectedCategory.label !== 'Dealer' ? setActiveStep(2) : setActiveStep(3);

            if (selectedCategory?.label === undefined) {
                setActiveStep(2);
            } else if (selectedCategory?.label !== 'Dealer') {
                setActiveStep(2);
                handleUpdate();
            }
            else if (selectedCategory?.label === 'Dealer') {
                setActiveStep(3);
            }
        } else if (activeStep === 3) {
            handleUpdate();
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
        } else if (selectedPolygonType === '') {
            return center
        }
    }

    const steps = [
        {
            label: 'Place',
            content: (
                <>
                    <Input className="py-2" label="Place" type="text" name="placeName" value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Place Name" required={true} />
                </>
            ),
        },
        {
            label: 'Polygon',
            content: (
                <>
                    <Form.Label className='thm-dark'>{
                        selectedCoordinates.length > 0 ? "Selected Coordinates" : 'Polygon Type'
                    }</Form.Label>
                    {
                        selectedCoordinates.length > 0 ? (
                            <div className='rounded px-3 py-2 d-flex justify-content-start thm-dark align-items-start my-2 flex-column'
                                style={{ border: '1px solid #000' }}
                            >
                                {
                                    selectedCoordinates.map((data, index) => (
                                        <div key={index}>
                                            <span className='m-0 p-0'>{data?.lat.toFixed(6)}, </span>
                                            <span className='m-0 p-0 ps-3'>{data?.lng?.toFixed(6)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : null
                    }
                </>
            ),
        },
        {
            label: 'Details',
            content: (
                <>
                    <div style={{ zIndex: '1500 !important' }}>
                        <Form.Label className='thm-dark'>Category</Form.Label>
                        <Select
                            options={allCategories}
                            value={selectedCategory}
                            onChange={handleSelectCtegory}
                            isClearable={true}
                            styles={selectStyles}
                        />
                    </div>

                    {
                        (selectedCategory?.value === "Dealer" || selectedCategory?.value === "Plant") ? (
                            <div>
                                {
                                    selectedCategory?.value === 'Dealer' ? (
                                        <Col sm={12} className='mt-3'>
                                            <Input className="py-2" label="Dealer" type="text" value={geoName} name="geoName" onChange={(e) => setGeoName(e.target.value)} placeholder="Dealer" required={true} />
                                        </Col>
                                    ) : (
                                        <Col sm={12} className='mt-3'>
                                            <Input className="py-2" label="Plant" type="text" value={geoName} name="geoName" onChange={(e) => setGeoName(e.target.value)} placeholder="Plant" required={true} />
                                        </Col>
                                    )
                                }
                            </div>
                        ) : null
                    }
                </>
            ),
        },
        {
            label: 'OEM Name',
            content: (
                <div style={{ zIndex: '1500 !important' }}>
                    <Form.Label className='thm-dark'>Category</Form.Label>
                    <Select
                        options={partiesList}
                        value={selectedParty}
                        onChange={handleSelectParty}
                        isClearable={true}
                        styles={selectStyles}
                    />
                </div>
            ),
        },
    ];

    const [activeStep, setActiveStep] = useState(0);

    const [selectedPolygonType, setSelectedPolygonType] = useState('');

    const allPolygonTypesOptions = [
        { label: 'Polygon', icon: <IoTriangleOutline /> },
        { label: 'Circle', icon: <FaRegCircle /> },
    ];

    const handleSelectActiveStep = (label) => {
        if (label === 'Place') {
            placeName.length > 0 && setActiveStep(0);
        } else if (label === 'Polygon') {
            placeName.length > 0 && setActiveStep(1);
        } else if (label === 'Details') {
            (placeName.length > 0 && selectedCoordinates.length > 0) && setActiveStep(2);
        } else if (label === 'OEM Name') {
            selectedCategory?.label === 'Dealer' && setActiveStep(3);
        }
    };

    const [center, setCenter] = useState({ lat: 26.858192, lng: 75.669163 });
    const mapRef = useRef(null);
    const getBounds = () => {
        const bounds = new window.google.maps.LatLngBounds();
        selectedCoordinates.forEach((marker) => {
            bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
        });
        return bounds;
    };

    const handleLoad = (map) => {
        mapRef.current = selectedCoordinates.length > 0 && map;
        const bounds = selectedCoordinates.length > 0 && getBounds();
        selectedCoordinates.length > 0 && map.fitBounds(bounds);
        const newCenter = selectedCoordinates.length > 0 && bounds.getCenter().toJSON();
        selectedCoordinates.length > 0 && setCenter(newCenter);
    };

    useEffect(() => {
        if (mapRef.current) {
            const bounds = getBounds();
            selectedCoordinates.length > 0 && mapRef.current.fitBounds(bounds);
            const newCenter = selectedCoordinates.length > 0 && bounds.getCenter().toJSON();
            selectedCoordinates.length > 0 && setCenter(newCenter);
            mapRef.current.setZoom(15);
        }
    }, []);

    const enterFullscreen = () => {
        const elem = fullScreen.current;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    };

    const handleMarkerDragEnd = (index, e) => {
        const { lat, lng } = e.latLng.toJSON();

        const updatedCoordinates = [...selectedCoordinates];

        if (index === 0 || index === selectedCoordinates.length - 1) {
            updatedCoordinates[0] = { lat, lng };
            updatedCoordinates[selectedCoordinates.length - 1] = { lat, lng };
        } else {
            updatedCoordinates[index] = { lat, lng };
        }

        setSelectedCoordinates(updatedCoordinates);
    }

    return (
        <Modal show={true} fullscreen centered onHide={() => {
            localStorage.removeItem('polygonData');
            navigate('/polygon');
        }} size='xl'
            className='w-100 p-5'>
            <Modal.Header closeButton>
                <Modal.Title className='thm-dark w-100 text-center'>{'Update Polygon'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='px-5'>
                    <div>
                        <Row>
                            <Col sm={12} md={12} lg={3} className='m-0 p-0'>
                                <Card>
                                    <Form onSubmit={handleSubmit}>
                                        <Box sx={{ maxWidth: 400 }}>
                                            <Stepper activeStep={activeStep} orientation="vertical">
                                                {steps.map((step, index) => {

                                                    if (step.label === 'OEM Name' && selectedCategory?.label !== 'Dealer') {
                                                        return null;
                                                    }

                                                    return (
                                                        <Step key={step.label}>
                                                            <StepLabel onClick={() => handleSelectActiveStep(step.label)} className='cursor-pointer'>{step.label}</StepLabel>
                                                            <StepContent>
                                                                {step.content}
                                                                <div className='mt-3'>
                                                                    {
                                                                        index > 0 && (
                                                                            <Button
                                                                                type="button"
                                                                                disabled={index === 0}
                                                                                onClick={() => setActiveStep(activeStep - 1)}
                                                                                className="py-1 px-3 me-2"
                                                                            >
                                                                                Back
                                                                            </Button>
                                                                        )
                                                                    }
                                                                    <ColoredButton
                                                                        variant="contained"
                                                                        type="submit"
                                                                        className="py-1 px-2"
                                                                    >
                                                                        {(activeStep === 2 && selectedCategory?.label !== 'Dealer') ? 'Update' :
                                                                            (activeStep === 2 && selectedCategory?.label === 'Dealer') ? 'Continue' :
                                                                                activeStep === 3 ? 'Update' : "Continue"}

                                                                        {/* {activeStep == 2 ? 'Update' : 'Continue'} */}
                                                                    </ColoredButton>
                                                                </div>
                                                            </StepContent>
                                                            {

                                                            }
                                                        </Step>
                                                    )
                                                }
                                                )}

                                            </Stepper>
                                        </Box>
                                    </Form>
                                </Card>
                            </Col>

                            <Col sm={12} md={12} lg={9} className='position-relative' style={{ height: "75vh" }}>
                                {
                                    activeStep === 1 ? (
                                        <ul className='position-absolute bg-white m-0 p-0' style={{ listStyleType: "none", left: 20, top: 200, zIndex: 1 }}>
                                            {
                                                allPolygonTypesOptions.map((data, index) => (
                                                    <li className={`${selectedPolygonType === data?.label ? 'polygon-types-active' : 'polygon-types'} py-2 ps-2 pe-5 d-flex justify-content-start cursor-pointer`}
                                                        onClick={() => {
                                                            setSelectedPolygonType(data?.label);
                                                            setSelectedCoordinates([]);
                                                            setIsPolygonClosed(false);
                                                        }} key={index}
                                                    >
                                                        {data?.icon}
                                                        <span className='ms-3'>{data?.label}</span>
                                                    </li>
                                                ))

                                            }
                                        </ul>
                                    ) : null
                                }
                                <div ref={fullScreen} style={{ width: '100%', minHeight: "50vh", height: isFullScreen ? '100vh' : '100%' }}>
                                    <div className='d-flex justify-conten-end align-items-start flex-row position-absolute' style={{ top: 10, right: 20 }}>
                                        <Tooltip title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'} style={{ zIndex: 1, }}>
                                            <Link to="#" className='thm-dark me-3 bg-white p-2 rounded cursor-pointer d-flex justify-content-between align-items-start text-decoration-none'
                                                onClick={handleFullscreen}
                                            >
                                                <RxEnterFullScreen className='fs-4' />
                                            </Link>
                                        </Tooltip>
                                        {
                                            selectedCoordinates.length > 0 ? (
                                                <div className='me-3 bg-white p-2 rounded cursor-pointer d-flex justify-content-between align-items-start'
                                                    onClick={() => {
                                                        setSelectedCoordinates([]);
                                                        setIsPolygonClosed(false);
                                                    }}
                                                    style={{ width: '200px', zIndex: 1 }}
                                                >
                                                    <p className='m-0 p-0'>Clear Coordinates</p>
                                                    <RxCross1 />
                                                </div>
                                            ) : null
                                        }

                                        <div className='bg-white px-3 py-2 thm-dark rounded' style={{ zIndex: 1, }}>
                                            <Form onSubmit={handleSearchByCoords}>
                                                <Input label="Search By Coordinates" type="search" onChange={handleChangeSearchCoords} placeholder="Ex: 20.876787, 70.984886" />
                                            </Form>
                                        </div>
                                    </div>

                                    {
                                        isLoaded ? (
                                            <GoogleMap
                                                mapContainerStyle={mapContainerStyle}
                                                center={handleMapCenter()}
                                                // onZoomChanged={}
                                                zoom={11}
                                                onLoad={handleLoad}
                                                onClick={handleMapClick}
                                                options={{ gestureHandling: 'greedy' }}
                                                style={{ cursor: isDrawing ? 'grab' : 'grab' }}
                                            >
                                                {
                                                    (selectedPolygonType === 'Polygon' && selectedCoordinates.length > 0) ? (
                                                        <>
                                                            {selectedCoordinates.length > 1 && (
                                                                <PolylineF
                                                                    path={selectedCoordinates}
                                                                    options={{
                                                                        strokeColor: 'red',
                                                                        strokeOpacity: 0.8,
                                                                        strokeWeight: 2,
                                                                    }}
                                                                />
                                                            )}

                                                            {isPolygonClosed && (
                                                                <PolygonF
                                                                    paths={selectedCoordinates}
                                                                    options={{
                                                                        fillColor: 'rgba(255, 0, 0, 0.2)',
                                                                        strokeColor: 'red',
                                                                        strokeOpacity: 0.8,
                                                                        strokeWeight: 2,
                                                                    }}
                                                                />
                                                            )}

                                                            {selectedCoordinates.length > 0 && selectedCoordinates.map((coord, index) => (
                                                                <MarkerF icon={{
                                                                    url: Circle,
                                                                    // scaledSize: new window.google.maps.Size(20, 20),
                                                                    // anchor: new window.google.maps.Point(10, 10), // Adjust the values to add margin from the top
                                                                }} key={index} position={coord} onClick={() => {
                                                                    index === 0 && setSelectedCoordinates([...selectedCoordinates, coord]);
                                                                    setIsPolygonClosed(true);
                                                                }}
                                                                    draggable={true}
                                                                    onDragEnd={(e) => handleMarkerDragEnd(index, e)}
                                                                />
                                                            ))}
                                                        </>
                                                    ) : (selectedPolygonType === 'Circle' && selectedCoordinates.length > 0) ? (
                                                        <>
                                                            <CircleF options={{
                                                                center: selectedCoordinates[0],
                                                                radius: 3500,
                                                                fillColor: 'rgba(255, 0, 0, 0.2)',
                                                                strokeColor: 'red',
                                                                strokeOpacity: 0.8,
                                                                strokeWeight: 2,
                                                            }} />
                                                            <MarkerF position={selectedCoordinates[0]} />
                                                        </>
                                                    ) : selectedCoordinates.length === 0 ? (
                                                        <MarkerF position={handleMapCenter()} />
                                                    ) : null
                                                }
                                            </GoogleMap>
                                        ) : <></>
                                    }
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Modal.Body>
        </Modal >
    )
};

export default UpdatePolygon
