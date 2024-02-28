import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { Col, Form, Row } from 'react-bootstrap'
import { Input } from '../../components/form/Input'
import Button from '../../components/Button/coloredButton'
import { getAllOfficesList } from '../../hooks/officeMasterHooks'
import { ErrorToast, SuccessToast } from '../../components/toast/toast'
import { createDriver, getAllDrivers, updateDriver } from '../../hooks/drivermasterHooks'
import Select from 'react-select';

// MUI

import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs'

const useStyles = makeStyles({
    input: {
        '& input': {
            padding: '0.3rem !important',
        },
        overflow: 'hidden',
        padding: '0',
    },
});

const DriverForum = () => {
    const classes = useStyles();

    const [form, setForm] = useState({});
    const [newDriverId, setNewDrivereId] = useState('');
    const [applicationDate, setApplicationDate] = useState('');
    const [dob, setDob] = useState('');
    const [licenceIssueDate, setLicenceIssueDate] = useState('');
    const [licenceExpiryDate, setLicenceExpiryDate] = useState('');

    const [driverName, setDriverName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [religion, setReligion] = useState('');
    const [aadharNo, setAadharNo] = useState('');
    const [licenceNo, setLicenceNo] = useState('');
    const [licenceIssuedFrom, setLicenceIssuedFrom] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [alternativePhone, setAlternativePhone] = useState('');
    const [guarantor, setGuarantor] = useState('');
    const [guarantorCode, setGuarantorCode] = useState('');
    const [guarantorPhone, setGuarantorPhone] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContactPerson, setEmergencyContactPerson] = useState('');
    const [contactPersonPhone, setContactPersonPhone] = useState('');

    const [officesList, setOfficesList] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('');

    const [driversList, setDriversList] = useState([]);
    const [filteredDrivers, setfilteredDrivers] = useState([]);
    const [showDriversList, setShowDriversList] = useState(false);
    const [searchDriver, setSearchDriver] = useState('');
    const [searchDriverCode, setSearchDriverCode] = useState('');
    const [selectedDriver, setSelectedDriver] = useState({});

    const [allGuarantorCodes, setAllGuarantorCodes] = useState([]);
    const [selectedGuarantor, setSelectedGuarantor] = useState('');
    const [selfGuarantor, setSelfGuarantor] = useState(false);

    const [formattedDOB, setFormattedBOD] = useState('');
    const [formattedApplicationDate, setFormattedApplicationDate] = useState('');
    const [formattedIssueDate, setFormattedIssueDate] = useState('');
    const [formattedExpiryDate, setFormattedExpiryDate] = useState('');

    const [firstLoad, setFirstLoad] = useState(true);

    const loggedInUser = localStorage.getItem('userId');

    useEffect(() => {
        setForm({
            ...form,
            createdByUser: loggedInUser
        });
    }, [loggedInUser]);

    const getDrviersList = () => {
        getAllDrivers().then(response => {
            if (response?.status === 200) {
                const allData = response?.data;
                setDriversList(response?.data);
                setfilteredDrivers(allData);

                let codes = [];
                allData.map(data => {
                    codes.push({
                        driverGuarantor: data?.driverName,
                        guarantorPhoneNumber: data?.contactNumber,
                        label: data?.driverCode,
                        value: data?.driverCode
                    })
                });

                setAllGuarantorCodes(codes);

            } else setDriversList([]);
        }).catch(() => setDriversList([]));
    }

    useEffect(() => {
        getDrviersList();
    }, []);

    useEffect(() => {
        getAllOfficesList().then(response => {
            if (response.status === 200) {
                if (response?.data.length > 0) {
                    const filteredData = response?.data.map(data => ({
                        ...data,
                        label: data?.officeName,
                        value: data?.officeName
                    }));

                    setOfficesList(filteredData);
                } else {
                    setOfficesList([]);
                }
            } else {
                setOfficesList([]);
            }
        }).catch(() => setOfficesList([]));
    }, []);

    useEffect(() => {
        if ((selectedDriver?.driverCode === undefined) && firstLoad) {
            const today = new Date();

            const date = today.getDate();
            const month = today.getMonth();
            const year = today.getFullYear();

            const hours = today.getHours();
            const minutes = today.getMinutes();
            const seconds = today.getSeconds();

            const dateTimeObject = {
                $D: date,
                $H: hours,
                $L: "en",
                $M: month,
                $W: 0,
                $d: today,
                $isDayjsObject: true,
                $m: minutes,
                $ms: 0,
                $s: seconds,
                $u: undefined,
                $x: {},
                $y: year
            }

            const currentDay = dateTimeObject?.$D < 10 ? `0${dateTimeObject?.$D}` : dateTimeObject?.$D;
            const currentMonth = (dateTimeObject?.$M + 1) < 10 ? `0${dateTimeObject?.$M + 1}` : dateTimeObject?.$M + 1;
            const currentYear = dateTimeObject?.$y < 10 ? `0${dateTimeObject?.$y}` : dateTimeObject?.$y;
            const currentHours = dateTimeObject?.$H < 10 ? `0${dateTimeObject?.$H}` : dateTimeObject?.$H;
            const currentMinute = dateTimeObject?.$m < 10 ? `0${dateTimeObject?.$m}` : dateTimeObject?.$m;
            const currentSeconds = dateTimeObject?.$s < 10 ? `0${dateTimeObject?.$s}` : dateTimeObject?.$s;

            const formattedDate = `${currentYear}-${currentMonth}-${currentDay} ${currentHours}:${currentMinute}:${currentSeconds}`;

            setApplicationDate(dayjs(formattedDate));
            setFormattedApplicationDate(formattedDate);

            setForm({
                ...form,
                applicationDate: formattedDate
            });

            setTimeout(() => {
                setFirstLoad(false);
            }, 500);

        }
    }, [selectedDriver, firstLoad, applicationDate]);

    useEffect(() => {
        if (selectedDriver?.driverCode === undefined || searchDriver.length === 0) {
            if (driversList.length > 0) {
                const latestDriverCode = driversList[driversList.length - 1]?.driverCode;

                const splittedDriverId = latestDriverCode.split('-');

                const newNumber = (parseInt(splittedDriverId[1]) + 1 < 100 && parseInt(splittedDriverId[1]) + 1 < 10) ?
                    `00${parseInt(splittedDriverId[1]) + 1}`
                    : parseInt(splittedDriverId[1]) + 1 < 100 && parseInt(splittedDriverId[1]) + 1 >= 10
                        ? `0${parseInt(splittedDriverId[1]) + 1}` : parseInt(splittedDriverId[1]) + 1;

                setNewDrivereId(`DVR-${newNumber}`);
            }
        }
    }, [driversList, selectedDriver, searchDriver]);

    useEffect(() => {
        if (searchDriver === "") {
            setSelectedDriver({});
            setfilteredDrivers(driversList);
        }
    }, [searchDriver]);

    useEffect(() => {
        if (searchDriver?.length > 0) {
            if ((parseInt(searchDriverCode))) {
                setfilteredDrivers(driversList.filter(data => data?.driverCode.toLowerCase().includes(searchDriverCode.toLowerCase())));
            } else {
                setfilteredDrivers(driversList.filter(data => data?.driverName.toLowerCase().includes(searchDriver.toLowerCase())));
            }
        }
    }, [searchDriver, searchDriverCode]);

    const handleChangeAppicationdate = (dateTime) => {
        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;
        const hours = dateTime?.$H < 10 ? `0${dateTime?.$H}` : dateTime?.$H;
        const minute = dateTime?.$m < 10 ? `0${dateTime?.$m}` : dateTime?.$m;
        const seconds = dateTime?.$s < 10 ? `0${dateTime?.$s}` : dateTime?.$s;

        const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${seconds}`;
        setApplicationDate(formattedDate);
        setFormattedApplicationDate(formattedDate);

        setForm({
            ...form,
            applicationDate: formattedDate
        });
    };

    const handleSelectDriver = (driver) => {
        setSearchDriver(driver?.driverName);
        setSearchDriverCode(driver?.driverCode);
        setSelectedDriver(driver);

        setNewDrivereId(driver?.driverCode);

        setDriverName(driver?.driverName);
        setFatherName(driver?.fatherName);
        setReligion(driver?.religion);
        setAadharNo(driver?.aadharNumber);
        setLicenceNo(driver?.licenceNumber);
        setLicenceIssuedFrom(driver?.licenseIssuedFrom);
        setContactNumber(driver?.contactNumber);
        setAlternativePhone(driver?.alternatePhoneNumber);
        setGuarantor(driver?.driverGuarantor);
        setGuarantorCode(driver?.driverGuarantorCode);
        setGuarantorPhone(driver?.guarantorPhoneNumber);
        setAddress(driver?.address);
        setEmergencyContactPerson(driver?.emergencyContactPerson);
        setContactPersonPhone(driver?.emergencyContactPhoneNumber);

        setFormattedBOD(driver?.dateOfBirth);
        setFormattedApplicationDate(driver?.applicationDate);
        setFormattedExpiryDate(driver?.licenceExpiryDate);
        setFormattedIssueDate(driver?.licenceIssueDate);

        setSelectedOffice({
            label: driver?.office,
            value: driver?.office,
        });

        setSelectedGuarantor({
            label: driver?.driverGuarantorCode,
            value: driver?.driverGuarantorCode,
        });

        setApplicationDate(dayjs(driver?.applicationDate));
        setDob(dayjs(driver?.dateOfBirth));
        setLicenceIssueDate(dayjs(driver?.licenceIssueDate));
        setLicenceExpiryDate(dayjs(driver?.licenceExpiryDate));

        delete form.applicationDate
    };

    useEffect(() => {
        if (selectedDriver?.driverName === undefined) {
            setDriverName('');
            setFatherName('');
            setReligion('');
            setAadharNo('');
            setLicenceNo('');
            setLicenceIssuedFrom('');
            setContactNumber('');
            setAlternativePhone('');
            setGuarantor('');
            setGuarantorCode('');
            setGuarantorPhone('');
            setAddress('');
            setEmergencyContactPerson('');
            setContactPersonPhone('');

            setFormattedBOD('');
            setFormattedApplicationDate('');
            setFormattedExpiryDate('');
            setFormattedIssueDate('');
            setSelectedOffice('');

            setApplicationDate(dayjs(new Date()));
            setDob('');
            setLicenceIssueDate('');
            setLicenceExpiryDate('');

            setFirstLoad(true);
        }
    }, [selectedDriver]);

    useEffect(() => {
        setForm({
            ...form,
            createdByUser: loggedInUser,
            driverName,
            fatherName,
            religion,
            aadharNumber: aadharNo,
            licenceNumber: licenceNo,
            licenseIssuedFrom: licenceIssuedFrom,
            contactNumber,
            alternatePhoneNumber: alternativePhone,
            ...(selfGuarantor ? { driverGuarantor: 'Self Guarantor' } : { driverGuarantor: guarantor }),
            ...(selfGuarantor ? { driverGuarantorCode: ' ' } : { driverGuarantorCode: selectedGuarantor?.value }),
            ...(selfGuarantor ? { guarantorPhoneNumber: ' ' } : { guarantorPhoneNumber: guarantorPhone }),
            address,
            driverCode: newDriverId,
            emergencyContactPerson,
            emergencyContactPhoneNumber: contactPersonPhone,
            office: selectedOffice?.value
        })
    }, [newDriverId, selectedGuarantor, selectedDriver, selectedOffice, driverName, fatherName, religion, aadharNo, licenceNo, licenceIssuedFrom, contactNumber, alternativePhone, guarantor, guarantorCode, guarantorPhone, address, emergencyContactPerson, contactPersonPhone]);

    const handleChangeDob = (dateTime) => {
        setDob(dateTime);

        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;

        const formattedDate = `${year}-${month}-${day}`;
        setFormattedBOD(formattedDate);

        setForm({
            ...form,
            dateOfBirth: formattedDate
        });
    };

    const handleChangeLicenceIssuedate = (dateTime) => {
        setLicenceIssueDate(dateTime);

        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;

        const formattedDate = `${year}-${month}-${day}`;
        setFormattedIssueDate(formattedDate);
        setForm({
            ...form,
            licenceIssueDate: formattedDate
        });
    };

    const handleChangeLicenceExpirydate = (dateTime) => {
        setLicenceExpiryDate(dateTime);

        const day = dateTime?.$D < 10 ? `0${dateTime?.$D}` : dateTime?.$D;
        const month = (dateTime?.$M + 1) < 10 ? `0${dateTime?.$M + 1}` : dateTime?.$M + 1;
        const year = dateTime?.$y < 10 ? `0${dateTime?.$y}` : dateTime?.$y;

        const formattedDate = `${year}-${month}-${day}`;
        setFormattedExpiryDate(formattedDate);
        setForm({
            ...form,
            licenceExpiryDate: formattedDate
        });
    };

    const handleChangeOffice = (office) => {
        setSelectedOffice(office);

        setForm({
            ...form,
            office: office?.value
        });
    };

    useEffect(() => {
        if (selfGuarantor) {
            setSelectedGuarantor({
                driverGuarantor: driverName,
                guarantorPhoneNumber: contactNumber,
                driverGuarantorCode: newDriverId,
                label: newDriverId,
                value: newDriverId
            });

            setGuarantor(driverName);
            setGuarantorPhone(contactNumber);
        } else {
            setSelectedGuarantor('');
            setGuarantor('');
            setGuarantorPhone('');
        }
    }, [selfGuarantor]);

    const handleChangeGuarantor = (guarantor) => {
        setSelectedGuarantor(guarantor);

        setGuarantor(guarantor?.driverGuarantor);
        setGuarantorPhone(guarantor?.guarantorPhoneNumber);
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (applicationDate?.length === 0 || dob?.length === 0 || licenceIssueDate?.length === 0 || licenceExpiryDate?.length === 0
            || (selectedOffice === null || selectedOffice.length === 0) || (selectedGuarantor?.value === null || selectedGuarantor.length === 0)
            || contactPersonPhone.length < 10 || alternativePhone.length < 10 || contactNumber.length < 10 || aadharNo.length < 12) {

            if (applicationDate?.length === 0) {
                ErrorToast('Select Application Date');
            }

            if (dob?.length === 0) {
                ErrorToast('Select DOB');
            }

            if (licenceIssueDate?.length === 0) {
                ErrorToast('Select Licence Issue date');
            }

            if (licenceExpiryDate?.length === 0) {
                ErrorToast('Select Licence Expiry Date');
            }

            if (selectedOffice === null || selectedOffice.length === 0) {
                ErrorToast('Select Office');
            }

            if (selectedGuarantor?.value === null || selectedGuarantor.length === 0) {
                ErrorToast('Select Guarantor');
            }

            if (contactPersonPhone.length < 10) {
                ErrorToast('Contact person phone number can not be of less than 10 digits');
            }

            if (alternativePhone.length < 10) {
                ErrorToast('Alternative phone no. number can not be of less than 10 digits');
            }

            if (contactNumber.length < 10) {
                ErrorToast('Contact number can not be of less than 10 digits');
            }

            if (aadharNo.length < 12) {
                ErrorToast('Aadhar number can not be of less than 12 digits');
            }
        }
        else {
            if (searchDriver.length === 0) {
                createDriver(form).then(response => {
                    if (response?.status === 200) {
                        SuccessToast("Driver Created Successfully");
                        getDrviersList();
                        setSelectedDriver({});
                    }
                }).catch(err => {
                    err?.response?.data && ErrorToast(err?.response?.data);
                });
            } else {
                const newForm = {
                    modifiedBy: loggedInUser,
                    driverCode: newDriverId,
                    ...(formattedDOB !== selectedDriver?.dateOfBirth && { dateOfBirth: formattedDOB }),
                    ...(formattedIssueDate !== selectedDriver?.licenceIssueDate && { licenceIssueDate: formattedIssueDate }),
                    ...(formattedExpiryDate !== selectedDriver?.licenceExpiryDate && { licenceExpiryDate: formattedExpiryDate }),
                    ...(formattedApplicationDate !== selectedDriver?.applicationDate && { applicationDate: formattedApplicationDate }),
                    ...(driverName !== selectedDriver?.driverName && { driverName }),
                    ...(fatherName !== selectedDriver?.fatherName && { fatherName }),
                    ...(religion !== selectedDriver?.religion && { religion }),
                    ...(aadharNo !== selectedDriver?.aadharNumber && { aadharNumber: aadharNo }),
                    ...(licenceNo !== selectedDriver?.licenceNumber && { licenceNumber: licenceNo }),
                    ...(licenceIssuedFrom !== selectedDriver?.licenseIssuedFrom && { licenseIssuedFrom: licenceIssuedFrom }),
                    ...(driverName !== selectedDriver?.driverName && { driverName }),
                    ...(parseInt(contactNumber) !== selectedDriver?.contactNumber && { contactNumber }),
                    ...(parseInt(alternativePhone) !== selectedDriver?.alternatePhoneNumber && { alternatePhoneNumber: alternativePhone }),
                    ...(selfGuarantor ? { driverGuarantor: "Self Guarantor" } : guarantor !== selectedDriver?.driverGuarantor && { driverGuarantor: guarantor }),
                    ...(selfGuarantor ? { driverGuarantorCode: "" } : selectedGuarantor?.value !== selectedDriver?.driverGuarantorCode && { driverGuarantorCode: selectedGuarantor?.value }),
                    ...(selfGuarantor ? { guarantorPhoneNumber: "" } : parseInt(guarantorPhone) !== selectedDriver?.guarantorPhoneNumber && { guarantorPhoneNumber: selectedGuarantor?.guarantorPhoneNumber }),
                    ...(address !== selectedDriver?.address && { address }),
                    ...(emergencyContactPerson !== selectedDriver?.emergencyContactPerson && { emergencyContactPerson }),
                    ...(parseInt(contactPersonPhone) !== selectedDriver?.emergencyContactPhoneNumber && { emergencyContactPhoneNumber: contactPersonPhone }),
                    ...(selectedOffice?.value !== selectedDriver?.office && { office: selectedOffice?.value }),
                    ...(selectedOffice?.value !== selectedDriver?.office && { office: selectedOffice?.value }),
                };

                if (Object.keys(newForm).length === 1 && newForm.hasOwnProperty('modifiedByUser')) {
                    ErrorToast("Nothing to update");
                } else {
                    updateDriver(newForm).then(response => {
                        if (response?.status === 200) {
                            SuccessToast("Driver Updated Successfully");
                            setSelectedDriver({});
                        }
                    }).catch(err => {
                        err?.response?.data && ErrorToast(err?.response?.data);
                    });
                }
            }
        }
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

    const handleShowOptions = () => {
        showDriversList && setShowDriversList(false);
    };

    return (
        <div className='thm-dark m-0 p-0 p-5 pt-3' onClick={() => handleShowOptions()}>
            <Card>
                <div className='w-100 d-flex justify-content-between align-items-center'>
                    <h5 className='m-0 p-0'>Create Driver</h5>
                </div>
            </Card>

            <div className='w-100 d-flex justify-content-center align-items-center'>
                <div className='' style={{ width: "70%" }}>
                    <Card>
                        <div className=' w-25 m-0 p-0 position-relative'>
                            <Form.Control type='search' className='inputfield' value={searchDriver} onChange={(e) => {
                                setSearchDriverCode(e.target.value)
                                setSearchDriver(e.target.value)
                            }} onClick={() => setShowDriversList(true)} placeholder='Search Driver (By Name / Driver Code)' style={{ fontSize: '0.8rem', width: "18rem" }} />

                            {
                                showDriversList ? (
                                    <div className='mt-1 polygons-list position-absolute bg-white' style={{ boxShadow: "0px 0px 10px 0px #c8c9ca", width: "100%", zIndex: '2' }} >
                                        {
                                            filteredDrivers.map((data, index) => (
                                                <div className={`p-0 py-1 cursor-pointer ${((selectedDriver?.driverName === data?.driverName) && (selectedDriver?.driverCode === data?.driverCode)) ? 'active-category' : 'category'}`}
                                                    onClick={() => handleSelectDriver(data)}
                                                    key={index}>
                                                    <span className="m-0 ps-2 w-100">
                                                        {data?.driverName === null || data?.driverName === '' ? '' : `${data?.driverName}`}
                                                    </span>
                                                    <span className='ms-1' style={{ color: ((selectedDriver?.driverName === data?.driverName) && (selectedDriver?.driverCode === data?.driverCode)) ? '#fff' : 'gray', fontSize: "0.7rem" }}>
                                                        ({data?.driverCode === null || data?.driverCode === '' ? '' : `${data?.driverCode}`})
                                                    </span>
                                                </div>
                                            ))
                                        }
                                        {
                                            filteredDrivers.length === 0 ? (
                                                <div className='w-100 py-2 text-center text-secondary'>
                                                    No driver found
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                ) : null
                            }
                        </div>

                        <hr />

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col sm={12} md={6} lg={3}>
                                    <Input value={newDriverId} label="Driver Code" type='text' name="driverCode" disabled required={true} />
                                </Col>

                                <Col sm={12} md={6} lg={3}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>Application Date</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                            <DemoItem>
                                                <DateTimePicker
                                                    views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                                    format="DD/MM/YYYY HH:mm:ss"
                                                    ampm={false}
                                                    value={applicationDate}
                                                    onChange={handleChangeAppicationdate}
                                                    style={{ height: '10px' }}
                                                    className={classes.input}
                                                />
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Col>

                                <Col sm={12} md={6} lg={6}>
                                    <Input label="Driver Name" type='text' value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Name" required={true} />
                                </Col>
                            </Row>

                            <Row className='my-2'>
                                <Col sm={12} md={6} lg={5}>
                                    <Input label="Father's Name" type='text' value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Father's Name" required={true} />
                                </Col>

                                <Col sm={12} md={6} lg={3}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>DOB</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                            <DemoItem>
                                                <DateTimePicker
                                                    views={['year', 'month', 'day']}
                                                    format="DD/MM/YYYY"
                                                    ampm={false}
                                                    value={dob}
                                                    onChange={handleChangeDob}
                                                    style={{ height: '10px' }}
                                                    className={classes.input}
                                                />
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Col>

                                <Col sm={12} md={6} lg={4}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>Office</Form.Label>
                                    <Select
                                        className='w-100'
                                        options={officesList}
                                        value={selectedOffice}
                                        onChange={handleChangeOffice}
                                        isClearable={true}
                                        styles={selectStyles}
                                        placeholder="Search Office"
                                    />
                                    {/* <Input label="Office" type='text' name="office" required={true} /> */}
                                </Col>
                            </Row>

                            <Row className='my-2'>
                                <Col sm={12} md={6} lg={3}>
                                    <Input label="Religion" type='text' value={religion} onChange={(e) => setReligion(e.target.value)} placeholder="Religion" required={false} />
                                </Col>

                                <Col sm={12} md={6} lg={5}>
                                    <Input label="Aadhar No." type='number' value={aadharNo} onChange={(e) => {
                                        e.target.value = e.target.value.slice(0, 12);
                                        setAadharNo(e.target.value)
                                    }} placeholder='Aadhar ' required={true} />
                                </Col>

                                <Col sm={12} md={6} lg={4}>
                                    <Input label="Licence No." type='text' value={licenceNo} onChange={(e) => setLicenceNo(e.target.value)} placeholder="Licence No." required={true} />
                                </Col>
                            </Row>

                            <Row className='my-2'>
                                <Col sm={12} md={6} lg={4}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>Licence Issue Date</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                            <DemoItem>
                                                <DateTimePicker
                                                    views={['year', 'month', 'day']}
                                                    format="DD/MM/YYYY"
                                                    ampm={false}
                                                    value={licenceIssueDate}
                                                    onChange={handleChangeLicenceIssuedate}
                                                    style={{ height: '10px' }}
                                                    className={classes.input}
                                                />
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Col>

                                <Col sm={12} md={6} lg={4}>
                                    <Form.Label className='fw-400 thm-dark mb-0'>Licence Expiry Date</Form.Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}>
                                            <DemoItem>
                                                <DateTimePicker
                                                    views={['year', 'month', 'day']}
                                                    format="DD/MM/YYYY"
                                                    ampm={false}
                                                    value={licenceExpiryDate}
                                                    onChange={handleChangeLicenceExpirydate}
                                                    style={{ height: '10px' }}
                                                    className={classes.input}
                                                />
                                            </DemoItem>
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Col>

                                <Col sm={12} md={6} lg={4}>
                                    <Input label="Licence Issued From" type='text' value={licenceIssuedFrom} onChange={(e) => setLicenceIssuedFrom(e.target.value)} placeholder="Issued From" required={true} />
                                </Col>
                            </Row>

                            <Row className='my-2'>
                                <Col sm={12} md={6} lg={3}>
                                    <Input label="Contact Number" type='number' value={contactNumber} onChange={(e) => {
                                        e.target.value = e.target.value.slice(0, 10);
                                        setContactNumber(e.target.value)
                                    }} placeholder="1234567899" required={true} />
                                </Col>

                                <Col sm={12} md={6} lg={3}>
                                    <Input label="Alternative Phone No." type='number' value={alternativePhone} onChange={(e) => {
                                        e.target.value = e.target.value.slice(0, 10);
                                        setAlternativePhone(e.target.value)
                                    }} placeholder="1234567899" required={true} />
                                </Col>

                                <Col sm={12} md={6} lg={6}>
                                    <Input label="Address" type='text' value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required={true} />
                                </Col>
                            </Row>

                            <Row className='my-2'>
                                <Col sm={12} md={6} lg={4}>
                                    <div className='w-100 d-flex mb-1 justify-content-between align-items-center'>
                                        <Form.Label className='fw-400 thm-dark mb-0'>Guarantor Code</Form.Label>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <Form.Check className='' onChange={() => setSelfGuarantor(!selfGuarantor)} checked={selfGuarantor} />
                                            <Form.Label className='ms-2 pt-1 cursor-pointer' onClick={() => setSelfGuarantor(!selfGuarantor)}>Self Guarantor</Form.Label>
                                        </div>
                                    </div>
                                    <Select
                                        className='w-100'
                                        options={allGuarantorCodes}
                                        value={selectedGuarantor}
                                        onChange={handleChangeGuarantor}
                                        isDisabled={selfGuarantor}
                                        isClearable={true}
                                        styles={selectStyles}
                                        placeholder="Search Code"
                                    />
                                </Col>

                                <Col sm={12} md={6} lg={5}>
                                    <Input label="Guarantor" type='text' value={guarantor} onChange={(e) => setGuarantor(e.target.value)} required={true} disabled />
                                </Col>

                                <Col sm={12} md={6} lg={3}>
                                    <Input label="Guarantor Phone No." type='number' value={guarantorPhone} onChange={(e) => {
                                        e.target.value = e.target.value.slice(0, 10);
                                        setGuarantorPhone(e.target.value)
                                    }} disabled required={true} />
                                </Col>

                            </Row>

                            <Row className='my-2'>
                                <Col sm={12} md={6} lg={4}>
                                    <Input label="Emergency Contact Person" type='text' value={emergencyContactPerson} onChange={(e) => setEmergencyContactPerson(e.target.value)} placeholder="Name" required={true} />
                                </Col>

                                <Col sm={12} md={6} lg={3}>
                                    <Input label="Contact person Phone No." type='number' value={contactPersonPhone} onChange={(e) => {
                                        e.target.value = e.target.value.slice(0, 10);
                                        setContactPersonPhone(e.target.value)
                                    }} placeholder="1234567899" required={true} />
                                </Col>
                            </Row>

                            <div className='w-100 mt-5 d-flex justify-content-end align-items-end'>
                                <Button type="submit" className="px-5">{selectedDriver?.driverName === undefined ? 'Save' : 'Update'}</Button>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DriverForum
