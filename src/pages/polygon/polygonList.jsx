import React, { useEffect, useState } from 'react';
import '../../assets/styles/polygon.css';
import { Col, Row } from 'react-bootstrap';
import { Tooltip } from '@mui/material';
import Card from '../../components/Card/card';
import { CircleF, GoogleMap, LoadScript, MarkerF, PolygonF } from '@react-google-maps/api';
import Button from '../../components/Button/hoveredButton';
import { CiEdit } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { getAllPolygonAreas, getPolygonCategories } from '../../hooks/ploygonHooks';


const PolygonList = ({ setCurrentPage }) => {

    const [allCategories, setAllCategories] = useState([]);
    const [allPolygonAreas, setAllPolygonAreas] = useState([]);
    const [categoryPolygons, setCategoryPolygons] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Dealer');
    const [selectedCoordinates, setSelectedCoordinates] = useState([]);
    const [selectedPolygon, setSelectedPolygon] = useState({});

    // const [selectedPolygon, setSelectedPolygon] = useState('Polygon 1');

    useEffect(() => {
        getPolygonCategories().then((response) => {
            (response.status === 200) ? setAllCategories(response?.data) : setAllCategories([]);
        }).catch(() => setAllCategories([]))
    }, []);

    useEffect(() => {
        getAllPolygonAreas().then((response) => {
            if (response.status === 200) {
                const filteredAreas = response?.data.filter(data => data?.geofenceType === 'Dealer');

                setCategoryPolygons(filteredAreas);
                filteredAreas?.length > 0 ? setSelectedPolygon(filteredAreas[0]) : setSelectedPolygon({});
                setAllPolygonAreas(response?.data);

                const formattedCoordinates = filteredAreas[0].coordinates.map(coord => {
                    const [lat, long] = coord.split(', ');
                    return {
                        lat: parseFloat(lat),
                        lng: parseFloat(long)
                    };
                });

                setSelectedCoordinates(formattedCoordinates);
            }
            else {
                setAllPolygonAreas([]);
            }
        }).catch(() => setAllPolygonAreas([]))
    }, []);


    useEffect(() => {
        const filteredAreas = allPolygonAreas.filter(data => data?.geofenceType === selectedCategory);
        setCategoryPolygons(filteredAreas);
    }, [selectedCategory]);

    // const allCatogories = ['Reach Point', 'Parking', 'Plan', 'Dealer'];
    const allPolygons = ['Polygon 1', 'Polygon 2', 'Polygon 3', 'Polygon 4', 'Polygon 5', 'Polygon 6', 'Polygon 7',
        'Polygon 8', 'Polygon 9', 'Polygon 10', 'Polygon 11', 'Polygon 12', 'Polygon 13', 'Polygon 14', 'Polygon 15',
        'Polygon 16', 'Polygon 17', 'Polygon 18', 'Polygon 19', 'Polygon 20'
    ];

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    // const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    const key = "ABC";

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        const polygonAreas = allPolygonAreas.filter(data => data?.geoName === category);
        setCategoryPolygons(polygonAreas);
    }

    const handleSelectPolygon = (polygon) => {
        setSelectedPolygon(polygon);
        const formattedCoordinates = polygon.coordinates.map(coord => {
            const [lat, long] = coord.split(', ');
            return {
                lat: parseFloat(lat),
                lng: parseFloat(long)
            };
        });

        setSelectedCoordinates(formattedCoordinates);
    };

    return (
        <div className='m-0 p-0 position-relative'>

            <div className='my-3 d-flex justify-content-end align-items-end'>
                <Button className="px-3" onClick={() => setCurrentPage('Create')}>Create New</Button>
            </div>
            <Row className=''>
                <Col sm={3} className='pe-5'>
                    <Card>
                        <h6 className='thm-dark'>Polygon Categories</h6>
                        <hr />
                        <div className='mt-2'>
                            {
                                allCategories.map((data, index) => (
                                    <p className={`cursor-pointer ${selectedCategory === data ? 'active-category' : 'category'}`} key={index}
                                        onClick={() => handleSelectCategory(data)}
                                    >{data}</p>
                                ))
                            }
                        </div>
                    </Card>

                    <Card>
                        <h6 className='thm-dark'>Polygons</h6>
                        <hr />
                        <div className='mt-2 polygons-list'>
                            {
                                categoryPolygons.map((data, index) => (
                                    <div className={`p-0 cursor-pointer ${selectedPolygon?.geoName === data?.geoName ? 'active-category' : 'category'} d-flex justify-content-between align-items-center`} key={index}>
                                        <p className="m-0 p-0 py-2 ps-2 pe-5"
                                            onClick={() => handleSelectPolygon(data)}
                                        // onClick={() => setSelectedPolygon(data)}
                                        >{data?.geoName ? data?.geoName : data?.placeName}</p>
                                        <Tooltip title="Edit" key="edit">
                                            <Link to="#" className='text-decoration-none'>
                                                <CiEdit className={`me-2 fs-5 ${selectedPolygon === data ? 'thm-white' : 'thm-dark'}`} />
                                            </Link>
                                        </Tooltip>
                                    </div>
                                ))
                            }
                            {
                                categoryPolygons.length === 0 ? (
                                    <div className='w-100 text-center text-secondary'>
                                        No polygon areas found
                                    </div>
                                ) : null
                            }
                        </div>
                    </Card>
                </Col>
                {/* <Col sm={3} className='pe-5'>

                        </Col> */}
                <Col sm={9} className='' style={{ height: "65vh" }}>
                    <LoadScript googleMapsApiKey={key}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={selectedCoordinates[0]}
                            zoom={12}
                        >
                            {
                                selectedCoordinates.length === 1 ? (
                                    <>
                                        <CircleF
                                            center={selectedCoordinates[0]}
                                            radius={500} // 500 meters radius (adjust as needed)
                                            options={{
                                                fillColor: 'rgba(255, 0, 0, 0.2)', // Transparent red
                                                strokeColor: 'red',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                            }}
                                        />

                                        <MarkerF position={selectedCoordinates[0]} />
                                    </>
                                ) : (
                                    <PolygonF
                                        paths={selectedCoordinates}
                                        options={{
                                            fillColor: 'rgba(255, 0, 0, 0.2)', // Transparent red
                                            strokeColor: 'red',
                                            strokeOpacity: 0.8,
                                            strokeWeight: 2,
                                        }}
                                    />
                                )
                            }
                        </GoogleMap>
                    </LoadScript>
                </Col>
            </Row>
        </div>
    )
}

export default PolygonList
