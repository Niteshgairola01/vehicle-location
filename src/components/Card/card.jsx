import React from 'react'

const Card = ({ children, className }) => {
    return (
        <div className={`card-container p-3 mb-4 bg-white ${className}`}>{children}</div>
    )
}

export default Card
