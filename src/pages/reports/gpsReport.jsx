import React, { useEffect, useState } from 'react'
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Col } from 'react-bootstrap';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { ErrorToast } from '../../components/toast/toast';
import { Link } from 'react-router-dom';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
import { Tooltip } from '@mui/material';
import { FaFileExcel } from 'react-icons/fa6';

const GPSReport = () => {

    const [allTrips, setAllTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);

    const attributes = ['S.No.', 'vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'staticETA', 'locationTime', 'routeKM', 'runningKMs',
        'kmDifference', 'last10HoursKms', 'location', 'estimatedArrivalDate', 'finalStatus'
    ];

    const columnNames = ['S.No.', 'Vehicle No.', 'Status', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Last 10Hrs KM', 'Location', 'Estimated Arrival Date', 'Final Status'
    ];

    const excelAtrributes = ['vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'consignorName', 'dealerName', 'origin', 'destination', 'staticETA', 'oemReachTime', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
        'kmDifference', 'last10HoursKms', 'location', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
    ]
    const today = new Date();

    let currentDay = new Date(today.setHours(0, 0, 0, 0));

    const twoDaysAfter = new Date(today);
    twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

    useEffect(() => {
        setLoadingTrips(true);
        getRunningTrips().then(response => {
            if (response.status === 200) {
                setLoadingTrips(false);
                const allData = response?.data;
                const gpsOffTrips = allData.filter(trip => trip?.currVehicleStatus === "GPS Off");
                const runningTrips = gpsOffTrips.filter(trip => trip?.tripStatus === 'Trip Running' && trip?.tripLogNo !== null && trip?.tripLogNo !== '' && trip?.tripLogNo !== " ");
                const withoutTrips = gpsOffTrips.filter(trip => (trip?.tripLogNo === null || trip?.tripLogNo === '' || trip?.tripLogNo === " ") && trip?.tripStatus === 'Trip Running');
                const remainingTrips = gpsOffTrips.filter(trip => trip?.tripStatus !== 'Trip Running');

                setAllTrips([...runningTrips, ...withoutTrips, ...remainingTrips]);
            } else {
                setAllTrips([]);
                setLoadingTrips(false);
            }
        }).catch(err => {
            console.log(err);
            setAllTrips([]);
            setLoadingTrips(false);
        })
    }, []);


    const handleFormateISTDate = (givenDate) => {
        if (givenDate === null || givenDate === "" || givenDate === undefined) {
            return givenDate;
        } else {
            const [datePart, timePart] = givenDate.split(' ');
            const [day, month, year] = datePart.split('/');
            const [hour, minute, second] = timePart.split(':');
            const newDate = givenDate.split(' ');
            const date = new Date(year, month - 1, day, hour % 12 + ((newDate[2] === 'PM') ? 12 : 0), minute, second);
            const dateTimeFormatted = date.toLocaleString('en-US', {
                year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
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
        if (hours === null || hours === '' || hours === undefined) return '';
        else {
            const hoursArr = hours.split('.');
            return hoursArr[0];
        }
    };

    const convertTo24HourFormat = (timeString) => {
        if (timeString === null || timeString === undefined || timeString === '') return " ";
        else {
            var timeComponents = timeString.split(" ");
            var date = timeComponents[0];
            var time = timeComponents[1];
            var period = timeComponents[2];

            var timeParts = time.split(":");
            var hours = parseInt(timeParts[0]);
            var minutes = parseInt(timeParts[1]);
            var seconds = parseInt(timeParts[2]);

            (period === "PM" && hours < 12) && (hours += 12);
            (period === "AM" && hours === 12) && (hours = 0);

            hours = String(hours).padStart(2, "0");
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");

            var time24Hour = hours + ":" + minutes + ":" + seconds;
            return date + " " + time24Hour;
        }
    };

    const getDelayedType = (attr, hours, eta) => {
        if (attr === 'On Time' || attr === "Early" || attr === "" || attr === " ") return attr;
        else if (attr === 'Delayed') {
            if (((eta !== null && eta !== "") && new Date(formatStaticETADate(eta)) < currentDay)) return 'Late';
            else {
                if (((eta !== null && eta !== "") && (new Date(formatStaticETADate(eta)) > currentDay) && (new Date(formatStaticETADate(eta)) < twoDaysAfter)))
                    return (parseInt(hours) >= 0 && parseInt(hours) <= 5) ? 'Nominal Delayed' : (parseInt(hours) >= 6) && 'Critical Delayed';
                else if (((eta !== null && eta !== "") && (new Date(formatStaticETADate(eta)) > twoDaysAfter)))
                    return (parseInt(hours) >= 0 && parseInt(hours) <= 18) ? 'Nominal Delayed' : (parseInt(hours) >= 19) && 'Critical Delayed';
            }
        }
    };

    const getGPSTime = (date) => {
        if (date === null) return '';
        else if (date !== null && date?.length === 0) return '';
        else {
            const originalDate = new Date(date);
            const day = originalDate.getDate() >= 10 ? originalDate.getDate() : `0${originalDate.getDate()}`;
            const month = originalDate.getMonth() + 1 >= 10 ? originalDate.getMonth() + 1 : `0${originalDate.getMonth() + 1}`;
            const year = originalDate.getFullYear() >= 10 ? originalDate.getFullYear() : `0${originalDate.getFullYear()}`;
            const hours = originalDate.getHours() >= 10 ? originalDate.getHours() : `0${originalDate.getHours()}`;
            const minutes = originalDate.getMinutes() >= 10 ? originalDate.getMinutes() : `0${originalDate.getMinutes()}`;
            const seconds = originalDate.getSeconds() >= 10 ? originalDate.getSeconds() : `0${originalDate.getSeconds()}`;

            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            return formattedDate;
        };
    };

    const formatStaticETADate = (givenDate) => {
        if (givenDate !== null && givenDate !== "" && givenDate !== " ") {
            const [datePart, timePart, AM] = givenDate.split(' ');
            const [day, month, year] = datePart.split('/');
            const time = timePart.split(':');

            const hour = parseInt(time) % 12 + (AM === 'PM' ? 12 : 0);
            const minutes = parseInt(time[1]);
            const seconds = parseInt(time[2]);

            const formattedDate = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            return formattedDate;
        }
    };

    const formatData = (rowData) => {
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                if (attr === 'currVehicleStatus' || attr === 'loadingDate' || attr === 'vehicleExitDate' || attr === 'delayedHours' || attr === 'staticETA' || attr === 'oemReachTime'
                    || attr === 'estimatedArrivalDate' || attr === 'finalStatus' || attr === 'oemDelayedHours' || attr === 'oemFinalStatus' || attr === 'locationTime' || attr === 'unloadingReachDate') {

                    if (attr === 'loadingDate' || attr === 'oemReachTime') formattedItem[attr] = handleFormateISTDate(item[attr]);
                    if (attr === 'vehicleExitDate') formattedItem[attr] = handleFormatDate(item[attr]);
                    if (attr === 'delayedHours') formattedItem[attr] = getDelayedHours(item[attr]);
                    if (attr === 'oemDelayedHours') formattedItem[attr] = getDelayedHours(item[attr]);
                    if (attr === 'staticETA' || attr === 'estimatedArrivalDate') formattedItem[attr] = convertTo24HourFormat(item[attr]);
                    if (attr === 'finalStatus') formattedItem[attr] = getDelayedType(item[attr], item['delayedHours'], item['staticETA']);
                    if (attr === 'oemFinalStatus') formattedItem[attr] = getDelayedType(item[attr], item['oemDelayedHours'], item['oemReachTime']);
                    if (attr === 'locationTime') formattedItem[attr] = getGPSTime(item[attr], item['locationTime']);
                    if (attr === 'reachPointEntryTime') formattedItem[attr] = getGPSTime(item[attr], item['reachPointEntryTime']);
                    if (attr === 'unloadingReachDate') formattedItem[attr] = item[attr] === "" || item[attr] === null ? '' : handleFormatDate(item[attr]);
                    if (attr === 'currVehicleStatus') formattedItem[attr] = '';

                } else formattedItem[attr] = item[attr];
            });
            return formattedItem;
        });
        return formattedData;
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

            if (formattedItem.hasOwnProperty('estimatedArrivalDate')) {
                formattedItem.estimatedArrivalDate = convertTo24HourFormat(formattedItem?.estimatedArrivalDate);
            }

            if (formattedItem.hasOwnProperty('oemFinalStatus')) {
                formattedItem.oemFinalStatus = getDelayedType(formattedItem?.oemFinalStatus, formattedItem?.oemDelayedHours, formattedItem?.oemReachTime);
            }

            if (formattedItem.hasOwnProperty('oemDelayedHours')) {
                formattedItem.oemDelayedHours = getDelayedHours(formattedItem?.oemDelayedHours);
            }

            if (formattedItem.hasOwnProperty('finalStatus')) {
                formattedItem.finalStatus = getDelayedType(formattedItem?.finalStatus, formattedItem?.delayedHours, formattedItem?.staticETA);
            }

            if (formattedItem.hasOwnProperty('delayedHours')) {
                formattedItem.delayedHours = getDelayedHours(formattedItem?.delayedHours);
            }

            return formattedItem;
        });
    };

    const exportToExcel = () => {
        let formattedData = [];

        formattedData = formatExcelData(formatDataKey(allTrips.filter(item => excelAtrributes.includes(Object.keys(item)[0]))));

        let headers = [];

        headers = [
            {
                vehicleNo: 'Vehicle No.',
                currVehicleStatus: 'Status',
                loadingDate: 'Loading (Date / Time)',
                vehicleExitDate: 'Vehicle Exit (Date / Time)',
                consignorName: 'Consignor Name',
                dealerName: 'Dealer Name',
                origin: 'Origin',
                destination: 'Destination',
                staticETA: 'Static ETA',
                oemReachTime: 'Static ETA(OEM)',
                locationTime: 'GPS (Date / Time)',
                unloadingReachDate: 'Reach Date',
                routeKM: 'Route (KM)',
                runningKMs: 'KM Covered',
                kmDifference: 'Difference (Km)',
                last10HoursKms: 'Last 10 hrs KM',
                location: 'Location',
                estimatedArrivalDate: 'Estimated Arrival Date',
                finalStatus: 'Final Status',
                delayedHours: 'Delayed Hours'
            }
        ];

        formattedData.unshift(headers[0]);

        const numberFormatter = (value) => {
            if (typeof value === 'string' && !isNaN(Number(value))) {
                return value === "" || value === null ? "" : Number(value); // Convert number-like strings to numbers
            }

            return value;
        };

        const worksheet = XLSX.utils.json_to_sheet(formattedData.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, numberFormatter(value)]))), { skipHeader: true });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'trips_report');

        formattedData.length <= 1 ? ErrorToast("No data found") : XLSX.writeFile(workbook, `trips_report.xlsx`);
    };

    const exportToPDF = async () => {
        const doc = new jsPDF('landscape');
        const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

        doc.setFontSize(16);
        doc.text('GPS Off Trips Report', 130, 10);

        const formattedData = formatData(allTrips);

        formattedData.forEach((row, index) => row['S.No.'] = index + 1);

        const columns = attributes.map((attr, index) => ({ header: columnNames[index], dataKey: attr, styles: { fontWeight: 'bold' } }));

        doc.autoTable({
            columns,
            body: formattedData,
            margin: firstPageMargin,
            styles: { fontSize: 8, height: 100 },
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

                    const test = allTrips.filter(filters => filters?.vehicleNo === data.row.raw.vehicleNo);

                    let color = 'black';

                    (test[0].currVehicleStatus === 'On Hold') ? (color = '#fffc00')
                        : (test[0].currVehicleStatus === 'GPS Off') ? (color = '#ff0000')
                            : (test[0].currVehicleStatus === 'Running') && (color = '#00ff00');

                    doc.setFillColor(color);
                    doc.circle(cellX, cellY, radius, 'F', color);
                }
            },
            rowPageBreak: 'avoid'
        });

        (allTrips.length === 0) ? ErrorToast('No data found') : doc.save('Trips-report.pdf');
    };

    return (
        <>
            <Col sm={8} className='ps-5'>
                <h6 className='mb-3'>GPS Off Report</h6>
                {
                    loadingTrips ? (
                        <p className='fw-bold text-secondary'>Please Wait while fetching the data
                            <span className='ms-2 dot-one'>.</span>
                            <span className='ms-2 dot-two'>.</span>
                            <span className='ms-2 dot-three'>.</span>
                            <span className='ms-2 dot-four'>.</span>
                            <span className='ms-2 dot-five'>.</span>
                            <span className='ms-2 dot-six'>.</span>
                        </p>
                    ) : (
                        <div className='p-0 d-flex justify-content-start align-items-center w-100'>
                            <Tooltip title="Export As Excel" key="excelExport">
                                <Link>
                                    <FaFileExcel className='ms-2 cursor-pointer fs-3 text-success' onClick={() => exportToExcel()} />
                                </Link>
                            </Tooltip>
                            <Tooltip title="Export As PDF" key="pdfExport">
                                <Link>
                                    <BsFileEarmarkPdfFill className='ms-2 cursor-pointer fs-3' style={{ color: "#ed031b" }} onClick={exportToPDF} />
                                </Link>
                            </Tooltip>
                            {/* <Button className="px-5" onClick={() => exportToPDF()}>Download GPS Off Report</Button> */}
                        </div>
                    )
                }
            </Col>
        </>
    )
}

export default GPSReport
