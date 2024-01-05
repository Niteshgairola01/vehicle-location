import React from 'react'
import { Form } from 'react-bootstrap'

const Select = ({ label, name, value, onChange, options, required }) => {
    return (
        <Form.Group>
            <Form.Label>{label}</Form.Label>
            <Form.Select name='name' onChange={onChange} required={required}>
                {
                    options.map((data, index) => (
                        <option key={index}>{data}</option>
                    ))
                }
            </Form.Select>
        </Form.Group>
    )
}

export default Select
