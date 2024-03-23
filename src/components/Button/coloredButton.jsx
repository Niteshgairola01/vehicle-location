import React from 'react'

const Button = ({ children, className, type, onClick, style }) => {
    return (
        <button type={type} className={`colored-button cursor-pointer ${className || ''}`} onClick={onClick} style={style}>{children}</button>
    )
}

export default Button
