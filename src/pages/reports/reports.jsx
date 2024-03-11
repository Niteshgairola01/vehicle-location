import React, { useEffect, useState } from 'react';
import Card from '../../components/Card/card';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import TripsReport from './trips-report';
import HoursReport from './hoursReport';
import { useNavigate } from 'react-router-dom';
import UnloadingReport from './unloadingReport';

const Reports = () => {

    const [selectedReportType, setSelectedReportType] = useState('');
    const [reportType, setReportType] = useState('');

    const loggedInUser = localStorage.getItem('userId');
    const navigate = useNavigate();

    const reportTypes = [
        {
            label: "Trips Report",
            value: "Trips Report"
        },
        {
            label: "10 Hrs Report",
            value: "10 Hrs Report"
        },
        {
            label: "Unloading Date Report",
            value: "Unloading Date Report"
        },
        {
            label: "Report Unloading Report",
            value: "Report Unloading Report"
        },
    ];

    const selectStyles = {
        control: (provided) => ({
            ...provided,
            fontSize: '0.9rem',
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '0.9rem',
        }),
    };

    const handleChangeReportType = (report) => {
        const searchValue = report?.value;
        const filteredTypes = reportTypes.filter(data =>
            ((data?.value && data?.value.toLowerCase().includes(searchValue?.toLowerCase())))
        );

        setSelectedReportType(filteredTypes);
        setReportType(searchValue);
    };

    useEffect(() => {
        if (!loggedInUser) {
            localStorage.clear();
            navigate('/');
        }
    }, [loggedInUser, navigate]);

    return (
        <div className='thm-dark m-0 p-0 p-5 pt-3'>
            {/* <button onClick={sharePDFViaTelegram}>Share</button> */}
            <Card>
                <div className='w-100 d-flex justify-content-between align-items-center'>
                    <h5 className='m-0 p-0'>Reports</h5>
                </div>
            </Card>

            <Card>
                <Row>
                    <Col className='pe-5' sm={3} style={{ borderRight: "1px solid gray" }}>
                        <h6 className='m-0 p-0 mb-3'>Report Type</h6>

                        <Select
                            options={reportTypes}
                            value={selectedReportType}
                            onChange={handleChangeReportType}
                            isClearable={true}
                            styles={selectStyles}
                            placeholder="Search Type"
                        />
                    </Col>
                    {
                        selectedReportType[0]?.value === 'Trips Report' ? (
                            <TripsReport reportType={reportType} setReportType={setReportType} selectedReportType={selectedReportType} setSelectedReportType={setSelectedReportType} />
                        ) : selectedReportType[0]?.value === '10 Hrs Report' ? (<HoursReport />) : (selectedReportType[0]?.value === 'Unloading Date Report' || selectedReportType[0]?.value === 'Report Unloading Report') && <UnloadingReport reportType={reportType} />
                    }
                </Row>
            </Card>
        </div>
    )
}

export default Reports
