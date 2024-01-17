import React, { useEffect, useState } from 'react';
import '../../assets/styles/polygon.css';
import { Col, Row } from 'react-bootstrap';
import { Tooltip } from '@mui/material';
import Card from '../../components/Card/card';
import { GoogleMap, LoadScript, MarkerF, PolygonF } from '@react-google-maps/api';
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

    const [selectedPolygon, setSelectedPolygon] = useState('Polygon 1');

    useEffect(() => {
        getPolygonCategories().then((response) => {
            // console.log("response", response);
            (response.status === 200) ? setAllCategories(response?.data) : setAllCategories([]);
        }).catch(() => setAllCategories([]))
    }, []);

    useEffect(() => {
        getAllPolygonAreas().then((response) => {
            if (response.status === 200) {
                // console.log("response", response);
                setAllPolygonAreas(response?.data);
                const filteredAreas = response?.data.filter(data => data?.geofenceType === 'Dealer');
                console.log("test", filteredAreas[0].coordinates[0].split(','));
                const coordinates = filteredAreas[0].coordinates[0];
                const coordArr = coordinates.split(',');
                // console.log("coordArr", response?.data[0]?.coordinates);
                setSelectedCoordinates({
                    lat: parseFloat(coordArr[0]),
                    long: parseFloat(coordArr[1])
                });

                setCategoryPolygons(filteredAreas);
            }
            else {
                setAllPolygonAreas([]);
            }
        }).catch(() => setAllPolygonAreas([]))
    }, []);

    console.log("selected coords", selectedCoordinates);

    useEffect(() => {
        const filteredAreas = allPolygonAreas.filter(data => data?.geofenceType === selectedCategory);
        setCategoryPolygons(filteredAreas);
    }, [selectedCategory]);

    console.log("polygons", categoryPolygons);

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

    const coordinates = [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7833, lng: -122.4167 },
        { lat: 37.7819, lng: -122.4301 },
        { lat: 37.7705, lng: -122.4311 },
    ];

    const defaultCenter = {
        lat: coordinates[0].lat,
        lng: coordinates[0].lng,
    };

    const handleSelectPolygonAres = (area) => {

    }

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
                                        onClick={() => setSelectedCategory(data)}
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
                                    <div className={`p-0 cursor-pointer ${selectedPolygon === data?.geofenceType ? 'active-category' : 'category'} d-flex justify-content-between align-items-center`} key={index}>
                                        <p className="m-0 p-0 py-2 ps-2 pe-5"
                                        // onClick={() => setSelectedPolygon(data)}
                                        >{data?.geoName}</p>
                                        <Tooltip title="Edit" key="edit">
                                            <Link to="#" className='text-decoration-none'>
                                                <CiEdit className={`me-2 fs-5 ${selectedPolygon === data ? 'thm-white' : 'thm-dark'}`} />
                                            </Link>
                                        </Tooltip>
                                    </div>
                                ))
                            }
                        </div>
                    </Card>
                </Col>
                {/* <Col sm={3} className='pe-5'>

                        </Col> */}
                <Col sm={9} className=''>
                    <LoadScript googleMapsApiKey={key}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={selectedCoordinates}
                            zoom={12}
                        >
                            <PolygonF
                                paths={selectedCoordinates}
                                options={{
                                    fillColor: 'rgba(255, 0, 0, 0.2)', // Transparent red
                                    strokeColor: 'red',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                }}
                            />
                        </GoogleMap>
                    </LoadScript>
                </Col>
            </Row>
        </div>
    )
}

export default PolygonList
