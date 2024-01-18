import React from 'react'
import { Form } from 'react-bootstrap'

export const Input = ({ label, value, name, type, className, onChange, onClick, placeholder, required, autocomplete, disabled }) => {
    return (
        <Form.Group>
            <Form.Label className='thm-dark'>{label}</Form.Label>
            <Form.Control name={name} type={type} className={`inputfield ${className}`} value={value} onChange={onChange} onClick={onClick} placeholder={placeholder} required={required}
                autoComplete={autocomplete} disabled={disabled}
                style={{ fontSize: "0.8rem" }}
            />
        </Form.Group>
    )
}

export const SearchField = ({ value, name, type, className, onChange, onClick, placeholder, required, autocomplete, disabled }) => {
    return (
        <Form.Control name={name} type={type} className={`inputfield ${className}`} value={value} onChange={onChange} onClick={onClick} placeholder={placeholder} required={required}
            autoComplete={autocomplete} disabled={disabled}
            style={{ fontSize: "0.8rem" }}
        />
    )
}

export const Checkbox = ({ label, checked, name, type, className, labelClass, onChange, onClick, required }) => {
    return (
        <Form.Group>
            <Form.Check name={name} className={className} checked={checked} onChange={onChange} type={type} required={required} />
            <Form.Label className={labelClass} onClick={onClick}>{label}</Form.Label>
        </Form.Group>
    )
}

export const Radio = ({ label, checked, name, type, className, labelClass, onChange, onClick, required }) => {
    return (
        <Form.Group>
            <Form.Check name={name} className={className} checked={checked} onChange={onChange} type={type} required={required} />
            <Form.Label className={labelClass} onClick={onClick}>{label}</Form.Label>
        </Form.Group>
    )
}

// export default Input
