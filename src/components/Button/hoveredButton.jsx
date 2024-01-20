import React from 'react'

const Button = ({ children, className, type, onClick, disabled }) => {
    return (
        <button type={type} className={`hovered-button cursor-pointer ${className || ''}`} onClick={onClick} disabled={disabled}>{children}</button>
    )
}

export default Button
