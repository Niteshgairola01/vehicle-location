import React, { useState } from 'react'
import PolygonList from './polygonList'
import DashHead from '../../components/dashboardHead'
import CreatePolygon from './createPolygon';

const PolygonMain = () => {

    const [currentPage, setCurrentPage] = useState('List');

    return (
        <div className='m-0 p-0 position-relative'>
            <div className='mt-5 my-3 px-5 pt-2 pb-5 bg-white rounded dashboard-main-container'>
                <div className='w-100'>
                    <DashHead title="Polygon" />
                    {
                        currentPage === 'List' ? (
                            <PolygonList setCurrentPage={setCurrentPage} />
                        ) : (
                            <CreatePolygon setCurrentPage={setCurrentPage} />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default PolygonMain
