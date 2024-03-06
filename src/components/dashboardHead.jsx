import React from 'react'

const DashHead = ({ title }) => {
    return (
        <div className='w-100 pb-3 text-center mt-3'
            style={{ borderBottom: "3px solid #09215f" }}
        >
            <h4 className='px-3 dashboard-title text-uppercase d-inline text-center my-5'
            >{title}</h4>
            {/* <hr /> */}
        </div>
    )
}

export default DashHead
