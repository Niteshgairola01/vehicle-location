import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import '../../assets/styles/polygon.css';
import { Col, Row } from 'react-bootstrap';
import { Tooltip } from '@mui/material';
import Card from '../../components/Card/card';
import { CircleF, GoogleMap, LoadScript, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api';
import Button from '../../components/Button/hoveredButton';
import { CiEdit } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom';
import { getAllPolygonAreas, getPolygonCategories } from '../../hooks/polygonHooks';
import DashHead from '../../components/dashboardHead';
import { SearchField } from '../../components/form/Input';
import { getAllPartiesList } from '../../hooks/clientMasterHooks';

const PolygonList = () => {

    const [allCategories, setAllCategories] = useState([]);
    const [allPolygonAreas, setAllPolygonAreas] = useState([]);
    const [categoryPolygons, setCategoryPolygons] = useState([]);
    const [filteredPolygons, setFilteredPolygons] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Dealer');
    const [selectedCoordinates, setSelectedCoordinates] = useState([]);
    const [selectedPolygon, setSelectedPolygon] = useState({});
    const [searchPolygon, setSearchPolygon] = useState('');
    const [searchOEM, setSearchOEM] = useState('');
    const [selectedParty, setSelectedParty] = useState('');

    const [center, setCenter] = useState({ lat: 26.858192, lng: 75.669163 });
    const loggedInUser = localStorage.getItem('userId');
    const navigate = useNavigate();

    const [partiesList, setPartiesList] = useState([]);
    // const [map, setMap] = useState(null);

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: key
    });


    const [mapLoaded, setMapLoaded] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setMapLoaded(false); // Clean up when component unmounts
        }, 1000);
    }, []);

    useEffect(() => {
        if (!loggedInUser) {
            localStorage.clear();
            navigate('/');
        }
    }, []);


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
                setFilteredPolygons(filteredAreas);
                setAllPolygonAreas(response?.data);
            }
            else {
                setAllPolygonAreas([]);
            }
        }).catch(() => setAllPolygonAreas([]))
    }, []);

    // useEffect(() => {
    //     let filteredAreas = [];
    //     filteredAreas = allPolygonAreas.filter(data => data?.geofenceType === selectedCategory);
    //     console.log("filteredAreas", filteredAreas);
    //     setFilteredPolygons(filteredAreas);
    // }, [selectedCategory]);

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        setSearchPolygon('');
        setSearchOEM('');
        const polygonAreas = allPolygonAreas.filter(data => data?.geoName === category);

        // allPolygonAreas.map(data => {
        //     console.log("plygons", category);
        //     console.log("geofence", data?.geofenceType);
        // })
        const filteredAreas = allPolygonAreas.filter(data => data?.geofenceType === category);
        console.log("filtered", filteredAreas);
        // let filteredAreas = [];
        // filteredAreas = allPolygonAreas.filter(data => data?.geofenceType === category);
        // console.log("filteredAreas", filteredAreas);
        setFilteredPolygons(filteredAreas);

        setCategoryPolygons(filteredAreas);
        // setFilteredPolygons(polygonAreas);
    };

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

    const handleSearchPolygon = (e) => {
        const searchValue = e.target.value;
        setSearchPolygon(searchValue);
        const filtereds = categoryPolygons.filter(data =>
        ((data?.geoName && data?.geoName.toLowerCase().includes(searchValue.toLowerCase())) ||
            (data?.placeName && data?.placeName.toLowerCase().includes(searchValue.toLowerCase())))
        );

        setFilteredPolygons(filtereds);
    };

    const handleChangeParty = (party) => {
        setSelectedParty(party);

        const searchValue = party?.value;

        if (searchValue) {
            setSearchOEM(searchValue);
            const filteredByOEM = allPolygonAreas.filter(data =>
                ((data?.dealerOEM && data?.dealerOEM.toLowerCase().includes(searchValue.toLowerCase())))
            );

            setCategoryPolygons(filteredByOEM);
            setFilteredPolygons(filteredByOEM);
        } else {
            const filteredByOEM = allPolygonAreas.filter(data =>
                ((data?.dealerOEM && data?.dealerOEM.toLowerCase().includes(''.toLowerCase())))
            );

            setCategoryPolygons(filteredByOEM);
            setFilteredPolygons(filteredByOEM);
        }



    }

    const handleSearchOEM = (e) => {
        const searchValue = e.target.value;
        setSearchOEM(searchValue);
        const filteredByOEM = allPolygonAreas.filter(data =>
            ((data?.dealerOEM && data?.dealerOEM.toLowerCase().includes(searchValue.toLowerCase())))
        );

        setCategoryPolygons(filteredByOEM);
        setFilteredPolygons(filteredByOEM);
    };


    const getBounds = () => {
        const bounds = new window.google.maps.LatLngBounds();
        selectedCoordinates.forEach((marker) => {
            bounds.extend(marker?.position);
        });

        return bounds;
    };

    const handleMapCenter = () => {
        return selectedCoordinates.length > 0 ? selectedCoordinates[0] : center;
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
    };


    return (
        <div className='m-0 p-0 position-relative'>
            <div className='mt-5 my-3 px-5 pt-2 pb-5 bg-white rounded dashboard-main-container'>
                <div className='w-100'>
                    <DashHead title="Polygon" />
                    <div className='m-0 p-0 position-relative'>

                        <div className='my-3 d-flex justify-content-end align-items-center'>
                            {
                                selectedPolygon?.placeName ? (
                                    <div className='thm-dark me-3'>
                                        <span>{selectedPolygon?.geoName}{`${selectedPolygon?.geoName ? ',' : ''}`} </span>
                                        <span className='ps-1'>{selectedPolygon?.placeName}</span>
                                    </div>
                                ) : null
                            }

                            <Link to='/create-polygon'>
                                <Button className="px-3">Create New</Button>
                            </Link>
                        </div>
                        <Row className='mt-0'>
                            <Col sm={4} className='pe-5'>
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
                                    <div className='w-100 d-flex justify-content-start align-items-center'>
                                        <h6 className='thm-dark w-25'>Polygons</h6>
                                        {
                                            selectedCategory !== 'Dealer' ? (
                                                <SearchField onChange={handleSearchPolygon} value={searchPolygon} type='search' className="w-75" placeholder="Search Polygon" />
                                            ) : null
                                        }
                                    </div>


                                    <div className='w-100 d-flex justify-content-start align-items-center'>
                                        {
                                            selectedCategory === 'Dealer' ? (
                                                <>
                                                    <div className='w-50 me-2'>
                                                        <Select
                                                            options={partiesList}
                                                            value={selectedParty}
                                                            onChange={handleChangeParty}
                                                            isClearable={true}
                                                            styles={selectStyles}
                                                            placeholder="Search OEM"
                                                        />
                                                    </div>
                                                    {/* <SearchField onChange={handleSearchOEM} value={searchOEM} type='search' className="w-50 me-2" placeholder="Search OEM" /> */}
                                                    <SearchField onChange={handleSearchPolygon} value={searchPolygon} type='search' className="w-50" placeholder="Search Polygon" />
                                                </>
                                            ) : null
                                        }
                                    </div>

                                    <hr />
                                    <div className='mt-2 polygons-list'>
                                        {
                                            filteredPolygons.map((data, index) => (
                                                <div className={`p-0 cursor-pointer ${selectedPolygon === data ? 'active-category' : 'category'} d-flex justify-content-between align-items-center`} key={index}>
                                                    <p className="m-0 p-0 py-2 ps-2 pe-5" onClick={() => handleSelectPolygon(data)}>
                                                        {data?.geoName === null || data?.geoName === '' ? '' : `${data?.geoName}, `}{data?.placeName}
                                                    </p>
                                                    <Tooltip title="Edit" key="edit">
                                                        <Link to="/editPolygon" className='text-decoration-none' state={data}>
                                                            <CiEdit className={`me-2 fs-5 ${selectedPolygon === data ? 'thm-white' : 'thm-dark'}`} />
                                                        </Link>
                                                    </Tooltip>
                                                </div>
                                            ))
                                        }
                                        {
                                            filteredPolygons.length === 0 ? (
                                                <div className='w-100 text-center text-secondary'>
                                                    No polygon areas found
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                </Card>
                            </Col>
                            <Col sm={8} className='' style={{ minHeight: "50vh", height: "65vh" }}>
                                {
                                    isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={handleMapCenter()}
                                            onLoad={(map) => {
                                                const bounds = selectedCoordinates.length < 0 && getBounds();
                                                selectedCoordinates.length < 0 && map.fitBounds(bounds);
                                                selectedCoordinates.length < 0 && setCenter(map.getCenter);
                                            }}
                                            zoom={12}
                                            options={{ gestureHandling: 'greedy' }}
                                        >
                                            {
                                                selectedCoordinates.length === 1 ? (
                                                    <>
                                                        <CircleF
                                                            center={selectedCoordinates[0]}
                                                            radius={3500}
                                                            options={{
                                                                fillColor: 'rgba(255, 0, 0, 0.2)',
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
                                    ) : <></>
                                }
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PolygonList
