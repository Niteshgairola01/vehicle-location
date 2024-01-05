import React from 'react'

const Button = ({ children, className, type }) => {
    return (
        <button type={type} className={`colored-button cursor-pointer ${className || ''}`}>{children}</button>
    )
}

export default Button
