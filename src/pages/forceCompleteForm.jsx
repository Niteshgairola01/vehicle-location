import React, { useEffect, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import { Input, Radio } from '../components/form/Input'
import Button from '../components/Button/coloredButton'
import { ErrorToast, SuccessToast, WarningToast } from '../components/toast/toast'
import { forceCompleteTrip } from '../hooks/tripsHooks'

const ForceCompleteForm = ({ show, setShow, data }) => {
    const [form, setForm] = useState([]);
    const [selectedDate, setSelectedDate] = useState('custom');
    const [unloadingReachDate, setUnloadingReachDate] = useState('');
    const [unloadingDate, setUnloadingDate] = useState('');

    const handleChangeUnalodingReactDate = (e) => {
        const val = e.target.value;

        const vehicleExitDate = new Date(data?.vehicleExitDate);
        const newValue = new Date(val);

        console.log("vehicleExitDate", vehicleExitDate);
        console.log("newValue", newValue);

        console.log("less", vehicleExitDate < newValue);

    }

    useEffect(() => {
        setForm([data?.operationUniqueID])
    }, [data]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const vehicleExitDate = new Date(data?.vehicleExitDate);
        const newValue = new Date(unloadingReachDate);
        const newUnloadingDate = new Date(unloadingDate);

        const formattedNewDate = `${newValue.getFullYear()}-${String(newValue.getMonth() + 1).padStart(2, '0')}-${String(newValue.getDate()).padStart(2, '0')} ${String(newValue.getHours()).padStart(2, '0')}:${String(newValue.getMinutes()).padStart(2, '0')}:${String(newValue.getSeconds()).padStart(2, '0')}`;
        const formattedNewUnloadingDate = `${newUnloadingDate.getFullYear()}-${String(newUnloadingDate.getMonth() + 1).padStart(2, '0')}-${String(newUnloadingDate.getDate()).padStart(2, '0')} ${String(newUnloadingDate.getHours()).padStart(2, '0')}:${String(newUnloadingDate.getMinutes()).padStart(2, '0')}:${String(newUnloadingDate.getSeconds()).padStart(2, '0')}`;

        const form = ["1161", String(formattedNewUnloadingDate), String(formattedNewDate)]

        console.log("form", form);

        if (vehicleExitDate > newValue) {
            ErrorToast("Unloading Reach Date must be greater than Vehicle Exit Date");
        } else if (newUnloadingDate < newValue) {
            ErrorToast("Unloading Date must be euqal or greater than Unaloding Reach Date");
        } else if (form.length === 3) {
            forceCompleteTrip(form).then((response) => {
                console.log("response", response);
            })
        } else {
            WarningToast("Fill all the required fields ! ! ! !");
        }

    }

    // console.log("form", form);

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
                                <Input label="Unloading Reach Date" type={'text'} onChange={(e) => setUnloadingReachDate(e.target.value)} required={true} placeholder="DD/MM/YYYY" />
                            </Col>
                            <Col sm={12} md={12} lg={4}>
                                <Input label="Unloading Date" type={'text'} onChange={(e) => setUnloadingDate(e.target.value)} required={true} placeholder="DD/MM/YYYY" />
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
