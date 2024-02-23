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

    const attributes = ['S.No.', 'vehicleNo', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'staticETA', 'locationTime', 'routeKM', 'runningKMs',
        'kmDifference', 'location', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
    ];

    const columnNames = ['S.No.', 'Vehicle No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Location', 'Estimated Arrival Date', 'Final Status', 'Delayed Hours'
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

            runningTrips.forEach(data => {
                tripsReport.includes(data?.vehicleNo) && filteredTripsOnHold.push(data);
            });

            setVehiclesOnHold(filteredTripsOnHold);
        };
    }, [tripsReport, runningTrips, runningVehicles]);

    useEffect(() => {
        if (runningTrips.length > 0) {
            const vehicleMap = {};

            lastRecord.forEach(item => {
                if (!(item.vehicleNo in vehicleMap)) {
                    vehicleMap[item.vehicleNo] = {
                        lastLocation: null,
                        lastTime: null,
                        timeDifference: 0
                    };
                }

                const vehicle = vehicleMap[item.vehicleNo];

                if (vehicle.lastLocation !== item.location) {
                    if (vehicle.lastTime !== null) {
                        const diff = Math.abs(new Date(item.date) - new Date(vehicle.lastTime));
                        vehicle.timeDifference += diff / (1000 * 60 * 60);
                    }
                    vehicle.lastLocation = item.location;
                }

                vehicle.lastTime = item.date;
            });

            const final = [];

            for (const vehicleNo in vehicleMap) {
                const { lastLocation, timeDifference } = vehicleMap[vehicleNo];
                final.push({
                    vehicleNo,
                    timeDifference: Math.floor(timeDifference),
                    location: lastLocation
                });
            }

            const finalArr = vehiclesOnHold.map(vehicleObj => {
                const found = final.find(testObj => testObj.vehicleNo === vehicleObj.vehicleNo);
                // console.log("vehicle obj", vehicleObj);
                // console.log("final", final);
                // console.log("ets obj", testObj);

                return {
                    vehicle: vehicleObj.vehicle,
                    difference: found ? found.difference : null
                };
            });

            console.log("final", final);

            // console.log("on hold", vehiclesOnHold);

            // console.log("final arr", finalArr);

            // let trips = [];
            // final.map(data => {
            //     if (vehiclesOnHold.includes(data?.vehicleNo)) {

            //     }
            // })

            console.log("final", final);
        };
    }, [vehiclesOnHold, lastRecord, tripsReport, runningTrips, runningVehicles]);

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

    const tets = [
        {
            vehicleNo: "RJ14GH0693",
            date: "2024-02-23 03:23:29",
            location: "Jaipur",
        },
        {
            vehicleNo: "RJ14GH0693",
            date: "2024-02-23 03:23:29",
            location: "Jaipur",
        },
        {
            vehicleNo: "RJ14GH0693",
            date: "2024-02-23 03:23:29",
            location: "Jaipur",
        },
        {
            vehicleNo: "RJ14GH0693",
            date: "2024-02-23 13:23:29",
            location: "Delhi",
        },
        {
            vehicleNo: "RJ14GH0693",
            date: "2024-02-23 14:23:29",
            location: "Delhi",
        },
        {
            vehicleNo: "RJ14GH0693",
            date: "2024-02-23 15:23:29",
            location: "Delhi",
        },
        {
            vehicleNo: "RJ14GG8403",
            date: "2024-02-23 03:23:29",
            location: "Jaipur",
        },
        {
            vehicleNo: "RJ14GG8403",
            date: "2024-02-23 03:23:29",
            location: "Jaipur",
        },
        {
            vehicleNo: "RJ14GG8403",
            date: "2024-02-23 03:23:29",
            location: "Jaipur",
        },
        {
            vehicleNo: "RJ14GG8403",
            date: "2024-02-23 18:23:29",
            location: "Delhi",
        },
        {
            vehicleNo: "RJ14GG8403",
            date: "2024-02-23 20:23:29",
            location: "Delhi",
        },
        {
            vehicleNo: "RJ14GG8403",
            date: "2024-02-23 23:23:29",
            location: "Delhi",
        },
    ];

    const final = [
        {
            vehicleNo: "RJ14GH0693",
            timeDifference: '2',
            location: "Delhi",
        },
        {
            vehicleNo: "RJ14GG8403",
            timeDifference: '5',
            location: "Delhi",
        },
    ];

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
                } else {
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

                doc.autoTable({
                    columns,
                    body: formattedData,
                    margin: firstPageMargin,
                    styles: {
                        fontSize: 8,
                        height: 100
                    },
                    columnStyles: {
                        11: { cellWidth: 40 },
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
