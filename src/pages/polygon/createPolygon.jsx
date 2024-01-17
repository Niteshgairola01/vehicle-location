import React, { useState } from 'react'
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import Button from '../../components/Button/hoveredButton'
import ColoredButton from '../../components/Button/coloredButton'
import { Col, Form, Row, Tooltip } from 'react-bootstrap'
import Card from '../../components/Card/card'
import Select from 'react-select';
import { Input } from '../../components/form/Input';

const CreatePolygon = ({ setCurrentPage }) => {

    const [form, setForm] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');

    const allCategories = [
        {
            label: 'Reach Point',
            value: 'Reach Point'
        },
        {
            label: 'Parking',
            value: 'Parking'
        },
        {
            label: 'Plant',
            value: 'Plant'
        },
        {
            label: 'Dealer',
            value: 'Dealer'
        }
    ]
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

    const handleSelectCtegory = (category) => {
        console.log("category", category);
        setSelectedCategory(category?.value)
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    const center = {
        lat: parseFloat(20.12345),
        lng: parseFloat(68.12345),
    };

    // const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    const key = "ABC";

    return (
        <div>
            <div className='my-3 d-flex justify-content-end align-items-end'>
                <Button className="px-3" onClick={() => setCurrentPage('List')}>Back</Button>
            </div>
            <Row>
                <Col sm={12} md={12} lg={4} className='pe-3'>
                    <Card>
                        <h6 className='thm-dark'>Create New Polygon</h6>
                        <hr />
                        <Form onSubmit={handleSubmit}>
                            <Col sm={6} className='position-relative'>
                                <Form.Label className='thm-dark'>Category</Form.Label>
                                <Select
                                    options={allCategories}
                                    value={selectedCategory}
                                    onChange={handleSelectCtegory}
                                    isClearable={true}
                                    styles={selectStyles}
                                />
                            </Col>

                            <Col sm={6} className='mt-3'>
                                <Input label="Place" type="text" name="place" onChange={handleChange} placeholder="Place Name" />
                            </Col>

                            {
                                (selectedCategory === "Dealer" || selectedCategory === "Plant") ? (
                                    <div>
                                        {
                                            selectedCategory === 'Dealer' ? (
                                                <Col sm={6} className='mt-3'>
                                                    <Input label="Dealer" type="text" name="dealer" onChange={handleChange} placeholder="Delaer" />
                                                </Col>
                                            ) : (
                                                <Col sm={6} className='mt-3'>
                                                    <Input label="Plant" type="text" name="plant" onChange={handleChange} placeholder="Plant" />
                                                </Col>
                                            )
                                        }
                                    </div>
                                ) : null
                            }
                            <div className='mt-5 d-flex justify-content-center align-items-center'>
                                <ColoredButton className="px-5 w-75 py-1" type="submit">Create</ColoredButton>
                            </div>
                        </Form>
                    </Card>
                </Col>
                <Col sm={12} md={12} lg={8} style={{ height: "65vh" }}>
                    <LoadScript googleMapsApiKey={key}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={11}
                        >
                            <MarkerF position={center} />
                        </GoogleMap>
                    </LoadScript>
                </Col>
            </Row>
        </div>
    )
}

export default CreatePolygon
