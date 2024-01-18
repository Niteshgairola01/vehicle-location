import React from 'react'

const Button = ({ children, className, type, onClick }) => {
    return (
        <button type={type} className={`colored-button cursor-pointer ${className || ''}`} onClick={onClick}>{children}</button>
    )
}

export default Button
