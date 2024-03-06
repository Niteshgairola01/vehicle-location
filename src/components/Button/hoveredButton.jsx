import React from 'react'

const Button = ({ children, className, type, onClick, disabled, style }) => {
    return (
        <button type={type} className={`hovered-button cursor-pointer ${className || ''}`} onClick={onClick} disabled={disabled}
            style={style}
        >{children}</button>
    )
}

export default Button
