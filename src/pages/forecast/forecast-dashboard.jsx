import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Card from '../../components/Card/card';
import { Col, Form, Row } from 'react-bootstrap';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { getAllOfficesList } from '../../hooks/officeMasterHooks';
import '../../assets/styles/forecast.css';
import { CiEdit } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';

// Zone Data Component
const ZoneData = ({ zone, data, easternVehicles, westernVehicles, westernGujaratVehicles, northenVehicles, southernVehicles,
    selectedVehicleFromEast, selectedVehicleFromWest, selectedVehicleFromWestGujarat, selectedVehicleFromNorth, selectedVehicleFromSouth,
    handleSelectSearchedVehicle, handleSelectVehicle, vehiclesSelectedFromEast, vehiclesSelectedFromWest, vehiclesSelectedFromWestGujarat,
    vehiclesSelectedFromNorth, vehiclesSelectedFromSouth
}) => {

    const handleFormateISTDate = (givenDate) => {
        if (givenDate === null || givenDate.length === 0) {
            return givenDate;
        } else {
            const [datePart, timePart] = givenDate.split(' ');
            const [day, month, year] = datePart.split('/');
            const [hour, minute, second] = timePart.split(':');
            const newDate = givenDate.split(' ');
            const date = new Date(year, month - 1, day, hour % 12 + ((newDate[2] === 'PM') ? 12 : 0), minute, second);
            const dateTimeFormatted = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });

            const dateArr = dateTimeFormatted.split(', ');
            const formattedDate = dateArr.join(' ');

            const originalDate = new Date(formattedDate);

            const finalDay = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const finalMonth = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const finalYear = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;
            const finalFormattedDate = `${finalDay}/${finalMonth}/${finalYear} ${hours}:${minutes}:${seconds}`;

            return finalFormattedDate;
        };
    };

    const selectStyles = {
        control: (provided) => ({
            ...provided,
            fontSize: '0.7rem',
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '0.7rem',
        }),
        menu: provided => ({ ...provided, zIndex: 9999 })
    };

    return (
        <Col lg={6} className='h-100'>
            <Card className='h-100'>
                <div className='mb-2 d-flex justify-content-between align-items-center'>
                    <h6 className=''>{zone}</h6>
                    <Select
                        className='w-35'
                        options={zone === 'East' ? easternVehicles : zone === 'West' ? westernVehicles : zone === 'West Gujarat' ? westernGujaratVehicles : zone === 'North' ? northenVehicles : zone === 'South' && southernVehicles}
                        value={zone === 'East' ? selectedVehicleFromEast : zone === 'West' ? selectedVehicleFromWest : zone === 'West Gujarat' ? selectedVehicleFromWestGujarat : zone === 'North' ? selectedVehicleFromNorth : zone === 'South' && selectedVehicleFromSouth}
                        onChange={(selectedOption) => handleSelectSearchedVehicle(selectedOption, zone)}
                        isClearable={true}
                        styles={selectStyles}
                        placeholder="Search Vehicle"
                    />
                </div>

                <div className='w-100 table-responsive' style={{ overflowX: "", overflowY: "scroll", maxHeight: "200px", minHeight: "200px" }}>
                    <table className='table w-100 position-relative table-striped table-hover' style={{ overflowX: "hidden", overflowY: "scroll", maxHeight: "1rem" }}>
                        <thead className={`${zone === 'East' ? 'bg-thm-dark' : zone === 'West' ? 'bg-success' : zone === 'West Gujarat' ? 'bg-thm-danger' : zone === 'North' ? 'bg-thm-warning' : zone === 'South' && 'bg-thm-primary'}`} style={{ zIndex: 1, position: "sticky", top: 0 }}>
                            <tr className='text-white zone-table-row-head'>
                                <th className=''></th>
                                <th className='text-nowrap'>Vehicle</th>
                                <th className='text-nowrap text-center'>Status</th>
                                <th className='text-nowrap'>Load (From-To)</th>
                                <th className='text-nowrap'>Loading Date</th>
                                <th className='text-nowrap'>Arrival Date</th>
                                <th className='text-nowrap' style={{ minWidth: "6rem" }}>Location</th>
                                <th className='text-nowrap' style={{ minWidth: "3rem" }}>To</th>
                                <th className='text-nowrap'>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map(data => (
                                    <tr className='cursor-pointer zone-table-row'
                                        onClick={() => handleSelectVehicle(data, zone)}
                                        key={data?.vehicleNo}>
                                        <td className='p-0 ps-1 pt-2'>
                                            <Form.Check type='checkbox'
                                                onChange={() => handleSelectVehicle(data, zone)}
                                                checked={
                                                    zone === 'East' ? vehiclesSelectedFromEast.includes(data) : zone === 'West' ? vehiclesSelectedFromWest.includes(data) : zone === 'West Gujarat' ? vehiclesSelectedFromWestGujarat.includes(data) : zone === 'North' ? vehiclesSelectedFromNorth.includes(data) : zone === 'South' && vehiclesSelectedFromSouth.includes(data)
                                                }
                                            />
                                        </td>
                                        <td className='zone-table-row-data'>
                                            {data?.vehicleNo}
                                        </td>
                                        <td className='h-100'>
                                            <div className='h-100 d-flex justify-content-center align-items-center'>
                                                <div className={`circle ${data?.currVehicleStatus === "On Hold" ? 'circle-yellow-blink' : data?.currVehicleStatus === 'Running' ? 'circle-green-blink' : data?.currVehicleStatus === 'GPS Off' ? 'circle-red-blink' : data?.currVehicleStatus === null && 'bg-white'}`}></div>
                                            </div>
                                        </td>
                                        <td className='zone-table-row-data'>{data?.origin} - {data?.destination}</td>
                                        <td className='zone-table-row-data'>{handleFormateISTDate(data?.loadingDate)}</td>
                                        <td className='zone-table-row-data'>{handleFormateISTDate(data?.estimatedArrivalDate)}</td>
                                        <td className='zone-table-row-data' style={{ width: "5rem" }}>{data?.location}</td>
                                        <td className='zone-table-row-data'>{data?.destination}</td>
                                        <td className='zone-table-row-data'>
                                            <Tooltip title="Edit" key="edit">
                                                <Link to="#">
                                                    <CiEdit className='text-success fs-5 cursor-pointer' />
                                                </Link>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    {
                        (data.length === 0) ? (
                            <div className='pb-3 text-secondary d-flex justify-content-center align-items-center'>
                                No Data Found
                            </div>
                        ) : null
                    }

                </div>
            </Card>
        </Col>
    );
};

const ForecastDashoard = () => {

    const [offices, setOffices] = useState([]);
    const [hoveredOffice, setHoveredOffice] = useState('');

    const [easternTrips, setEasternTrips] = useState([]);
    const [westernTrips, setWesternTrips] = useState([]);
    const [westGujaratTrips, setWestGujaratTrips] = useState([]);
    const [northenTrips, setNorthenTrips] = useState([]);
    const [southernTrips, setSouthernTrips] = useState([]);

    const [easternVehicles, setEasternVehicles] = useState('');
    const [westernVehicles, setWesternVehicles] = useState('');
    const [westernGujaratVehicles, setWesternGujaratVehicles] = useState('');
    const [northenVehicles, setNorthenVehicles] = useState('');
    const [southernVehicles, setSouthernVehicles] = useState('');

    const [vehiclesSelectedFromEast, setVehiclesSelectedFromEast] = useState([]);
    const [vehiclesSelectedFromWest, setVehiclesSelectedFromWest] = useState([]);
    const [vehiclesSelectedFromWestGujarat, setVehiclesSelectedFromWestGujarat] = useState([]);
    const [vehiclesSelectedFromNorth, setVehiclesSelectedFromNorth] = useState([]);
    const [vehiclesSelectedFromSouth, setVehiclesSelectedFromSouth] = useState([]);

    const [selectedVehicleFromEast, setSelectedVehicleFromEast] = useState('');
    const [selectedVehicleFromWest, setselectedVehicleFromWest] = useState('');
    const [selectedVehicleFromWestGujarat, setSelectedVehicleFromWestGujarat] = useState('');
    const [selectedVehicleFromNorth, setSelectedVehicleFromNorth] = useState('');
    const [selectedVehicleFromSouth, setSelectedVehicleFromSouth] = useState('');

    const zones = [
        { name: 'East', data: easternTrips },
        { name: 'West', data: westernTrips },
        { name: 'West Gujarat', data: westGujaratTrips },
        { name: 'North', data: northenTrips },
        { name: 'South', data: southernTrips },
    ];

    useEffect(() => {
        getAllOfficesList().then(response => {
            response?.status === 200 ? setOffices(response?.data) : setOffices([]);
        }).catch(err => {
            setOffices([]);
            console.log(err);
        })
    }, []);

    useEffect(() => {
        getRunningTrips().then(response => {
            if (response.status === 200) {
                const allTrips = response?.data;
                const runnings = allTrips.filter(data => data?.tripStatus === "Trip Running");

                const easterns = runnings.filter(data => data?.toPlaceZone === 'East');
                const westerns = runnings.filter(data => data?.toPlaceZone === 'West');
                const westGujarat = runnings.filter(data => data?.toPlaceZone === 'West Gujarat');
                const northens = runnings.filter(data => data?.toPlaceZone === 'North');
                const southerns = runnings.filter(data => data?.toPlaceZone === 'South');

                let easternVehcileList = [];
                let westernVehicleList = [];
                let westeGujaratVehicleList = [];
                let northenVehicleList = [];
                let southernVehicleList = [];

                easterns.forEach(data => easternVehcileList.push({ label: data?.vehicleNo, value: data?.vehicleNo }));
                westerns.forEach(data => westernVehicleList.push({ label: data?.vehicleNo, value: data?.vehicleNo }));
                westGujarat.forEach(data => westeGujaratVehicleList.push({ label: data?.vehicleNo, value: data?.vehicleNo }));
                northens.forEach(data => northenVehicleList.push({ label: data?.vehicleNo, value: data?.vehicleNo }));
                southerns.forEach(data => southernVehicleList.push({ label: data?.vehicleNo, value: data?.vehicleNo }));

                setEasternTrips(easterns);
                setWesternTrips(westerns)
                setWestGujaratTrips(westGujarat);
                setNorthenTrips(northens);
                setSouthernTrips(southerns);

                setEasternVehicles(easternVehcileList);
                setWesternVehicles(westernVehicleList);
                setWesternGujaratVehicles(westeGujaratVehicleList);
                setNorthenVehicles(northenVehicleList);
                setSouthernVehicles(southernVehicleList);
            } else {
                setEasternTrips([]);
                setWesternTrips([])
                setWestGujaratTrips([]);
                setNorthenTrips([]);
                setSouthernTrips([]);
            }
        }).catch(err => {
            setEasternTrips([]);
            setWesternTrips([])
            setWestGujaratTrips([]);
            setNorthenTrips([]);
            setSouthernTrips([]);

            console.log(err);
        })
    }, []);

    const handleSelectVehicle = (selected, zone) => {
        if (zone === 'East') {
            if (vehiclesSelectedFromEast.includes(selected)) {
                const filterRemoved = vehiclesSelectedFromEast.filter(filter => filter !== selected);
                setVehiclesSelectedFromEast(filterRemoved);
            } else {
                setVehiclesSelectedFromEast([...vehiclesSelectedFromEast, selected])
            }
        } else if (zone === 'West') {
            if (vehiclesSelectedFromWest.includes(selected)) {
                const filterRemoved = vehiclesSelectedFromWest.filter(filter => filter !== selected);
                setVehiclesSelectedFromWest(filterRemoved);
            } else {
                setVehiclesSelectedFromWest([...vehiclesSelectedFromWest, selected])
            }
        } else if (zone === 'West Gujarat') {
            if (vehiclesSelectedFromWestGujarat.includes(selected)) {
                const filterRemoved = vehiclesSelectedFromWestGujarat.filter(filter => filter !== selected);
                setVehiclesSelectedFromWestGujarat(filterRemoved);
            } else {
                setVehiclesSelectedFromWestGujarat([...vehiclesSelectedFromWestGujarat, selected])
            }
        } else if (zone === 'North') {
            if (vehiclesSelectedFromNorth.includes(selected)) {
                const filterRemoved = vehiclesSelectedFromNorth.filter(filter => filter !== selected);
                setVehiclesSelectedFromNorth(filterRemoved);
            } else {
                setVehiclesSelectedFromNorth([...vehiclesSelectedFromNorth, selected])
            }
        } else if (zone === 'South') {
            if (vehiclesSelectedFromSouth.includes(selected)) {
                const filterRemoved = vehiclesSelectedFromSouth.filter(filter => filter !== selected);
                setVehiclesSelectedFromSouth(filterRemoved);
            } else {
                setVehiclesSelectedFromSouth([...vehiclesSelectedFromSouth, selected])
            }
        }
    };

    const handleSelectSearchedVehicle = (selectedValue, zone) => {
        if (zone === 'East') {
            setSelectedVehicleFromEast(selectedValue);
        } else if (zone === 'West') {
            setselectedVehicleFromWest(selectedValue);
        } else if (zone === 'West Gujarat') {
            setSelectedVehicleFromWestGujarat(selectedValue);
        } else if (zone === 'North') {
            setSelectedVehicleFromNorth(selectedValue);
        } else if (zone === 'South') {
            setSelectedVehicleFromSouth(selectedValue);
        }
    };

    return (
        <div className='thm-dark m-0 p-0 py-5 px-3 pt-3'>
            <Card>
                <div className='w-100 d-flex justify-content-between align-items-center'>
                    <h5 className='m-0 p-0'>Forecasting Dashboard</h5>
                </div>
            </Card>
            <div className='container-fluid'>
                <Row className=''>
                    <Col lg={10} className='py-0 px-3'>
                        <Row>
                            {zones.map(data => (
                                <ZoneData zone={data?.name} data={data?.data} easternVehicles={easternVehicles} westernVehicles={westernVehicles}
                                    westernGujaratVehicles={westernGujaratVehicles} northenVehicles={northenVehicles} southernVehicles={southernVehicles}
                                    selectedVehicleFromEast={selectedVehicleFromEast} selectedVehicleFromWest={selectedVehicleFromWest}
                                    selectedVehicleFromWestGujarat={selectedVehicleFromWestGujarat} selectedVehicleFromNorth={selectedVehicleFromNorth}
                                    selectedVehicleFromSouth={selectedVehicleFromSouth} handleSelectSearchedVehicle={handleSelectSearchedVehicle}
                                    handleSelectVehicle={handleSelectVehicle} vehiclesSelectedFromEast={vehiclesSelectedFromEast}
                                    vehiclesSelectedFromWest={vehiclesSelectedFromWest} vehiclesSelectedFromWestGujarat={vehiclesSelectedFromWestGujarat}
                                    vehiclesSelectedFromNorth={vehiclesSelectedFromNorth} vehiclesSelectedFromSouth={vehiclesSelectedFromSouth}
                                />
                            ))}
                        </Row>
                    </Col>
                    <Col lg={2} className='py-0 px-0' style={{ height: "75vh" }}>
                        <Card className="h-100">
                            <h6>Places</h6>

                            {
                                offices.map(data => (
                                    <div className={`${hoveredOffice === data?.officeName && 'bg-thm-dark text-white'} px-1 d-flex justify-content-between align-items-center py-2`}
                                        onMouseOver={() => setHoveredOffice(data?.officeName)}
                                        onMouseOut={() => setHoveredOffice('')}
                                        key={data?.officeName} style={{ borderBottom: "1px solid #000" }}>
                                        <span>{data?.officeName}</span>
                                        <button className={`${hoveredOffice === data?.officeName ? 'bg-white thm-dark' : 'bg-thm-dark text-white'} px-4 rounded-pill`} style={{ fontSize: "0.8rem", fontWeight: "450" }}>Add</button>
                                    </div>

                                ))
                            }
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default ForecastDashoard
