import React from 'react'

export const Toggle = ({ value, onChange, checked }) => {
    return (
        <input className="switch" type="checkbox" />
    )
};

export const DisabledButton = ({ children, className, onClick }) => {
    return (
        <button type={'button'} className={`disabled-button ${className || ''}`} onClick={onClick}>{children}</button>
    )
};