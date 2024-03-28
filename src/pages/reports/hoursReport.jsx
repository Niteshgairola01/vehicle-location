import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Col } from 'react-bootstrap';
import Button from '../../components/Button/coloredButton';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { ErrorToast } from '../../components/toast/toast';
import { getHoursReports } from '../../hooks/reportHooks';
import TextLoader from '../../components/loader/TextLoader';

const HoursReport = () => {

    const [runningTrips, setRunningTrips] = useState([]);
    const [lastRecord, setLastRecord] = useState([]);
    const [runningVehicles, setRunningVehicles] = useState([]);
    const [tripsReport, setTripsReport] = useState([]);

    const [kms30, setKms30] = useState(0);
    const [drivenLessThan30KMs, setDrivenLessThan30KMs] = useState([]);
    const [vehiclesOnHold, setVehiclesOnHold] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);
    const [holdVehicle, setHoldVehicle] = useState(false);

    const today = new Date();

    let currentDay = new Date(today.setHours(0, 0, 0, 0));

    const twoDaysAfter = new Date(today);
    twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

    const attributes = ['S.No.', 'vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'staticETA', 'locationTime', 'routeKM', 'runningKMs',
        'kmDifference', 'last10HoursKms', 'location', 'estimatedArrivalDate', 'finalStatus'
    ];

    const columnNames = ['S.No.', 'Vehicle No.', 'Status', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Last 10Hrs KM', 'Location', 'Estimated Arrival Date', 'Final Status'
    ];

    useEffect(() => {
        getRunningTrips().then(response => {
            if (response.status === 200) {
                const allData = response?.data;

                let filteredTrips = allData.filter(data => data?.tripStatus === 'Trip Running' && data?.tripLogNo !== '' && data?.reachPointName === '' && data?.unloadingReachDate === "")
                setRunningTrips(filteredTrips);

                let runningVehicles = [];
                filteredTrips.forEach(data => {
                    runningVehicles.push(data?.vehicleNo);
                });

                setRunningVehicles(runningVehicles);
            } else {
                setRunningVehicles([]);
                setFetchingData(false);
            }
        }).catch(err => {
            console.log(err);
            setRunningVehicles([]);
            setFetchingData(false);
        })
    }, []);

    useEffect(() => {
        if (runningVehicles.length > 0) {
            getHoursReports(runningVehicles).then(response => {
                if (response?.status === 200) {
                    setFetchingData(false);
                    setLastRecord(response?.data);

                    const final = [];
                    const distanceMap = {};
                    const vehiclesOnHold = [];
                    const vehiclesDrivenLessThan30KMs = [];

                    response?.data.forEach((item) => {
                        const { vehicleNo, latLongDistance } = item;
                        if (!distanceMap[vehicleNo]) distanceMap[vehicleNo] = parseFloat(latLongDistance);
                        else distanceMap[vehicleNo] += parseFloat(latLongDistance);
                    });

                    for (const vehicleNo in distanceMap) {
                        final.push({
                            finalDistance: distanceMap[vehicleNo].toFixed(3),
                            vehicleNo: vehicleNo,
                        });
                    };

                    final.forEach(data => {
                        (parseFloat(data?.finalDistance) < 20) && vehiclesOnHold.push(data?.vehicleNo);
                        (parseFloat(data?.finalDistance) < 30) && vehiclesDrivenLessThan30KMs.push(data?.vehicleNo);
                    });

                    setTripsReport(vehiclesOnHold);
                    setKms30(vehiclesDrivenLessThan30KMs);
                } else {
                    setFetchingData(false);
                    setTripsReport([]);
                    setKms30([]);
                }
            }).catch(err => {
                setFetchingData(false);
                setTripsReport([]);
                setKms30([]);
                console.log(err);
            });
        };
    }, [runningVehicles]);

    useEffect(() => {
        if (runningVehicles.length > 0) {
            let filteredTripsOnHold = [];
            let filtered30Kms = [];

            runningTrips.map(data => {
                tripsReport.includes(data?.vehicleNo) && filteredTripsOnHold.push(data);
            });

            runningTrips.map(data => {
                kms30.includes(data?.vehicleNo) && filtered30Kms.push(data);
            });

            const final = filtered30Kms.filter(data => data?.finalStatus === 'On Time' || data?.finalStatus === 'Early')

            setVehiclesOnHold(filteredTripsOnHold);
            setDrivenLessThan30KMs(final);
        };
    }, [fetchingData]);

    useEffect(() => {
        if (runningTrips.length > 0) {

            const vehicleData = {};
            const locationIndexes = {};

            lastRecord.forEach((record, index) => {
                const { vehicleNo, date, location, latLongDistance } = record;

                if (!vehicleData[vehicleNo]) {
                    vehicleData[vehicleNo] = { location, dates: [date], distance: [latLongDistance] };
                    locationIndexes[vehicleNo] = index;
                } else {
                    vehicleData[vehicleNo].distance.push(latLongDistance);
                    vehicleData[vehicleNo].dates.push(date);
                    vehicleData[vehicleNo].location = location;

                    locationIndexes[vehicleNo] = index;
                }
            });

            const finalResult = Object.entries(vehicleData).map(([vehicleNo, { location, dates, distance }]) => {

                const test = lastRecord.reverse();

                const firstLocationChangeDates = {};
                for (let i = test.length - 1; i >= 0; i--) {
                    const currentRecord = test[i];
                    const { vehicleNo, date, location } = currentRecord;

                    if (!firstLocationChangeDates[vehicleNo]) {
                        firstLocationChangeDates[vehicleNo] = date;
                    } else {
                        if (location !== test[i + 1]?.location) {
                            firstLocationChangeDates[vehicleNo] = date;
                        }
                    }
                }

                const distanceCovered = distance.reduce((prev, curr) => (parseFloat(prev) + parseFloat(curr)));
                const KmCovered = parseInt(distanceCovered);

                return { vehicleNo, location, KmCovered };
            });

            const finalArr = vehiclesOnHold.map(vehicleObj => {
                const found = finalResult.find(testObj => testObj.vehicleNo === vehicleObj.vehicleNo);
                const coveredDistance = parseFloat(found?.KmCovered) > 0 ? parseFloat(found?.KmCovered) : 0

                return {
                    ...vehicleObj,
                    KmCovered: found ? coveredDistance : ''
                };
            });

            if ((finalArr.length > 0) && (!holdVehicle)) {
                setVehiclesOnHold(finalArr);
            };

            setTimeout(() => {
                setHoldVehicle(true);
            }, 500);
        };
    }, [vehiclesOnHold, fetchingData]);

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

    const getDelayedType = (attr, hours, eta) => {
        if (attr === 'On Time' || attr === "Early" || attr === "" || attr === " ") return attr;
        else if (attr === 'Delayed') {
            if (((eta !== null && eta !== "") && new Date(formatStaticETADate(eta)) < currentDay)) return 'Late';
            else {
                if (((eta !== null && eta !== "") && (new Date(formatStaticETADate(eta)) > currentDay) && (new Date(formatStaticETADate(eta)) < twoDaysAfter))) {
                    if (parseInt(hours) >= 0 && parseInt(hours) <= 5) return 'Nominal Delayed';
                    else if (parseInt(hours) >= 6) return 'Critical Delayed';

                } else if (((eta !== null && eta !== "") && (new Date(formatStaticETADate(eta)) > twoDaysAfter))) {
                    if (parseInt(hours) >= 0 && parseInt(hours) <= 18) return 'Nominal Delayed';
                    else if (parseInt(hours) >= 19) return 'Critical Delayed';
                }
            }
        }
    };

    const formatData = (rowData) => {
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                if (attr === 'loadingDate' || attr === 'vehicleExitDate' || attr === 'delayedHours' || attr === 'staticETA' || attr === 'oemReachTime'
                    || attr === 'estimatedArrivalDate' || attr === 'finalStatus' || attr === 'currVehicleStatus') {
                    if (attr === 'loadingDate' || attr === 'oemReachTime') formattedItem[attr] = handleFormateISTDate(item[attr]);
                    if (attr === 'vehicleExitDate') formattedItem[attr] = handleFormatDate(item[attr]);
                    if (attr === 'delayedHours') formattedItem[attr] = getDelayedHours(item[attr]);
                    if (attr === 'staticETA' || attr === 'estimatedArrivalDate') formattedItem[attr] = convertTo24HourFormat(item[attr]);
                    if (attr === 'finalStatus') formattedItem[attr] = getDelayedType(item[attr], item['delayedHours'], item['staticETA']);
                    if (attr === 'currVehicleStatus') formattedItem[attr] = '';

                } else {
                    formattedItem[attr] = item[attr];
                }
            });
            return formattedItem;
        });
        return formattedData;
    };

    const exportToPDF = async (pdfData) => {
        if (fetchingData) {
            ErrorToast("Please Wait while fetching the data");
        } else {
            if (pdfData.length === 0) {
                ErrorToast("No trips found");
            } else {
                const doc = new jsPDF('landscape');
                const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

                doc.setFontSize(16);
                doc.text('10 Hours Trips Report', 130, 10);

                const formattedData = formatData(pdfData);

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
                        13: { cellWidth: 40 },
                    },
                    didDrawCell: (data) => {

                        if (data.column.dataKey === 'currVehicleStatus' && data.row.raw['S.No.'] !== 'S.No.') {

                            const cellWidth = data.cell.width;
                            const cellHeight = data.cell.height;
                            const cellX = data.cell.x + (cellWidth / 2);
                            const cellY = data.cell.y + (cellHeight / 3);
                            const radius = 1.5;

                            const test = vehiclesOnHold.filter(filters => filters?.vehicleNo === data.row.raw.vehicleNo);

                            let color = '#fff';
                            if (test[0]?.currVehicleStatus === 'On Hold') {
                                color = '#fffc00'
                            } else if (test[0]?.currVehicleStatus === 'GPS Off') {
                                color = '#ff0000'
                            } else if (test[0]?.currVehicleStatus === 'Running') {
                                color = '#00ff00'
                            }

                            doc.setFillColor(color);
                            doc.circle(cellX, cellY, radius, 'F', color);
                        }
                    },
                    rowPageBreak: 'avoid'
                });

                doc.save('10 Hours Trips report.pdf');
            }
        }
    };


    const exportToExcel = () => {
        let formattedData = []

        formattedData = vehiclesOnHold.map(item => ({
            'Vehicle No': item.vehicleNo,
            'Status': item?.currVehicleStatus,
            'Loading (Date / Time)': handleFormateISTDate(item.loadingDate),
            'Vehicle Exit (Date / Time)': handleFormatDate(item.vehicleExitDate),
            'Origin': item.origin,
            'Destination': item.destination,
            'Static ETA': convertTo24HourFormat(item?.staticETA),
            'GPS (Date / Time)': item?.locationTime,
            'Reach Date': item?.unloadingReachDate === "" || item?.unloadingReachDate === null ? '' : handleFormatDate(item?.unloadingReachDate),
            'Route (KM)': item?.routeKM,
            'KM Covered': item?.runningKMs,
            'Difference (Km)': item?.kmDifference,
            'Last 10 Hrs KM': item?.last10HoursKms,
            'Location': item?.location,
            'Estimated Arrival Date': convertTo24HourFormat(item?.estimatedArrivalDate),
            'Final Status': getDelayedType(item?.finalStatus, item?.delayedHours, item?.staticETA),
            'KM Covered': item?.kmCovered,
        }));

        if (formattedData.length > 0) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(formattedData);

            const headerCellStyle = {
                font: { bold: true }
            };

            // Apply style to the header row (first row)
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = headerCellStyle;
            }

            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            XLSX.writeFile(wb, '10_hours_report.xlsx');
        } else {
            ErrorToast("No data found")
        }


    };

    return (
        <>
            <Col sm={8} className='ps-5'>
                {
                    fetchingData ? <TextLoader /> : (
                        <div className='d-flex justify-content-start align-items-center w-100'>
                            <Button className="px-5" onClick={() => exportToPDF(vehiclesOnHold)}>Download Last 10 Hours Report</Button>
                        </div>
                    )
                }
            </Col>
        </>
    )
}

export default HoursReport;