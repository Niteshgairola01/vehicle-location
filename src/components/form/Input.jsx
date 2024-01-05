import React from 'react'
import { Form } from 'react-bootstrap'

const Input = ({ label, value, name, type, className, onChange, onClick, placeholder, required, autocomplete }) => {
    return (
        <Form.Group>
            <Form.Label>{label}</Form.Label>
            <Form.Control name={name} type={type} className={`inputfield ${className}`} value={value} onChange={onChange} onClick={onClick} placeholder={placeholder} required={required}
                autocomplete={autocomplete}
                style={{ fontSize: "0.8rem" }}
            />
        </Form.Group>
    )
}

export default Input
