import React, { useEffect, useState } from 'react'
import { CircleF, GoogleMap, LoadScript, MarkerF, PolygonF, PolylineF } from '@react-google-maps/api';
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
import StepForm from './stepForm';
import { IoTriangleOutline } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";


// MUI form
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
// import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';


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

    const [selectedStep, setSelectedStep] = useState(1);

    const [showModal, setShowModal] = useState(true);

    const [cursorCoordinate, setCursorCoordinate] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

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

                // const firstCoord = previousCoords[1].split(', ');
                // previousCoords.push({
                //     lat: parseFloat(firstCoord[0]),
                //     lat: parseFloat(firstCoord[2]),
                // })
            };

            setPlaceName(editData?.placeName);
            setGeoName(editData?.geoName);
            setPolygonCategory(editData?.geofenceType);
        }
    }, [editData]);

    const getPolygonPath = () => {
        return selectedCoordinates.map((place) => ({ lat: place.lat, lng: place.lng }));
    };

    // useEffect(() => {
    //     const handleUndo = (event) => {
    //         if (event.ctrlKey && event.key === 'z') {
    //             const previousCoords = selectedCoordinates;
    //             previousCoords.pop();
    //             setSelectedCoordinates(previousCoords);
    //         }
    //     };

    //     window.addEventListener('keydown', handleUndo);

    //     return () => {
    //         window.removeEventListener('keydown', handleUndo);
    //     }
    // });

    // useEffect(() => {
    //     getPolygonPath();
    // }, [selectedCoordinates]);

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
        menu: provided => ({ ...provided, zIndex: 9999 })
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
        if (selectedPolygonType === "") {
            ErrorToast('Select Polygon Type First')
        } else {
            const clickedCoordinate = { lat: event.latLng.lat(), lng: event.latLng.lng() };

            setSelectedCoordinates([...selectedCoordinates, clickedCoordinate]);
            setFinalCoords([...selectedCoordinates, clickedCoordinate]);

            // if (!isDrawing) {
            //     setSelectedCoordinates([clickedCoordinate]);
            //     setIsDrawing(true);
            // } else {
            //     // Avoid adding the same coordinate again on double-click
            //     if (!selectedCoordinates.some(coord => coord.lat === clickedCoordinate.lat && coord.lng === clickedCoordinate.lng)) {
            //         setSelectedCoordinates((prevCoordinates) => [...prevCoordinates, clickedCoordinate]);
            //     }
            // }
        }
    };

    const handleMapDoubleClick = () => {
        if (isDrawing && selectedCoordinates.length > 2) {
            setIsDrawing(false);
        }
    };

    const handleCursorMove = (event) => {
        if (isDrawing) {
            setCursorCoordinate({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        }
    };


    const calculateDistance = (coord1, coord2) => {
        const latDiff = Math.abs(coord1.lat - coord2.lat);
        const lngDiff = Math.abs(coord1.lng - coord2.lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsDrawing(false);
                setSelectedCoordinates([]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDrawing]);

    const staticPolylinePath = [...selectedCoordinates, selectedCoordinates[0]]; // Closing the polygon
    const dynamicPolylinePath = isDrawing
        ? [...selectedCoordinates, cursorCoordinate].filter(Boolean)
        : [];

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

    // useState(() => {
    //     setCoords(selectedCoordinates);
    // }, [selectedCoordinates]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeStep === 0) {
            placeName.length === 0 ? setActiveStep(0) : setActiveStep(1);
        } else if (activeStep === 1) {
            selectedCoordinates.length === 0 ? setActiveStep(1) : setActiveStep(2);
            selectedCoordinates.length === 0 && ErrorToast("Select Coordinates");
        } else if (activeStep === 2) {
            if (selectedCategory?.value === null) {
                ErrorToast("Select Category")
            } else {
                if (selectedCategory?.value === 'Reach Point' || selectedCategory?.value === 'Parking') {
                    let testcoords = coords;
                    selectedCoordinates.length > 1 && testcoords.push(coords[0]);

                    const form = {
                        geoName: '',
                        placeName: placeName,
                        geofenceType: selectedCategory?.value,
                        coordinates: testcoords
                    };

                    createNewPolygonArea(form).then((response) => {
                        if (response?.status === 200) {
                            SuccessToast("New polygon area created");
                            setShowModal(false);
                        } else {
                            ErrorToast("")
                        }
                    }).catch((err) => ErrorToast(err?.message));
                } else if (geoName.length > 0) {
                    let testcoords = coords;
                    selectedCoordinates.length > 1 && testcoords.push(coords[0]);

                    const form = {
                        geoName: geoName,
                        placeName: placeName,
                        geofenceType: selectedCategory?.value,
                        coordinates: testcoords
                    }

                    createNewPolygonArea(form).then((response) => {
                        if (response?.status === 200) {
                            SuccessToast("New polygon area created");
                            setShowModal(false);
                        } else {
                            ErrorToast("")
                        }
                    }).catch((err) => {
                        err?.response?.data ? ErrorToast(err?.response?.data) : ErrorToast(err?.message);
                    });
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

    // Step form

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
                <Form.Label className='thm-dark'>Polygon Type</Form.Label>
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
                                            <Input className="py-2" label="Dealer" type="text" value={geoName} name="geoName" onChange={(e) => setGeoName(e.target.value)} placeholder="Delaer" required={true} />
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
    ];

    const [activeStep, setActiveStep] = useState(0);

    const [selectedPolygonType, setSelectedPolygonType] = useState('');

    const allPolygonTypesOptions = [
        { label: 'Polygon', icon: <IoTriangleOutline /> },
        { label: 'Circle', icon: <FaRegCircle /> },
    ];

    return (
        <Modal show={showModal} fullscreen centered onHide={() => {
            setForm({});
            // setShowModal(false);
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
                            <Col sm={12} md={12} lg={3} className='m-0 p-0'>
                                <Card>
                                    <Form onSubmit={handleSubmit}>
                                        <Box sx={{ maxWidth: 400 }}>
                                            <Stepper activeStep={activeStep} orientation="vertical">
                                                {steps.map((step, index) => (
                                                    <Step key={step.label}>
                                                        <StepLabel onClick={() => setActiveStep(index)} className='cursor-pointer'>{step.label}</StepLabel>
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
                                                                    // onClick={() => handleSubmit(activeStep + 1)}
                                                                    className="py-1 px-2"
                                                                >
                                                                    {activeStep == 2 ? 'Create' : 'Continue'}
                                                                </ColoredButton>
                                                            </div>
                                                        </StepContent>
                                                        {

                                                        }
                                                    </Step>
                                                ))}

                                            </Stepper>
                                            {/* {activeStep === steps.length && (
                                            <Paper square elevation={0} sx={{ p: 3 }}>
                                                <Typography>All steps completed - you&apos;re finished</Typography>
                                                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                                                    Reset
                                                </Button>
                                            </Paper>
                                        )} */}
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
                                                            setFinalCoords([]);
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
                                        onMouseMove={handleCursorMove}
                                        options={{ gestureHandling: 'greedy' }}
                                        style={{ cursor: isDrawing ? 'grab' : 'grab' }}
                                    >
                                        {
                                            selectedPolygonType === 'Polygon' ? (
                                                <>
                                                    <PolygonF
                                                        paths={[staticPolylinePath]}
                                                        options={{
                                                            fillColor: 'rgba(255, 0, 0, 0.2)',
                                                            strokeColor: 'red',
                                                            strokeOpacity: 0.8,
                                                            strokeWeight: 2,
                                                        }}
                                                    />
                                                    <PolylineF
                                                        path={dynamicPolylinePath}
                                                        options={{
                                                            strokeColor: 'red',
                                                            strokeOpacity: 0.8,
                                                            strokeWeight: 2,
                                                        }}
                                                    />
                                                    {selectedCoordinates.map((coordinate, index) => (
                                                        <React.Fragment key={index}>
                                                            {index === 0 ? (
                                                                <CircleF
                                                                    center={coordinate}
                                                                    radius={10}
                                                                    options={{
                                                                        fillColor: 'green',
                                                                        strokeColor: 'green',
                                                                        strokeOpacity: 0.8,
                                                                        strokeWeight: 2,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <MarkerF position={coordinate} />
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                    {/* <MarkerF position={coordinate} /> */}
                                                </>
                                            ) : selectedPolygonType === 'Circle' ? (
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
                                        {cursorCoordinate && <MarkerF position={cursorCoordinate} />}
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
