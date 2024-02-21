import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { Col, Form, Row } from 'react-bootstrap'
import Select from 'react-select';
import { CiEdit } from "react-icons/ci";

//MUI

import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { makeStyles } from '@mui/styles';

// Others

import { Input } from '../../components/form/Input';
import Button from '../../components/Button/coloredButton';
import HoveredButton from '../../components/Button/hoveredButton';
import { getAllVehiclesList } from '../../hooks/vehicleMasterHooks';
import { createNewMapping, getAllDrivers, getAllMappings, getAvailableOptionForDriver, updateMapping } from '../../hooks/drivermasterHooks';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';
import dayjs from 'dayjs';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { MdSettingsBackupRestore } from 'react-icons/md';

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
    const [mappingsList, setMappingList] = useState([]);
    const [allMappings, setAllMappings] = useState([]);
    const [filteredMappings, setFilteredMappings] = useState([]);

    // Driver Mapping
    const [vehiclesList, setVehiclesList] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [driverCodes, setDriverCodes] = useState([]);
    const [remark, setRemark] = useState('');

    const [selectedDate, setSelectedDate] = useState('');
    const [formattedSelectedDate, setFormattedSelectedDate] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedDriverCode, setSelectedDriverCode] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedVehicleNo, setSelectedVehicleNo] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const [mappingToBeUpdated, setMappingToBeUpdated] = useState(null);
    const [showFilteredMappings, setShowFilteredmapping] = useState(false);

    // Update Mapping
    const filteredDriverArray = allMappings?.filter(driver => driver?.driverCode?.toLowerCase().includes(selectedDriverCode?.value?.toLowerCase()));
    const lastStatus = filteredDriverArray[0];

    const lastOccurrences = {};

    mappingsList.forEach((item, index) => {
        lastOccurrences[item?.driverCode] = index;
    });

    // Filter elements based on last occurrences and status is not "New"
    const lastOccuranceArray = mappingsList.filter(item => {
        return lastOccurrences[item?.driverCode] === mappingsList.indexOf(item) && item.status !== 'New Driver';
    });

    const lastVehicleOccurrences = {};

    mappingsList.forEach((item, index) => {
        lastVehicleOccurrences[item?.vehicleNo] = index;
    });

    // Filter elements based on last occurrences and status is not "New"
    const lastVehicleOccuranceArray = mappingsList.filter(item => {
        return lastVehicleOccurrences[item?.vehicleNo] === mappingsList.indexOf(item) && item.status !== 'New Driver';
    });

    let occuranceArray = lastOccuranceArray.concat(lastVehicleOccuranceArray);

    let editableMappings = [];

    occuranceArray.map(data => {
        console.log("test", data?.mappingId);
        editableMappings.push(data?.mappingId)
    });

    useEffect(() => {
        if (mappingToBeUpdated === null) {
            if (lastStatus === undefined) {
                setSelectedDate('');
                setSelectedVehicleNo('');
                setSelectedRole('');
            } else {
                setSelectedDate(dayjs(lastStatus?.date))
                setFormattedSelectedDate(lastStatus?.date);
            }
        } else {
            if (lastStatus === undefined) {
                setSelectedDate('');
                setSelectedVehicleNo('');
                setSelectedRole('');
            } else {
                setSelectedDate(dayjs(lastStatus?.date))
                setFormattedSelectedDate(lastStatus?.date);
                setSelectedDriver({
                    label: lastStatus?.driverName,
                    value: lastStatus?.driverName,
                });

                setSelectedDriverCode({
                    label: lastStatus?.driverCode,
                    value: lastStatus?.driverCode,
                });

                setSelectedVehicleNo({
                    label: lastStatus?.vehicleNo,
                    value: lastStatus?.vehicleNo
                });

                setSelectedRole({
                    label: lastStatus?.role,
                    value: lastStatus?.role,
                });
            }
        }
    }, [lastStatus]);

    const handleSelectMappingToBeUpdate = (id, data) => {
        setMappingToBeUpdated(id);
        setSelectedDriverCode({
            driverName: data?.driverName,
            driverCode: data?.driverCode,
            status: data?.status,
            label: data?.driverCode,
            value: data?.driverCode
        });
    }

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
        setForm((f) => {
            return {
                ...f,
                createdBy: loggedInUser
            }
        });
    }, [loggedInUser]);

    console.log("mapping", lastOccuranceArray);

    useEffect(() => {
        getAllMappings().then(response => {
            if (response?.status === 200) {
                setMappingList(response?.data);

                // const allData = response?.data;
                // allData.reverse();
                // setAllMappings(allData);
                // setFilteredMappings(allData);
            } else {
                setAllMappings([]);
                setFilteredMappings([]);
            }
        }).catch(err => {
            setAllMappings([]);
            setFilteredMappings([]);
        });
    }, []);

    const getMappingsList = () => {
        getAllMappings().then(response => {
            if (response?.status === 200) {
                // setMappingList(response?.data);

                const allData = response?.data;
                allData.reverse();
                setAllMappings(allData);
                setFilteredMappings(allData);
            } else {
                setAllMappings([]);
                setFilteredMappings([]);
            }
        }).catch(err => {
            setAllMappings([]);
            setFilteredMappings([]);
        });
    };

    useEffect(() => {
        getMappingsList();
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
        if (selectedDriverCode === null || selectedDriverCode?.value === undefined) {
            setFilterForm(form => {
                return {
                    ...form,
                    driverCode: "",
                }
            });
        } else {
            setFilterForm(form => {
                return {
                    ...form,
                    driverCode: selectedDriverCode?.value,
                }
            });
        }
    }, [selectedDriverCode]);

    useEffect(() => {
        if (selectedVehicleNo === null || selectedVehicleNo?.value === undefined) {
            setFilterForm(form => {
                return {
                    ...form,
                    vehicleNo: "",
                }
            });
        } else {
            setFilterForm(form => {
                return {
                    ...form,
                    vehicleNo: selectedVehicleNo?.value,
                }
            });
        }
    }, [selectedVehicleNo]);

    useEffect(() => {
        if (selectedDriverCode !== '') {
            getAvailableOptionForDriver({ driverCode: `${selectedDriverCode?.value}` }).then(response => {
                if (response?.status === 200) {
                    if (mappingToBeUpdated !== null) {
                        if (response?.data === "") {
                            setStatuses([{ label: 'On Vehicle', value: 'On Vehicle' }]);
                            setSelectedStatus({ label: 'On Vehicle', value: 'On Vehicle' });
                        } else {
                            if (response?.data.status === 'New Driver') {
                                setStatuses([{ label: 'On Vehicle', value: 'On Vehicle' }]);
                                setSelectedStatus({
                                    label: 'On Vehicle',
                                    value: 'On Vehicle'
                                });
                            } else {
                                setStatuses([{ label: 'Off Vehicle', value: 'Off Vehicle' }]);
                                setSelectedStatus({
                                    label: 'Off Vehicle',
                                    value: 'Off Vehicle'
                                });
                                // setSelectedVehicleNo({
                                //     label: response?.vehicleNo,
                                //     value: response?.vehicleNo,
                                // })
                            }
                        }
                    } else {
                        if (response?.data === "") {
                            setStatuses([{ label: 'On Vehicle', value: 'On Vehicle' }]);
                            setSelectedStatus({ label: 'On Vehicle', value: 'On Vehicle' });
                            setSelectedDate('');
                            setFormattedSelectedDate('');
                            setSelectedVehicleNo('');
                            setSelectedRole('');

                            setForm({
                                createdBy: loggedInUser,
                                driverCode: selectedDriverCode?.value,
                                driverName: selectedDriver?.value,
                                status: 'On Vehicle'
                            });
                        } else {
                            if (response?.data.status === 'New Driver') {
                                setStatuses([{ label: 'On Vehicle', value: 'On Vehicle' }]);
                                setSelectedStatus({
                                    label: 'On Vehicle',
                                    value: 'On Vehicle'
                                });
                                setSelectedDate('');
                                setFormattedSelectedDate('');
                                setSelectedVehicleNo('');
                                setSelectedRole('');

                                setForm({
                                    createdBy: loggedInUser,
                                    driverCode: selectedDriverCode?.value,
                                    driverName: selectedDriver?.value,
                                    status: 'On Vehicle'
                                });
                            } else {
                                if (response?.data?.status === 'On Vehicle') {
                                    setStatuses([{ label: 'Off Vehicle', value: 'Off Vehicle' }]);
                                    setSelectedStatus({
                                        label: 'Off Vehicle',
                                        value: 'Off Vehicle'
                                    });
                                    setSelectedVehicleNo({
                                        label: response?.data?.vehicleNo,
                                        value: response?.data?.vehicleNo
                                    });

                                    setSelectedRole({
                                        label: response?.data?.role,
                                        value: response?.data?.role
                                    });

                                    setSelectedDate(dayjs(response?.data?.date));
                                    setSelectedDate('');
                                    setFormattedSelectedDate('');

                                    setForm({
                                        createdBy: loggedInUser,
                                        driverName: response?.data?.driverName,
                                        driverCode: response?.data?.driverCode,
                                        status: 'Off Vehicle',
                                        vehicleNo: response?.data?.vehicleNo,
                                        role: response?.data?.role
                                    });
                                } else if (response?.data?.status === 'Off Vehicle') {
                                    setStatuses([{ label: 'On Vehicle', value: 'On Vehicle' }]);
                                    setSelectedStatus({
                                        label: 'On Vehicle',
                                        value: 'On Vehicle'
                                    });

                                    setSelectedVehicleNo('');
                                    setSelectedRole('');
                                    setSelectedDate('');
                                    setFormattedSelectedDate('');

                                    setForm({
                                        createdBy: loggedInUser,
                                        driverCode: selectedDriverCode?.value,
                                        driverName: selectedDriver?.value,
                                        status: 'On Vehicle'
                                    });
                                }
                            }
                        }
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
    }, [selectedDriverCode, mappingToBeUpdated]);

    console.log("form", form);

    const handleChangedate = (dateTime) => {
        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;
        const hours = dateTime?.$H < 10 ? `0${dateTime?.$H}` : dateTime?.$H;
        const minute = dateTime?.$m < 10 ? `0${dateTime?.$m}` : dateTime?.$m;
        const seconds = dateTime?.$s < 10 ? `0${dateTime?.$s}` : dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setSelectedDate(formattedDate);
        setFormattedSelectedDate(formattedDate);

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
            status: name?.status,
            driverName: name?.driverName,
            driverCode: name?.driverCode
        });

        setForm({
            ...form,
            driverName: name?.value,
            driverCode: name?.driverCode
        });
    };

    const handleSelectDriverCode = (code) => {
        setSelectedDriverCode(code);
        setSelectedDriver({
            label: code?.driverName,
            value: code?.driverName,
            status: code?.status,
            driverName: code?.driver,
            driverCode: code?.driverCode
        });

        setForm({
            ...form,
            driverName: code?.driverName,
            driverCode: code?.value
        });

        if (mappingToBeUpdated !== null) {
            if (code?.mappingId !== filteredMappings[filteredMappings.length - 1]?.mappingId) {
                setMappingToBeUpdated(null)
            }
        }
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
        // if (formattedSelectedDate < lastStatus?.date) {
        //     ErrorToast("Date Can not be before of On Vehicle");
        // }

        // if (lastStatus?.status === 'New Driver') {
        //     if (formattedSelectedDate < lastStatus?.date) {
        //         ErrorToast("Date Can not be before of On Vehicle");
        //     }
        // }

        // if (formattedSelectedDate < lastStatus?.data) {
        //     ErrorToast("Date");
        // }
        if (formattedSelectedDate === '' || selectedDriver?.value === undefined || selectedDriverCode?.value === undefined ||
            selectedStatus?.value === undefined || selectedVehicleNo?.value === undefined || selectedRole?.value === undefined
        ) {
            console.log("if block");
            if (formattedSelectedDate === '') {
                ErrorToast("Select Date");
            }
            if (selectedDriver?.value === undefined) {
                ErrorToast("Select Driver");
            }
            if (selectedDriverCode?.value === undefined) {
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
        } else {
            console.log("else block");
            if (mappingToBeUpdated === null) {
                createNewMapping(form).then(response => {
                    if (response?.status === 200) {
                        SuccessToast(response?.data);
                        getMappingsList();
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
            } else {

                const newForm = {
                    modifiedBy: loggedInUser,
                    mappingId: lastStatus?.mappingId,
                    ...(formattedSelectedDate !== lastStatus?.date && { date: formattedSelectedDate }),
                    ...(selectedVehicleNo?.value !== lastStatus?.vehicleNo && { vehicleNo: selectedVehicleNo?.value }),
                    ...(selectedRole?.value !== lastStatus?.role && { role: selectedRole?.value }),
                    ...(remark !== lastStatus?.remark && { remarks: remark }),
                };
                updateMapping(newForm).then(response => {
                    if (response?.status === 200) {
                        SuccessToast(response?.data);
                        getMappingsList();
                        // setSelectedDate('');
                        // setSelectedDriver('');
                        // setSelectedDriverCode('');
                        // setSelectedStatus('');
                        // setSelectedVehicleNo('');
                        // setSelectedRole('');
                    } else {
                        ErrorToast("Unable to Map");
                    }
                }).catch(err => {
                    console.log("err", err);
                    ErrorToast(err?.response?.data);
                });
            }
        }

    };

    const handleShowFilteredMappings = () => {
        if (selectedDriverCode?.value === undefined && selectedVehicleNo?.value === undefined) {
            setShowFilteredmapping(false);
        } else {
            setShowFilteredmapping(true);
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
        }
    };

    const handleResetFilters = () => {
        setShowFilteredmapping(false);
        setFilteredMappings(allMappings);
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
                                value={selectedDriverCode}
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
                            <Input label="Remark" placeholder="Add Remark" className="pb-2" onChange={(e) => {
                                setForm({ ...form, remarks: e.target.value })
                                setRemark(e.target.value)
                            }} />
                        </Col>
                        <Col sm={3} className='px-0 pt-3 d-flex justify-content-center align-items-center'>
                            <Button type='submit' className="px-4 py-0">
                                {mappingToBeUpdated === null ? 'Add' : 'Update'}
                            </Button>
                            <HoveredButton type='button' className="px-4 py-0 ms-2 w-30" onClick={() => handleShowFilteredMappings()}>
                                {/* {!showFilteredMappings ? 'Show' : 'All'} */}
                                Show
                            </HoveredButton>
                            {
                                showFilteredMappings ? (
                                    <Tooltip title="Reset Filters">
                                        <Link to="#">
                                            <MdSettingsBackupRestore onClick={() => handleResetFilters()} className='ms-3 thm-dark cursor-pointer ms-2 fs-3' />
                                        </Link>
                                    </Tooltip>
                                ) : null
                            }
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
                                <th className=''>Vehicle No.</th>
                                <th className=''>Date</th>
                                <th className='text-center'>Action</th>
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
                                        <td>{data?.vehicleNo}</td>
                                        <td>{handleFormatDate(data?.date)}</td>
                                        <td className='text-center'>
                                            {
                                                editableMappings.includes(data?.mappingId) ? (
                                                    <Tooltip title="Update">
                                                        <Link to="#">
                                                            <CiEdit className='fs-4 text-success cursor-pointer' onClick={() => handleSelectMappingToBeUpdate(data?.mappingId, data)} />
                                                        </Link>
                                                    </Tooltip>
                                                ) : ""
                                            }
                                        </td>
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
