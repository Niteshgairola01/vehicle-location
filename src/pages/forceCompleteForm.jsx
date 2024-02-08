import React, { useEffect, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import { Input, Radio } from '../components/form/Input'
import Button from '../components/Button/coloredButton'
import { ErrorToast, SuccessToast, WarningToast } from '../components/toast/toast'
import { deleteVehicleOnTripComplete, forceCompleteTrip } from '../hooks/tripsHooks'

const ForceCompleteForm = ({ getAllTrips, handleFilterTrips, show, setShow, data }) => {
    const [selectedDate, setSelectedDate] = useState('custom');
    const [unloadingReachDate, setUnloadingReachDate] = useState('');
    const [unloadingDate, setUnloadingDate] = useState('');
    const [remark, setRemark] = useState('');
    const [showLoader, setShowLoader] = useState(false);

    const handleForceCompleteTrip = (form) => {
        forceCompleteTrip(form).then((response) => {
            if (response?.data === "Data Updated Successfully!") {
                const [reachDatePart, reachTimePart] = unloadingReachDate.split(' ');
                const [reachDay, reachMonth, reachYear] = reachDatePart.split('/');
                const reachDateObject = new Date(`${reachYear}-${reachMonth}-${reachDay}T${reachTimePart}Z`);
                const formattedReachDate = reachDateObject.toISOString().slice(0, 19).replace('T', ' ');

                const deleteVehiclePayLoad = [data?.vehicleNo, formattedReachDate];
                SuccessToast(response?.data);

                (form[1].length > 0 && form[2].length > 0) ? deleteVehicleOnTripCompleteWithRetry(deleteVehiclePayLoad) : SuccessToast("Data Updated Successfully!");
            } else {
                ErrorToast("Unable to force complete trip");
                setShow(false);
                setShowLoader(false);
                setUnloadingDate('');
                setUnloadingReachDate('');
                setRemark('');
            }
        }).catch(() => ErrorToast("Something went wrong"));
    }

    const deleteVehicleOnTripCompleteWithRetry = async (deleteVehiclePayLoad) => {
        deleteVehicleOnTripComplete(deleteVehiclePayLoad).then((response) => {
            if (response?.data === "Vehicle Deleted Successfully!") {
                SuccessToast(response?.data);
                handleFilterTrips();
                getAllTrips();
                setUnloadingDate('');
                setUnloadingReachDate('');
                setRemark('');
                setShow(false);
                setShowLoader(false);
            } else if (response?.data === "Please Wait! Another Program is executing now. ") {
                setTimeout(() => deleteVehicleOnTripCompleteWithRetry(deleteVehiclePayLoad), 1000);
                ErrorToast(response?.data);
            } else {
                const operationIdArray = data?.operationUniqueID.split('.');
                const form = [operationIdArray[0], '', ''];
                handleForceCompleteTrip(form);
            }
        }).catch((err) => {
            if (err?.response && err?.response?.data === "Vehicle Not Found in List!") {
                const operationIdArray = data?.operationUniqueID.split('.');
                const form = [operationIdArray[0], '', ''];
                handleForceCompleteTrip(form);
                ErrorToast(err?.response?.data);
            } else {
                ErrorToast("Something went wrong");
                setShow(false);
                setShowLoader(false);
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const vehicleExitDate = new Date(data?.vehicleExitDate);
        const unloadingReachDateFormat = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;
        const unloadingDateFormat = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;

        if (!unloadingReachDate.match(unloadingReachDateFormat)) {
            ErrorToast('Check the format of Unloading Reach Date !');
        } else if (!unloadingDate.match(unloadingDateFormat)) {
            ErrorToast('Check the format of Unloading Date !');
        } else {
            const [reachDatePart, reachTimePart] = unloadingReachDate.split(' ');
            const [reachDay, reachMonth, reachYear] = reachDatePart.split('/');
            const reachDateObject = new Date(`${reachYear}-${reachMonth}-${reachDay}T${reachTimePart}Z`);
            const formattedReachDate = reachDateObject.toISOString().slice(0, 19).replace('T', ' ');

            const [unloadingDatePart, unloadingTimePart] = unloadingDate.split(' ');
            const [unloadingDay, unloadingMonth, unloadingYear] = unloadingDatePart.split('/');
            const unloadingDateObject = new Date(`${unloadingYear}-${unloadingMonth}-${unloadingDay}T${unloadingTimePart}Z`);
            const formattedUnloadingDate = unloadingDateObject.toISOString().slice(0, 19).replace('T', ' ');

            const operationIdArray = data?.operationUniqueID.split('.');

            const form = [operationIdArray[0], formattedUnloadingDate, formattedReachDate, remark];

            const reachDateParts = unloadingReachDate.split(/[\s/:-]+/);
            const customReachDate = new Date(`${reachDateParts[2]}-${reachDateParts[1]}-${reachDateParts[0]}T${reachDateParts[3]}:${reachDateParts[4]}:${reachDateParts[5]}`);

            const unloadingDateParts = unloadingDate.split(/[\s/:-]+/);
            const customUnloadingDate = new Date(`${unloadingDateParts[2]}-${unloadingDateParts[1]}-${unloadingDateParts[0]}T${unloadingDateParts[3]}:${unloadingDateParts[4]}:${unloadingDateParts[5]}`)

            if (vehicleExitDate > customReachDate) {
                ErrorToast("Unloading Reach Date must be greater than Vehicle Exit Date");
            } else if (customReachDate > customUnloadingDate) {
                ErrorToast("Unloading Date must be euqal or greater than Unaloding Reach Date");
            }
            else if (form.length === 4) {
                setShowLoader(true);
                handleForceCompleteTrip(form);
            } else {
                WarningToast("Fill all the required fields ! ! ! !");
            }
        }
    };

    useEffect(() => {
        const currentDate = new Date();
        const day = currentDate.getDate() >= 10 ? currentDate.getDate() : `0${currentDate.getDate()}`;
        const year = currentDate.getFullYear() >= 10 ? currentDate.getFullYear() : `0${currentDate.getFullYear()}`;
        const month = currentDate.getMonth() + 1 >= 10 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`;
        const hour = currentDate.getHours() >= 10 ? currentDate.getHours() : `0${currentDate.getHours()}`;
        const minute = currentDate.getMinutes() >= 10 ? currentDate.getMinutes() : `0${currentDate.getMinutes()}`;
        const seconds = currentDate.getSeconds() >= 10 ? currentDate.getSeconds() : `0${currentDate.getSeconds()}`;

        const formattedDate = `${day}/${month}/${year} ${hour}:${minute}:${seconds}`
        selectedDate === 'current' && setUnloadingReachDate(formattedDate);
    }, [selectedDate]);

    return (
        <Modal show={show} centered onHide={() => {
            setShow(false);
            setShowLoader(false);
            setUnloadingReachDate('')
        }} size='lg'>
            <Form className='position-relative' onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <h5 className='thm-dark'>Force Complete</h5>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <Row className='mb-3'>
                            <Col sm={12} md={12} lg={4}>
                                <Input label="Vehicle No." type={'text'} value={data?.vehicleNo} placeholder="Vehicle No." disabled={true} required={true} />
                            </Col>
                            <Col sm={12} md={12} lg={4}>
                                <Input label="Trip No." type={'text'} value={data?.tripLogNo} placeholder="Trip No." required={true} disabled={true} />
                            </Col>
                        </Row>

                        <hr />

                        <Row className='mt-3'>
                            <Col sm={12} md={12} lg={4}>
                                <Radio label="Custom" type="radio" checked={selectedDate === 'custom'} name="date"
                                    className='d-inline cursor-pointer mt-2 me-2' labelClass="cursor-pointer"
                                    onChange={() => setSelectedDate('custom')} onClick={() => setSelectedDate('custom')}
                                />
                            </Col>
                            <Col sm={12} md={12} lg={4}>
                                <Radio label="Current" type="radio" checked={selectedDate === 'current'} name="date"
                                    className='d-inline cursor-pointer mt-2 me-2' labelClass="cursor-pointer"
                                    onChange={() => setSelectedDate('current')} onClick={() => setSelectedDate('current')}
                                />
                            </Col>
                        </Row>

                        <Row className='mt-3'>
                            <Col sm={12} md={12} lg={4}>
                                <Input label="Unloading Reach Date" type={'text'}
                                    onChange={(e) => setUnloadingReachDate(e.target.value)}
                                    required={true} placeholder="DD/MM/YYYY HH:MM:SS"
                                    value={unloadingReachDate}
                                />
                                {/* {
                                    !reachDateFormat ? (
                                        <span className='fw-bold text-danger' style={{ fontSize: "0.7rem" }}>Format must be DD:MM:YYYY HH:MM:SS</span>
                                    ) : null
                                } */}
                            </Col>
                            <Col sm={12} md={12} lg={4}>
                                <Input label="Unloading Date" type={'text'} onChange={(e) => setUnloadingDate(e.target.value)} required={true} placeholder="DD/MM/YYYY HH:MM:SS" />
                                {/* {
                                    !unloadingDateFormat ? (
                                        <span className='fw-bold text-danger' style={{ fontSize: "0.7rem" }}>Format must be DD:MM:YYYY HH:MM:SS</span>
                                    ) : null
                                } */}
                            </Col>
                        </Row>

                        <Row className='mt-3'>
                            <Col sm={12}>
                                <Form.Label>Remark<span className='text-secondary ms-1 fs-6'>(optional)</span></Form.Label>
                                <Form.Control as="textarea" className='inputfield' onChange={(e) => setRemark(e.target.value)} cols={12} rows={3} placeholder='Add Remark' />
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-end align-items-end'>
                    <Button type="submit" className="px-3">Update</Button>
                </Modal.Footer>
            </Form>

            <div className={`position-absolute ${!showLoader && 'd-none'}`} style={{ width: "100%", height: "90%", top: "10%", zIndex: 2 }}>
                <div className={`main-loader-container h-100`}>
                    <div className="dot-spinner">
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ForceCompleteForm
