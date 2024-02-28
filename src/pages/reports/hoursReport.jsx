import React, { useEffect, useState } from 'react'
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Col } from 'react-bootstrap';
import Button from '../../components/Button/coloredButton';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { ErrorToast } from '../../components/toast/toast';
import { getHoursReports } from '../../hooks/reportHooks';

const HoursReport = () => {

    const [runningTrips, setRunningTrips] = useState([]);
    const [lastRecord, setLastRecord] = useState([]);
    const [runningVehicles, setRunningVehicles] = useState([]);
    const [tripsReport, setTripsReport] = useState([]);

    const [vehiclesOnHold, setVehiclesOnHold] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);
    const [holdVehicle, setHoldVehicle] = useState(false);

    const attributes = ['S.No.', 'vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'staticETA', 'locationTime', 'routeKM', 'runningKMs',
        'kmDifference', 'location', 'estimatedArrivalDate', 'finalStatus', 'KmCovered', 'timeDifference'
    ];

    const columnNames = ['S.No.', 'Vehicle No.', 'Status', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Location', 'Estimated Arrival Date', 'Final Status', 'KM Covered', 'Hold Hours'
    ];

    useEffect(() => {
        getRunningTrips().then(response => {
            if (response.status === 200) {
                const allData = response?.data;

                let filteredTrips = allData.filter(data => data?.tripStatus === 'Trip Running' && data?.tripLogNo !== '' && data?.reachPointName === '')
                setRunningTrips(filteredTrips);

                let runningVehicles = [];
                filteredTrips.forEach(data => {
                    runningVehicles.push(data?.vehicleNo);
                });

                setRunningVehicles(runningVehicles);
            }
        }).catch(err => err?.response?.data && ErrorToast(err?.response?.data))
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
                    const holdVehicleData = [];

                    response?.data.forEach((item) => {
                        const { vehicleNo, latLongDistance } = item;
                        if (!distanceMap[vehicleNo]) {
                            distanceMap[vehicleNo] = parseFloat(latLongDistance);
                        } else {
                            distanceMap[vehicleNo] += parseFloat(latLongDistance);
                        }
                    });

                    for (const vehicleNo in distanceMap) {
                        final.push({
                            finalDistance: distanceMap[vehicleNo].toFixed(3),
                            vehicleNo: vehicleNo,
                        });
                    };

                    final.forEach(data => {
                        (parseFloat(data?.finalDistance) < 20) && holdVehicleData.push(data);
                        (parseFloat(data?.finalDistance) < 20) && vehiclesOnHold.push(data?.vehicleNo);
                    });

                    setTripsReport(vehiclesOnHold);

                } else {
                    setTripsReport([])
                }
            }).catch(err => {
                setTripsReport([])
                console.log(err);
            })
        }
    }, [runningVehicles]);

    useEffect(() => {
        if (runningVehicles.length > 0) {
            let filteredTripsOnHold = [];

            runningTrips.map(data => {
                tripsReport.includes(data?.vehicleNo) && filteredTripsOnHold.push(data);
            });
            setVehiclesOnHold(filteredTripsOnHold);
        };
    }, [fetchingData]);

    const test = lastRecord.reverse();

    // let test = [];
    const [holds, setHolds] = useState([]);
    useEffect(() => {
        if (runningTrips.length > 0) {

            const vehicleData = {};

            test.forEach((record) => {
                const { vehicleNo, date, location, latLongDistance } = record;

                if (!vehicleData[vehicleNo]) {
                    vehicleData[vehicleNo] = { location, dates: [date], distance: [latLongDistance] };
                } else {
                    vehicleData[vehicleNo].distance.push(latLongDistance);
                    vehicleData[vehicleNo].dates.push(date);
                    vehicleData[vehicleNo].location = location;
                }
            });


            const finalResult = Object.entries(vehicleData).map(([vehicleNo, { location, dates, distance }]) => {

                // const test = lastRecord;
                const firstLocationChangeDates = {};

                for (let i = lastRecord.length - 1; i >= 0; i--) {
                    const currentRecord = lastRecord[i];
                    const { vehicleNo, date, location } = currentRecord;

                    if (!firstLocationChangeDates[vehicleNo]) {
                        firstLocationChangeDates[vehicleNo] = date; // Record the first date for the vehicleNo
                    } else if (location !== lastRecord[i + 1]?.location) {
                        firstLocationChangeDates[vehicleNo] = date; // Update if location changes
                    }
                }

                // Handle the case where the location remains unchanged for a vehicle
                lastRecord.forEach(record => {
                    const { vehicleNo, date } = record;
                    if (!(vehicleNo in firstLocationChangeDates)) {
                        firstLocationChangeDates[vehicleNo] = date; // Record the first date for the vehicleNo
                    }
                });

                // const firstLocationChangeDates = {};
                // for (let i = test.length - 1; i >= 0; i--) {
                //     const currentRecord = test[i];
                //     const { vehicleNo, date, location } = currentRecord;

                //     if (!firstLocationChangeDates[vehicleNo]) {
                //         firstLocationChangeDates[vehicleNo] = date;
                //     } else {
                //         if (location !== test[i + 1]?.location) {
                //             firstLocationChangeDates[vehicleNo] = date;
                //         }
                //     }
                // };


                const distanceCovered = distance.reduce((prev, curr) => (parseFloat(prev) + parseFloat(curr)));
                const KmCovered = parseInt(distanceCovered);

                const firstDate = new Date(firstLocationChangeDates[vehicleNo]);

                // console.log('date', vehicleNo, firstLocationChangeDates[vehicleNo], ((new Date() - firstDate) / (1000 * 60 * 60)));

                const timeDifference = (new Date() - firstDate) / (1000 * 60 * 60);
                return { vehicleNo, firstDate, timeDifference, location, KmCovered };
            });

            const finalArr = vehiclesOnHold.map(vehicleObj => {
                const found = finalResult.find(testObj => testObj.vehicleNo === vehicleObj.vehicleNo);

                console.log("found", finalResult);
                // const timeDiff = (`${(finalResult[vehicleObj?.vehicleNo]?.timeDifference).toFixed(2)}`).length > 0 ? (`${(finalResult[vehicleObj?.vehicleNo]?.timeDifference).toFixed(2)}`).split('.') : parseFloat((finalResult[vehicleObj?.vehicleNo]?.timeDifference).toFixed(2));

                const timeDiff = (`${(found.timeDifference).toFixed(2)}`).length > 0 ? (`${(found.timeDifference).toFixed(2)}`).split('.') : parseFloat((found.timeDifference).toFixed(2));
                const hour = parseInt(timeDiff[0]);
                const minutes = timeDiff.length > 1 ? parseInt(timeDiff[1]) : 0;
                const finalTime = minutes > 60 ? (hour + 1) : minutes;
                // const finalTime = minutes > 60 ? `${(hour + 1)}` : `${hour}:${minutes < 10 ? `0${minutes}` : minutes}`;

                const coveredDistance = parseFloat(found?.KmCovered) > 0 ? parseFloat(found?.KmCovered) : 0

                return {
                    ...vehicleObj,
                    timeDifference: found ? found.timeDifference : '',
                    KmCovered: found ? coveredDistance : ''
                };
            });

            setHolds(finalArr);
            if ((finalArr.length > 0) && (!holdVehicle)) {
                console.log("final", finalArr);
                // holds.push(finalArr);
                setVehiclesOnHold(finalArr);
            };

            setTimeout(() => {
                setHoldVehicle(true);
            }, 200);
        };
    }, [vehiclesOnHold, runningVehicles, lastRecord, fetchingData]);
    // 
    console.log("holds", holds);

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

    const formatData = (rowData) => {
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                if (attr === 'loadingDate' || attr === 'vehicleExitDate' || attr === 'delayedHours' || attr === 'staticETA' || attr === 'oemReachTime'
                    || attr === 'estimatedArrivalDate' || attr === 'finalStatus') {
                    if (attr === 'loadingDate' || attr === 'oemReachTime') {
                        formattedItem[attr] = handleFormateISTDate(item[attr]);
                    }
                    if (attr === 'vehicleExitDate') {
                        formattedItem[attr] = handleFormatDate(item[attr]);
                    }
                    if (attr === 'delayedHours') {
                        formattedItem[attr] = getDelayedHours(item[attr]);
                    }
                    if (attr === 'staticETA' || attr === 'estimatedArrivalDate') {
                        formattedItem[attr] = convertTo24HourFormat(item[attr]);
                    }

                    if (attr === 'finalStatus') {
                        formattedItem[attr] = getDelayedType(item[attr], item['delayedHours']);
                    }
                }
                // else if (attr === 'currVehicleStatus') {
                //     const test = () => {
                //         return (
                //             <div className='h-100 py-3  pb-4 d-flex justify-content-center align-items-center'>
                //                 <div className='h-100'>
                //                     <div className={`circle ${item['currentStatus'] === "On Hold" ? 'circle-yellow-blink' : item['currentStatus'] === 'Running' ? 'circle-green-blink' : item['currentStatus'] === 'GPS Off' ? 'circle-red-blink' : item['currentStatus'] === null && 'bg-white'}`}></div>
                //                 </div>
                //             </div>
                //             //         `
                //             // <td class='h-100 py-3  pb-4 d-flex justify-content-center align-items-center'>
                //             //     <div class='h-100'>
                //             //         <div class='${item['currentStatus'] === "On Hold" ? 'circle-yellow-blink' : item['currentStatus'] === 'Running' ? 'circle-green-blink' : item['currentStatus'] === 'GPS Off' ? 'circle-red-blink' : item['currentStatus'] === null && 'bg-white'}'></div>
                //             //     </div>
                //             // </td>`
                //         )
                //     }

                //     formattedItem[attr] = test();
                // }
                else {
                    formattedItem[attr] = item[attr];
                }
            });
            return formattedItem;
        });
        return formattedData;
    };

    const exportToPDF = async () => {
        if (fetchingData) {
            ErrorToast("Please Wait while fetching data");
        } else {
            if (vehiclesOnHold.length === 0) {
                ErrorToast("No trips found");
            } else {
                const doc = new jsPDF('landscape');
                const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

                doc.setFontSize(16);
                doc.text('10 Hours Trips Report', 130, 10);

                const formattedData = formatData(vehiclesOnHold);

                formattedData.forEach((row, index) => {
                    row['S.No.'] = index + 1
                });

                const columns = attributes.map((attr, index) => ({ header: columnNames[index], dataKey: attr, styles: { fontWeight: 'bold' } }));
                // Customize the cell function for the 'vehicleNo' column
                doc.autoTable({
                    columns,
                    body: formattedData,
                    margin: firstPageMargin,
                    styles: {
                        fontSize: 8,
                        height: 100
                    },
                    columnStyles: {
                        12: { cellWidth: 40 },
                    }
                });

                doc.save('10 Hours Trips report.pdf');
            }
        }
    };

    // const test = []

    return (
        <>
            <Col sm={5} className='ps-5'>
                {
                    fetchingData ? (
                        <p className='fw-bold text-secondary'>Please Wait while fetching the data
                            <span className='ms-2 dot-one'>.</span>
                            <span className='ms-2 dot-two'>.</span>
                            <span className='ms-2 dot-three'>.</span>
                            <span className='ms-2 dot-four'>.</span>
                            <span className='ms-2 dot-five'>.</span>
                            <span className='ms-2 dot-six'>.</span>
                        </p>
                    ) : (
                        <Button className="px-5" onClick={() => exportToPDF()}>Download Last 10 Hours Report</Button>
                    )
                }
            </Col>
        </>
    )
}

export default HoursReport;
