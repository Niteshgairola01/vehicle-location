import React, { useEffect, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import { Input, Radio } from '../components/form/Input'
import Button from '../components/Button/coloredButton'
import { ErrorToast, SuccessToast, WarningToast } from '../components/toast/toast'
import { deleteVehicleOnTripComplete, forceCompleteTrip } from '../hooks/tripsHooks'

const ForceCompleteForm = ({ getAllTrips, show, setShow, data }) => {
    const [selectedDate, setSelectedDate] = useState('custom');
    const [unloadingReachDate, setUnloadingReachDate] = useState('');
    const [unloadingDate, setUnloadingDate] = useState('');
    const [remark, setRemark] = useState('');

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
                getAllTrips();
                setShow(false);
                setUnloadingDate('');
                setUnloadingReachDate('');
                setRemark('');
            } else if (response?.data === "Please Wait! Another Program is executing now. ") {
                setTimeout(() => deleteVehicleOnTripCompleteWithRetry(deleteVehiclePayLoad), 1000);
                ErrorToast(response?.data);
            }
            //  else if (response?.data === "Vehicle Not Found in List") {
            //     setShow(false);
            //     getAllTrips();
            // }
            else {
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
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const vehicleExitDate = new Date(data?.vehicleExitDate);
        const newValue = new Date(unloadingReachDate);
        const newUnloadingDate = new Date(unloadingDate);

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

            if (vehicleExitDate > newValue) {
                ErrorToast("Unloading Reach Date must be greater than Vehicle Exit Date");
            } else if (newUnloadingDate < newValue) {
                ErrorToast("Unloading Date must be euqal or greater than Unaloding Reach Date");
            }
            else if (form.length === 4) {
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
        <Modal show={show} centered onHide={() => setShow(false)} size='lg'>
            <Form onSubmit={handleSubmit}>
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
        </Modal>
    )
}

export default ForceCompleteForm
