import React, { useEffect, useState } from 'react'
import { CircleF, GoogleMap, LoadScript, MarkerF, PolygonF } from '@react-google-maps/api';
import Button from '../../components/Button/hoveredButton'
import ColoredButton from '../../components/Button/coloredButton'
import { Col, Form, Row } from 'react-bootstrap'
import Card from '../../components/Card/card'
import Select from 'react-select';
import { Input } from '../../components/form/Input';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';
import { createNewPolygonArea } from '../../hooks/polygonHooks';
import { RxCross1 } from "react-icons/rx";

const CreatePolygon = ({ setCurrentPage }) => {

    const [form, setForm] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCoordinates, setSelectedCoordinates] = useState([]);
    const [finalCoords, setFinalCoords] = useState([]);
    const [shape, setShape] = useState('');
    const [searchCoords, setSearchCoords] = useState([]);
    const [searchLatLong, setSearchLatLong] = useState({});

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    // useEffect(() => {
    //     const handleUndo = (event) => {
    //         if (event.ctrlKey && event.key === 'z') {
    //             const previousCoords = selectedCoordinates;
    //             previousCoords.pop();
    //             console.log("prev coords", previousCoords);
    //             setSelectedCoordinates(previousCoords);

    //             // console.log("undo");
    //         }
    //     };

    //     window.addEventListener('keydown', handleUndo);

    //     return () => {
    //         window.removeEventListener('keydown', handleUndo);
    //     }
    // });



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

        setForm({
            ...form,
            geoName: '',
            geofenceType: category?.value
        });
    };

    const handleSelectPolygonType = (type) => {
        setShape(type);
        setSelectedCoordinates([]);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
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
            finalCoords.length <= 1 ? setFinalCoords((prevPlaces) => [...prevPlaces, clickedPlace])
                : setFinalCoords((prevPlaces) => [...prevPlaces, clickedPlace, finalCoords[0]]);
        }
    };

    useEffect(() => {
        let coordinates = [];
        finalCoords.map((data) => {
            coordinates.push(`${data?.lat.toFixed(6)}, ${data?.lng.toFixed(6)}`)
        });

        setForm({
            ...form,
            coordinates: coordinates
        });

    }, [finalCoords]);

    const getPolygonPath = () => {
        return selectedCoordinates.map((place) => ({ lat: place.lat, lng: place.lng }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCategory.length === 0) {
            ErrorToast("Select Coordinates")
        } else {
            if (shape === 'Polygon' && selectedCategory.length < 3) {
                ErrorToast("Polygon is not closed")
            } else {
                createNewPolygonArea(form).then((response) => {
                    if (response?.status === 200) {
                        SuccessToast("New polygon area created");
                        setCurrentPage("List")
                    } else {
                        ErrorToast("")
                    }
                }).catch((err) => ErrorToast(err?.message))
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
        const coordinates = targetValue.split(', ');
        setSearchCoords(targetValue.split(', '));
    }

    console.log("search coords", searchCoords);

    const handleMapCenter = () => {
        if (searchLatLong?.lat && selectedCoordinates.length === 0) {
            console.log("data", searchLatLong);
            return searchLatLong;
        } else {
            return selectedCoordinates.length > 0 ? selectedCoordinates[0] : { lat: 26.858192, lng: 75.669163 }
        }
    }

    return (
        <div>
            <div className='my-3 d-flex justify-content-end align-items-end'>
                <Button className="px-3" onClick={() => setCurrentPage('List')}>Back</Button>
            </div>
            <Row>
                <Col sm={12} md={12} lg={4} className='pe-3'>
                    <Card>
                        <h6 className='thm-dark'>Create New Polygon</h6>
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
                                <Input className="py-2" label="Place" type="text" name="placeName" onChange={handleChange} placeholder="Place Name" />
                            </Col>

                            {
                                (selectedCategory?.value === "Dealer" || selectedCategory?.value === "Plant") ? (
                                    <div>
                                        {
                                            selectedCategory?.value === 'Dealer' ? (
                                                <Col sm={12} className='mt-3'>
                                                    <Input className="py-2" label="Dealer" type="text" value={form?.geoName} name="geoName" onChange={handleChange} placeholder="Delaer" />
                                                </Col>
                                            ) : (
                                                <Col sm={12} className='mt-3'>
                                                    <Input className="py-2" label="Plant" type="text" value={form?.geoName} name="geoName" onChange={handleChange} placeholder="Plant" />
                                                </Col>
                                            )
                                        }
                                    </div>
                                ) : null
                            }

                            <div className='mt-5 d-flex justify-content-center align-items-center'>
                                <ColoredButton className="px-5 w-75 py-1" type="submit">Create</ColoredButton>
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
                                        selectedCoordinates.map((data, index) => (
                                            <div className='thm-dark d-flex justify-content-between align-items-center' key={index} style={{ width: "80%" }}>
                                                <span>{data?.lat.toFixed(6)}</span>
                                                <span>{data?.lng.toFixed(6)}</span>
                                            </div>
                                        ))
                                    }
                                    {
                                        selectedCoordinates.length === 0 ? (
                                            <div className='thm-dark d-flex justify-content-between align-items-center' style={{ width: "80%" }}>
                                                {/* <span>Select Coordinaes</span> */}
                                                <p className='m-0 p-0 text-secondary'>Selected Coordinates</p>
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                        </Col>
                    </Card>
                </Col>
                <Col sm={12} md={12} lg={8} className='position-relative' style={{ height: "65vh" }}>
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
                        >
                            {
                                shape.value === 'Polygon' ? (
                                    <PolygonF
                                        path={getPolygonPath()}
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
    )
}

export default CreatePolygon
