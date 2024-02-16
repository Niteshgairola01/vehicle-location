import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { Col, Form, Row } from 'react-bootstrap'
import Select from 'react-select';

//MUI

import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { makeStyles } from '@mui/styles';

import { Input } from '../../components/form/Input';
import Button from '../../components/Button/coloredButton';
import HoveredButton from '../../components/Button/hoveredButton';
import { getAllVehiclesList } from '../../hooks/vehicleMasterHooks';
import { createNewMapping, getAllDrivers, getAllMappings, getAvailableOptionForDriver } from '../../hooks/drivermasterHooks';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';

const useStyles = makeStyles({
    input: {
        '& input': {
            padding: '0.3rem !important',
        },
        overflow: 'hidden',
        padding: '0',
    },
});

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

const DriverMapping = () => {

    const [form, setForm] = useState({});
    const [filterForm, setFilterForm] = useState({});

    // Mapping list
    const [allMappings, setAllMappings] = useState([]);
    const [filteredMappings, setFilteredMappings] = useState([]);

    // Driver Mapping
    const [vehiclesList, setVehiclesList] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [driverCodes, setDriverCodes] = useState([]);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedDriveCode, setSelectedDriverCode] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedVehicleNo, setSelectedVehicleNo] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const [statuses, setStatuses] = useState([
        {
            label: 'On Vehicle',
            value: 'On Vehicle'
        },
        {
            label: 'Off Vehicle',
            value: 'Off Vehicle'
        }
    ]);

    const roles = [
        {
            label: 'First Driver',
            value: 'First Driver'
        },
        {
            label: 'Second Driver',
            value: 'Second Driver'
        },
        {
            label: 'Cleaner',
            value: 'Cleaner'
        },
    ];

    const classes = useStyles();
    const loggedInUser = localStorage.getItem('userId');

    useEffect(() => {
        setForm({
            ...form,
            createdBy: loggedInUser
        });

    }, [loggedInUser]);

    useEffect(() => {
        getAllMappings().then(response => {
            if (response?.status === 200) {
                setAllMappings(response?.data);
                setFilteredMappings(response?.data);
            } else {
                setAllMappings([]);
                setFilteredMappings([]);
            }
        }).catch(err => {
            setAllMappings([]);
            setFilteredMappings([]);
        });
    }, []);

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
        getAllDrivers().then((response) => {
            if (response.status === 200) {
                if (response?.data.length > 0) {
                    const filteredByName = response?.data.map(data => ({
                        ...data,
                        label: data?.driverName,
                        value: data?.driverName,
                        driverName: data?.driverName,
                        driverCode: data?.driverCode
                    }));

                    const filteredByCode = response?.data.map(data => ({
                        ...data,
                        label: data?.driverCode,
                        value: data?.driverCode,
                        driverName: data?.driverName,
                        driverCode: data?.driverCode
                    }));

                    setDrivers(filteredByName);
                    setDriverCodes(filteredByCode);
                } else {
                    setDrivers([]);
                    setDriverCodes([]);
                }
            } else {
                setDrivers([]);
                setDriverCodes([]);
            }
        }).catch(() => {
            setDrivers([]);
            setDriverCodes([]);
        });
    }, []);

    useEffect(() => {
        if (selectedDriver?.value === undefined) {
            setFilterForm({
                ...filterForm,
                driverName: "",
            });
        }
        if (selectedVehicleNo?.value === undefined) {
            setFilterForm({
                ...filterForm,
                vehicleNo: ''
            });
        }
    }, [selectedDriver, selectedVehicleNo]);

    useEffect(() => {
        if (selectedDriveCode !== '') {
            getAvailableOptionForDriver({ driverCode: `${selectedDriveCode?.value}` }).then(response => {
                if (response?.status === 200) {
                    if (response?.data === "") {
                        setStatuses([
                            {
                                label: 'On Vehicle',
                                value: 'On Vehicle'
                            }
                        ]);
                        setSelectedStatus({
                            label: 'On Vehicle',
                            value: 'On Vehicle'
                        });
                        setForm({
                            ...form,
                            status: 'On Vehicle'
                        });
                    } else {
                        setStatuses([
                            {
                                label: 'Off Vehicle',
                                value: 'Off Vehicle'
                            }
                        ]);
                        setSelectedStatus({
                            label: 'Off Vehicle',
                            value: 'Off Vehicle'
                        });
                        setForm({
                            ...form,
                            status: 'Off Vehicle'
                        });
                    }
                }
            }).catch(err => {
                setStatuses([
                    {
                        label: 'Off Vehicle',
                        value: 'Off Vehicle'
                    },
                    {
                        label: 'On Vehicle',
                        value: 'On Vehicle'
                    }
                ]);
                console.log('error', err);
            })
        };
    }, [selectedDriveCode]);

    const handleChangedate = (dateTime) => {

        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;
        const hours = dateTime?.$H < 10 ? `0${dateTime?.$H}` : dateTime?.$H;
        const minute = dateTime?.$m < 10 ? `0${dateTime?.$m}` : dateTime?.$m;
        const seconds = dateTime?.$s < 10 ? `0${dateTime?.$s}` : dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setSelectedDate(formattedDate);

        setForm({
            ...form,
            date: formattedDate
        });
    };

    const handleSelectDriverName = (name) => {
        setSelectedDriver(name);
        setSelectedDriverCode({
            label: name?.driverCode,
            value: name?.driverCode,
            driverName: name?.driverName,
            driverCode: name?.driverCode
        });

        setForm({
            ...form,
            driverName: name?.value,
            driverCode: name?.driverCode
        });

        setFilterForm({
            ...filterForm,
            driverName: name?.value,
        })
    };

    const handleSelectDriverCode = (code) => {
        setSelectedDriverCode(code);
        setSelectedDriver({
            label: code?.driverName,
            value: code?.driverName,
            driverName: code?.driver,
            driverCode: code?.driverCode
        });

        setForm({
            ...form,
            driverName: code?.driverName,
            driverCode: code?.value
        });

        setFilterForm({
            ...filterForm,
            driverName: code?.driverName,
        });
    };

    const handleSelectStatus = (status) => {
        setSelectedStatus(status);

        setForm({
            ...form,
            status: status?.value
        });
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicleNo(vehicle);

        setForm({
            ...form,
            vehicleNo: vehicle?.value
        });

        setFilterForm({
            ...filterForm,
            vehicleNo: vehicle?.value
        });
    };

    const handleSelectRole = (role) => {
        setSelectedRole(role);

        setForm({
            ...form,
            role: role?.value
        });
    };

    const handleFormatDate = (dateString) => {
        if (dateString === '' || dateString === null) {
            return ' ';
        } else {
            const splittedDateString = dateString.split(' ');
            const splittedDate = splittedDateString[0].split('-');

            const formattedDate = `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]} ${splittedDateString[1]}`;
            return formattedDate;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedDriver?.value === undefined) {
            ErrorToast("Select Driver");
        }
        if (selectedDriveCode?.value === undefined) {
            ErrorToast("Select Driver Code");
        }
        if (selectedStatus?.value === undefined) {
            ErrorToast("Select Status");
        }
        if (selectedVehicleNo?.value === undefined) {
            ErrorToast("Select Vehicle");
        }
        if (selectedRole?.value === undefined) {
            ErrorToast("Select Role");
        }
        else {

            createNewMapping(form).then(response => {
                if (response?.status === 200) {
                    SuccessToast(response?.data);
                    setSelectedDate('');
                    setSelectedDriver('');
                    setSelectedDriverCode('');
                    setSelectedStatus('');
                    setSelectedVehicleNo('');
                    setSelectedRole('');
                } else {
                    ErrorToast("Unable to Map");
                }
            }).catch(err => {
                ErrorToast(err?.response?.data);
            });
        }
    };

    const handleShowFilteredMappings = () => {
        const allFilteredMappings = allMappings.filter(test => {
            for (const key in filterForm) {
                const testValue = String(test[key]).toLowerCase();
                const formValue = filterForm[key].toLowerCase();

                if ((testValue !== formValue && formValue.length > 0)) {
                    return false;
                }
            }
            return true;
        });

        setFilteredMappings(allFilteredMappings);
    };

    return (
        <div className='thm-dark m-0 p-0 p-5 pt-3'>
            <Card>
                <div className='w-100 d-flex justify-content-between align-items-center'>
                    <h5 className='m-0 p-0'>Driver Mapping</h5>
                </div>
            </Card>

            <Card>
                <Form onSubmit={handleSubmit}>
                    <Row className=''>
                        <Col sm={3}>
                            <Form.Label className='mb-0'>Date</Form.Label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                    <DemoItem>
                                        <DateTimePicker
                                            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                            format="DD/MM/YYYY HH:mm:ss"
                                            ampm={false}
                                            value={selectedDate}
                                            onChange={handleChangedate}
                                            style={{ height: '10px' }}
                                            className={classes.input}
                                        />
                                    </DemoItem>
                                </DemoContainer>
                            </LocalizationProvider>
                        </Col>
                        <Col sm={3}>
                            <Form.Label>Driver Name</Form.Label>
                            <Select
                                className='w-100'
                                options={drivers}
                                value={selectedDriver}
                                onChange={handleSelectDriverName}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Search Driver By Name"
                            />
                        </Col>
                        <Col sm={2}>
                            <Form.Label>Driver Code</Form.Label>
                            <Select
                                className='w-100'
                                options={driverCodes}
                                value={selectedDriveCode}
                                onChange={handleSelectDriverCode}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Search Driver By Code"
                            />
                        </Col>
                        <Col sm={2}>
                            <Form.Label>Status</Form.Label>
                            <Select
                                className='w-100'
                                options={statuses}
                                value={selectedStatus}
                                onChange={handleSelectStatus}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Select Status"
                            />
                        </Col>
                        <Col sm={2}>
                            <Form.Label>Vehicle No.</Form.Label>
                            <Select
                                className='w-100'
                                options={vehiclesList}
                                value={selectedVehicleNo}
                                onChange={handleSelectVehicle}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Search Vehicle"
                            />
                        </Col>
                    </Row>

                    <Row className='mt-2'>
                        <Col sm={2}>
                            <Form.Label>Role</Form.Label>
                            <Select
                                className='w-100'
                                options={roles}
                                value={selectedRole}
                                onChange={handleSelectRole}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Select Role"
                            />
                        </Col>
                        <Col sm={3}>
                            <Input label="Remark" placeholder="Add Remark" className="pb-2" onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                        </Col>
                        <Col sm={3} className='px-0 pt-3 d-flex justify-content-center align-items-center'>
                            <Button type='submit' className="px-4 py-0">Add</Button>
                            <HoveredButton type='button' className="px-4 py-0 ms-2" onClick={() => handleShowFilteredMappings()}>Show</HoveredButton>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card>
                <div className='w-100 table-responsive' style={{ maxHeight: "25rem", }}>
                    <table className='table w-100 position-relative' style={{ overflowX: "hidden", overflowY: "scroll" }}>
                        <thead style={{ zIndex: 1, position: "sticky", top: 0 }}>
                            <tr className='text-white'>
                                <th className='ps-2' style={{ width: '7%' }}>S.No.</th>
                                <th className='' style={{ width: '12%' }}>Driver Code</th>
                                <th className=''>Driver Name</th>
                                <th className=''>Role</th>
                                <th className=''>Status</th>
                                <th className=''>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredMappings.map((data, index) => (
                                    <tr className='bg-white' key={index}>
                                        <td className='text-start py-2'>{index + 1}</td>
                                        <td>{data?.driverCode}</td>
                                        <td>{data?.driverName}</td>
                                        <td>{data?.role}</td>
                                        <td>{data?.status}</td>
                                        <td>{handleFormatDate(data?.date)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

export default DriverMapping;
