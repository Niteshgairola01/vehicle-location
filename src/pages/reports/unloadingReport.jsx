import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import Select from 'react-select';
import { Col, Form } from 'react-bootstrap'
import { getUnloadingReport } from '../../hooks/reportHooks';
import Button from '../../components/Button/coloredButton';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { getAllPartiesList } from '../../hooks/clientMasterHooks';
import { RxCross2 } from 'react-icons/rx';
import { ErrorToast } from '../../components/toast/toast';
import { FaFileExcel } from 'react-icons/fa6';

const UnloadingReport = ({ reportType }) => {
    const [unloadingTrips, setUnloadingTrips] = useState([]);
    const [reportUnloadingTrips, setReportUnloadingTrips] = useState([]);

    const [OEMList, setOEMList] = useState([]);
    const [selectedOEM, setSelectedOEM] = useState('');
    const [selectedOEMs, setSelectedOEMs] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedOrigins, setSelectedOrigins] = useState([]);

    const [attributes, setAttributes] = useState([]);
    const [columnNames, setColumnNames] = useState([]);
    const [excelAtrributes, setExcelAttributes] = useState([]);

    const finalTrips = reportType === "Unloading Date Report" ? unloadingTrips : reportUnloadingTrips;

    const tripsFilteredByOEM = finalTrips.length > 0 ? ((selectedOEMs.length === 0 || selectedOEMs.includes(undefined)) ? finalTrips : finalTrips.filter(data => {
        const consignorLowerCase = data?.consignorName.toLowerCase();
        return selectedOEMs.some(consignor => consignor.toLowerCase() === consignorLowerCase) && data;
    })) : [];

    const filteredOEMTrips = tripsFilteredByOEM.length > 0 ? ((selectedOrigins.length === 0 || selectedOrigins.includes(undefined)) ? tripsFilteredByOEM : tripsFilteredByOEM.filter(item => {
        const originLowerCase = item.origin.toLowerCase();
        return selectedOrigins.some(consignor => consignor.toLowerCase() === originLowerCase) && item;
    })) : [];

    useEffect(() => {
        getUnloadingReport().then(response => {
            if (response.status === 200) {
                const allData = response?.data;

                const isTodayOrYesterday = (dateString) => {
                    const date = new Date(dateString);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    return (
                        date.toDateString() === today.toDateString() ||
                        date.toDateString() === yesterday.toDateString()
                    );
                };

                const unloadingTrips = allData.filter(data => isTodayOrYesterday(data?.unloadingDate) && data?.tripLogNo !== null && data?.tripLogNo !== "" && data?.tripStatus === 'Trip Completed');
                const reportUnloadingTrips = allData.filter(data => isTodayOrYesterday(data?.unloadingReachDate) && data?.tripLogNo !== null && data?.tripLogNo !== "" && data?.tripStatus === 'Trip Running');

                setUnloadingTrips(unloadingTrips);
                setReportUnloadingTrips(reportUnloadingTrips);
            } else {
                setUnloadingTrips([]);
                setReportUnloadingTrips([]);
            };
        }).catch(err => {
            console.log(err);
            setUnloadingTrips([]);
            setReportUnloadingTrips([]);
        });
    }, []);

    useEffect(() => {
        getRunningTrips().then(response => {
            if (response?.status === 200) {
                const allData = response?.data;
                const uniqueOriginsSet = new Set();

                allData.forEach(item => {
                    item?.origin !== null && item?.origin !== "" && uniqueOriginsSet.add(item.origin.toLowerCase());
                });

                const uniqueOriginsArray = Array.from(uniqueOriginsSet);

                const desiredOriginArray = uniqueOriginsArray.map(origin => {
                    return {
                        origin: origin.charAt(0).toUpperCase() + origin.slice(1),
                        label: origin.charAt(0).toUpperCase() + origin.slice(1),
                        value: origin.charAt(0).toUpperCase() + origin.slice(1),
                    };
                });

                setOriginList(desiredOriginArray);
            } else {
                setOriginList([]);
            }
        }).catch((err) => {
            console.log(err);
            setOriginList([]);
        })
    }, [reportType]);

    useEffect(() => {
        getAllPartiesList().then((response) => {
            if (response.status === 200) {
                if (response?.data.length > 0) {
                    const filteredData = response?.data.map(data => ({
                        ...data,
                        label: data?.clientName,
                        value: data?.clientName
                    }));

                    setOEMList(filteredData);
                } else {
                    setOEMList([]);
                }
            } else {
                setOEMList([]);
            }
        }).catch(() => setOEMList([]));
    }, [reportType]);

    useEffect(() => {
        if (reportType === "Unloading Date Report") {
            setAttributes(['S.No.', 'vehicleNo', 'loadingDate', 'vehicleExitDate', 'consignorName', 'origin', 'destination', 'staticETA', 'unloadingDate', 'routeKM', 'runningKMs',
                'kmDifference', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);

            setColumnNames(['S.No.', 'Vehicle No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Consignor Name', 'Origin', 'Destination', 'Static ETA',
                'Unaloding End Date', 'Route (KM)', 'KM Covered', 'Difference (Km)', 'Estimated Arrival Date', 'Final Status', 'Delayed Hours'
            ]);
        } else {
            setAttributes(['S.No.', 'vehicleNo', 'loadingDate', 'vehicleExitDate', 'consignorName', 'origin', 'destination', 'staticETA', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);

            setColumnNames(['S.No.', 'Vehicle No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Consignor Name', 'Origin', 'Destination', 'Static ETA',
                'Report Unloading', 'Route (KM)', 'KM Covered', 'Difference (Km)', 'Estimated Arrival Date', 'Final Status', 'Delayed Hours'
            ]);
        }
    }, [reportType]);

    useEffect(() => {
        if (reportType === "Unloading Date Report") {
            setExcelAttributes(['vehicleNo', 'loadingDate', 'vehicleExitDate', 'consignorName', 'origin', 'destination', 'staticETA', 'oemReachTime', 'unloadingDate', 'routeKM', 'runningKMs',
                'kmDifference', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);
        } else {
            setExcelAttributes(['vehicleNo', 'loadingDate', 'vehicleExitDate', 'consignorName', 'origin', 'destination', 'staticETA', 'oemReachTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);
        }
    }, [reportType]);


    const handleSelectOEM = (oem) => {
        setSelectedOEM(oem);

        if (oem?.value !== undefined && !selectedOEMs.includes(oem?.value)) {
            oem?.value !== undefined && setSelectedOEMs([...selectedOEMs, oem?.value])
        } else if (selectedOEMs.includes(oem?.value)) {
            // ErrorToast("OEM is selected already");
            const filtered = selectedOEMs.filter(data => data !== oem?.value);
            setSelectedOEMs(filtered);
            setSelectedOEM('');
        }
    };

    const handleDeselectOEM = (oem) => {
        const filtered = selectedOEMs.filter(data => data !== oem);
        setSelectedOEMs(filtered);
        setSelectedOEM('');
    };

    const handleSelectOrigin = (origin) => {
        setSelectedOrigin(origin);

        if (origin?.value !== undefined && !selectedOrigins.includes(origin?.value)) {
            origin?.value !== undefined && setSelectedOrigins([...selectedOrigins, origin?.value])
        } else if (selectedOrigins.includes(origin?.value)) {
            // ErrorToast("Origin is selected already");
            const filtered = selectedOrigins.filter(data => data !== origin?.value);
            setSelectedOrigins(filtered);
            setSelectedOrigin('');
        }
    };

    const handleDeselectOrigin = (origin) => {
        const filtered = selectedOrigins.filter(data => data !== origin);
        setSelectedOrigins(filtered);
        setSelectedOrigin('');
    };


    const handleFormateISTDate = (givenDate) => {
        if (givenDate === null || givenDate.length === 0) {
            return givenDate;
        } else {
            const [datePart, timePart] = givenDate.split(' ');
            const [day, month, year] = datePart.split('/');
            const [hour, minute, second] = timePart.split(':');
            const newDate = givenDate.split(' ');
            const date = new Date(year, month - 1, day, hour % 12 + ((newDate[2] === 'PM') ? 12 : 0), minute, second);
            const dateTimeFormatted = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });

            const dateArr = dateTimeFormatted.split(', ');
            const formattedDate = dateArr.join(' ');

            const originalDate = new Date(formattedDate);

            const finalDay = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const finalMonth = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const finalYear = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;
            const finalFormattedDate = `${finalDay}/${finalMonth}/${finalYear} ${hours}:${minutes}:${seconds}`;

            return finalFormattedDate;
        }
    };

    const handleFormatDate = (date) => {
        if (date === null) {
            return '';
        } else if (date !== null && date?.length === 0) {
            return '';
        } else {
            const originalDate = new Date(date);

            const day = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const month = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const year = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;

            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            return formattedDate;
        }
    };

    const getDelayedHours = (hours) => {
        if (hours !== null && hours.length > 0) {
            const hoursArr = hours.split('.');
            return hoursArr[0];
        } else {
            return ''
        }
    };

    const convertTo24HourFormat = (timeString) => {
        if (timeString === null || timeString === '') {
            return " "
        } else {
            var timeComponents = timeString.split(" ");
            var date = timeComponents[0];
            var time = timeComponents[1];
            var period = timeComponents[2];

            var timeParts = time.split(":");
            var hours = parseInt(timeParts[0]);
            var minutes = parseInt(timeParts[1]);
            var seconds = parseInt(timeParts[2]);

            if (period === "PM" && hours < 12) {
                hours += 12;
            }

            if (period === "AM" && hours === 12) {
                hours = 0;
            }

            hours = String(hours).padStart(2, "0");
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");

            var time24Hour = hours + ":" + minutes + ":" + seconds;

            return date + " " + time24Hour;
        }
    };

    const getDelayedType = (attr, hours) => {
        if (attr === 'On Time' || attr === "Early" || attr === "" || attr === " ") {
            return attr;
        } else if (attr === 'Delayed') {
            if (parseInt(hours) <= 18) {
                return 'Mild Delayed';
            } else if (parseInt(hours) >= 19 && parseInt(hours) <= 35) {
                return 'Moderate Delayed';
            } else if (parseInt(hours) >= 36) {
                return 'Critical Delayed';
            }
        }
    };

    const getGPSTime = (date) => {
        if (date === null) {
            return '';
        } else if (date !== null && date?.length === 0) {
            return '';
        } else {
            const originalDate = new Date(date);
            const day = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const month = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const year = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;

            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            return formattedDate;
        }
    };

    const formatData = (rowData) => {
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                if (attr === 'currVehicleStatus' || attr === 'loadingDate' || attr === 'vehicleExitDate' || attr === 'delayedHours' || attr === 'staticETA' || attr === 'oemReachTime'
                    || attr === 'estimatedArrivalDate' || attr === 'finalStatus' || attr === 'oemDelayedHours' || attr === 'oemFinalStatus' || attr === 'locationTime' || attr === 'unloadingReachDate' || attr === 'unloadingDate') {
                    if (attr === 'loadingDate' || attr === 'oemReachTime') {
                        formattedItem[attr] = handleFormateISTDate(item[attr]);
                    }
                    if (attr === 'vehicleExitDate') {
                        formattedItem[attr] = handleFormatDate(item[attr]);
                    }
                    if (attr === 'delayedHours') {
                        formattedItem[attr] = getDelayedHours(item[attr]);
                    }

                    if (attr === 'oemDelayedHours') {
                        formattedItem[attr] = getDelayedHours(item[attr]);
                    }

                    if (attr === 'staticETA' || attr === 'estimatedArrivalDate') {
                        formattedItem[attr] = convertTo24HourFormat(item[attr]);
                    }

                    if (attr === 'finalStatus') {
                        formattedItem[attr] = getDelayedType(item[attr], item['delayedHours']);
                    }

                    if (attr === 'oemFinalStatus') {
                        formattedItem[attr] = getDelayedType(item[attr], item['oemDelayedHours']);
                    }

                    if (attr === 'locationTime') {
                        formattedItem[attr] = getGPSTime(item[attr], item['locationTime']);
                    }

                    if (attr === 'reachPointEntryTime') {
                        formattedItem[attr] = getGPSTime(item[attr], item['reachPointEntryTime']);
                    }

                    if (attr === 'unloadingReachDate' || attr === 'unloadingDate') {
                        formattedItem[attr] = item[attr] === "" || item[attr] === null ? '' : handleFormatDate(item[attr]);
                    }

                    if (attr === 'currVehicleStatus') {
                        formattedItem[attr] = '';
                    }
                } else {
                    formattedItem[attr] = item[attr];
                }
            });
            return formattedItem;
        });
        return formattedData;
    };

    const exportToPDF = async () => {
        const doc = new jsPDF('landscape');
        const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

        doc.setFontSize(16);
        doc.text(`${reportType === "Unloading Date Report" ? 'Unloading Date Report' : 'Report Unloading Report'}`, 130, 10);

        const formattedData = formatData(filteredOEMTrips);

        formattedData.forEach((row, index) => {
            row['S.No.'] = index + 1
        });

        const columns = attributes.map((attr, index) => ({ header: columnNames[index], dataKey: attr, styles: { fontWeight: 'bold' } }));

        doc.autoTable({
            columns,
            body: formattedData,
            margin: firstPageMargin,
            styles: {
                fontSize: 8,
                height: 100
            },
            columnStyles: {
                5: { cellWidth: 19 },
                13: { cellWidth: 30 },
            },
            didDrawCell: (data) => {

                if (data.column.dataKey === 'currVehicleStatus' && data.row.raw['S.No.'] !== 'S.No.') {

                    const cellWidth = data.cell.width;
                    const cellHeight = data.cell.height;
                    const cellX = data.cell.x + (cellWidth / 2);
                    const cellY = data.cell.y + (cellHeight / 3);
                    const radius = 1.5;

                    const test = unloadingTrips.filter(filters => filters?.vehicleNo === data.row.raw.vehicleNo);

                    let color = 'black';
                    if (test[0].currVehicleStatus === 'On Hold') {
                        color = '#fffc00'
                    } else if (test[0].currVehicleStatus === 'GPS Off') {
                        color = '#ff0000'
                    } else if (test[0].currVehicleStatus === 'Running') {
                        color = '#00ff00'
                    }

                    doc.setFillColor(color);
                    doc.circle(cellX, cellY, radius, 'F', color);
                }
            },
            rowPageBreak: 'avoid'
        });

        filteredOEMTrips.length === 0 ? ErrorToast("No data found") : doc.save(`${reportType === "Unloading Date Report" ? 'unloading-date-report.pdf' : 'report-unloading-report.pdf'}`);
    };

    const formatDataKey = (data) => {
        return data.map((item) => {
            const filteredItem = {};
            const desiredKeys = excelAtrributes.map(key => key);

            for (const key of desiredKeys) {
                if (item.hasOwnProperty(key)) {
                    filteredItem[key] = item[key];
                }
            }

            return filteredItem;
        });
    };

    const formatExcelData = (data) => {
        return data.map((item) => {
            const formattedItem = { ...item };

            if (formattedItem.hasOwnProperty('loadingDate')) {
                formattedItem.loadingDate = handleFormateISTDate(formattedItem.loadingDate);
            }

            if (formattedItem.hasOwnProperty('vehicleExitDate')) {
                formattedItem.vehicleExitDate = handleFormatDate(formattedItem.vehicleExitDate);
            }

            if (formattedItem.hasOwnProperty('staticETA')) {
                formattedItem.staticETA = convertTo24HourFormat(formattedItem?.staticETA);
            }

            if (formattedItem.hasOwnProperty('oemReachTime')) {
                formattedItem.oemReachTime = handleFormateISTDate(formattedItem?.oemReachTime);
            }

            if (formattedItem.hasOwnProperty('locationTime')) {
                formattedItem.locationTime = getGPSTime(formattedItem?.locationTime);
            }

            if (formattedItem.hasOwnProperty('unloadingReachDate')) {
                formattedItem.unloadingReachDate = formattedItem?.unloadingReachDate === "" || formattedItem?.unloadingReachDate === null ? '' : handleFormatDate(formattedItem?.unloadingReachDate);
            }

            if (formattedItem.hasOwnProperty('unloadingDate')) {
                formattedItem.unloadingDate = formattedItem?.unloadingDate === "" || formattedItem?.unloadingDate === null ? '' : handleFormatDate(formattedItem?.unloadingDate);
            }

            if (formattedItem.hasOwnProperty('estimatedArrivalDate')) {
                formattedItem.estimatedArrivalDate = convertTo24HourFormat(formattedItem?.estimatedArrivalDate);
            }

            if (formattedItem.hasOwnProperty('oemFinalStatus')) {
                formattedItem.oemFinalStatus = getDelayedType(formattedItem?.oemFinalStatus, formattedItem?.oemDelayedHours);
            }

            if (formattedItem.hasOwnProperty('oemDelayedHours')) {
                formattedItem.oemDelayedHours = getDelayedHours(formattedItem?.oemDelayedHours);
            }

            if (formattedItem.hasOwnProperty('finalStatus')) {
                formattedItem.finalStatus = getDelayedType(formattedItem?.finalStatus, formattedItem?.delayedHours);
            }

            if (formattedItem.hasOwnProperty('delayedHours')) {
                formattedItem.delayedHours = getDelayedHours(formattedItem?.delayedHours);
            }

            return formattedItem;
        });
    };

    const exportToExcel = () => {
        let formattedData = [];
        formattedData = formatExcelData(formatDataKey(filteredOEMTrips.filter(item => excelAtrributes.includes(Object.keys(item)[0]))));
        let headers = [];

        if (reportType === "Unloading Date Report") {
            headers = [
                {
                    vehicleNo: 'Vehicle No.',
                    loadingDate: 'Loading (Date / Time)',
                    vehicleExitDate: 'Vehicle Exit (Date / Time)',
                    consignorName: 'Consignor Name',
                    origin: 'Origin',
                    destination: 'Destination',
                    staticETA: 'Static ETA',
                    oemReachTime: 'Static ETA(OEM)',
                    unloadingDate: 'Unloading End Date',
                    routeKM: 'Route (KM)',
                    runningKMs: 'KM Covered',
                    kmDifference: 'Difference (Km)',
                    estimatedArrivalDate: 'Estimated Arrival Date',
                    finalStatus: 'Final Status',
                    delayedHours: 'Delayed Hours'
                }
            ];
        } else {
            headers = [
                {
                    vehicleNo: 'Vehicle No.',
                    loadingDate: 'Loading (Date / Time)',
                    vehicleExitDate: 'Vehicle Exit (Date / Time)',
                    consignorName: 'Consignor Name',
                    origin: 'Origin',
                    destination: 'Destination',
                    staticETA: 'Static ETA',
                    oemReachTime: 'Static ETA(OEM)',
                    unloadingReachDate: 'Reach Date',
                    routeKM: 'Route (KM)',
                    runningKMs: 'KM Covered',
                    kmDifference: 'Difference (Km)',
                    estimatedArrivalDate: 'Estimated Arrival Date',
                    finalStatus: 'Final Status',
                    delayedHours: 'Delayed Hours'
                }
            ];
        }

        formattedData.unshift(headers[0]);

        const numberFormatter = (value) => {

            if (typeof value === 'string' && !isNaN(Number(value))) {
                return value === "" || value === null ? "" : Number(value);
            }

            return value;
        };

        const worksheet = XLSX.utils.json_to_sheet(formattedData.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, numberFormatter(value)]))),
            { skipHeader: true });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType === "Unloading Date Report" ? 'unloading_date_report' : 'report_unloading_report'}`);
        XLSX.writeFile(workbook, `${reportType === "Unloading Date Report" ? 'unloading_date_report.xlsx' : 'report_unloading_report.xlsx'}`);
    }


    const selectStyles = {
        control: (provided) => ({
            ...provided,
            fontSize: '0.9rem',
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '0.9rem',
            background: state.isSelected ? '#09215f' : 'white',
            cursor: 'pointer'
        }),
    };

    return (
        <>
            <Col sm={9} className='ps-5'>
                <h6>{reportType === "Unloading Date Report" ? 'Unloading Date Report' : 'Report Unloading Report'}</h6>
                <div className='d-flex justify-content-between align-items-start'>
                    <div className='d-flex justify-content-start align-items-start w-75'>
                        <div className='w-50'>
                            <Form.Label>Select OEM</Form.Label>
                            <Select
                                options={OEMList}
                                value={selectedOEM}
                                onChange={handleSelectOEM}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Search OEM"
                                isOptionSelected={(option) => selectedOEMs.includes(option.value)}
                                closeMenuOnSelect={false}
                            />

                            <div className='mt-2'>
                                <p className='mb-1 mt-3 fw-500'>Selected OEMs:-</p>

                                {
                                    selectedOEMs.map(data => (
                                        <div className='py-1 mb-1 px-3 cursor-pointer d-flex justify-content-between align-items-center selected-oem'>
                                            <p className='w-100 m-0 p-0' style={{ fontSize: "0.8rem" }}>{data}</p>
                                            <RxCross2 onClick={() => handleDeselectOEM(data)} />
                                        </div>

                                    ))
                                }

                                {
                                    selectedOEMs.length === 0 && <div className='text-secondary w-100 text-center'>No OEM Selected</div>
                                }
                            </div>
                        </div>

                        <div className='ms-4 w-30'>
                            <Form.Label>Select Origin</Form.Label>
                            <Select
                                options={originList}
                                value={selectedOrigin}
                                onChange={handleSelectOrigin}
                                isClearable={true}
                                styles={selectStyles}
                                placeholder="Search Origin"
                                isOptionSelected={(option) => selectedOrigins.includes(option.value)}
                                closeMenuOnSelect={false}
                            />

                            <div className='mt-2'>
                                <p className='mb-1 mt-3 fw-500'>Selected Origins:-</p>

                                {
                                    selectedOrigins.map(data => (
                                        <div className='py-1 mb-1 px-3 cursor-pointer d-flex justify-content-between align-items-center selected-oem'>
                                            <p className='w-100 m-0 p-0' style={{ fontSize: "0.8rem" }}>{data}</p>
                                            <RxCross2 onClick={() => handleDeselectOrigin(data)} />
                                        </div>

                                    ))
                                }

                                {
                                    selectedOEMs.length === 0 && <div className='text-secondary w-100 text-center'>No Origin Selected</div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className=''>
                        <Tooltip title="w-5 Export As PDF">
                            <Link>
                                <FaFileExcel className='ms-2 cursor-pointer fs-3 text-success' onClick={() => exportToExcel()} />
                                <BsFileEarmarkPdfFill className='ms-2 cursor-pointer fs-3' style={{ color: "#ed031b" }} onClick={exportToPDF} />
                            </Link>
                        </Tooltip>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default UnloadingReport;
