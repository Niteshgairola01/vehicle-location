import React from 'react'

const DashHead = ({ title }) => {
    return (
        <div className='w-100 text-center my-5'>
            <h4 className='px-3 dashboard-title text-uppercase d-inline text-center my-5'
                style={{ borderBottom: "3px solid #09215f" }}
            >{title}</h4>
        </div>
    )
}

export default DashHead
