import React, { useEffect, useState } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import Card from '../../components/Card/card';
import { Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { BsFileEarmarkExcelFill } from 'react-icons/bs';

const Reports = () => {

    const [selectedReportType, setSelectedReportType] = useState('');
    const [reportType, setReportType] = useState('');

    const [selectedFilters, setSelectedFilters] = useState([]);

    // Trips

    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);

    const allFilters = ['Trip Running', 'Early', 'On Time', 'Delayed'];

    const attributes = ['vehicleNo', 'loadingDate', 'vehicleExitDate', 'origin', 'staticETA', 'locationTime', 'destination', 'routeKM', 'runningKMs',
        'kmDifference', 'location', 'estimatedArrivalDate', 'finalStatus', 'oemFinalStatus', 'tripStatus', 'delayedHours'
    ];
    const columnNames = ['Vehhicle No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Location', 'Estimated Arrival Date', 'Final Status', 'OEM Final Status', 'Delayed Hours'
    ];

    const reportTypes = [{
        label: "Trips Report",
        value: "Trips Report"
    }];

    const handleChangeReportType = (report) => {
        // setSelectedReportType(report);

        const searchValue = report?.value;

        const filteredTypes = reportTypes.filter(data =>
            ((data?.value && data?.value.toLowerCase().includes(searchValue.toLowerCase())))
        );

        setSelectedReportType(filteredTypes);
        setReportType(searchValue);
    };

    const handleFilterTrips = () => {

        getRunningTrips().then((response) => {
            if (response.status === 200) {
                const allData = response?.data;
                let testArr = [];

                const allTrips = allData?.filter(data => data?.tripStatus === 'Trip Running');
                // allTrips.map(data => {

                // })

                setAllTrips(allTrips);

                if (selectedFilters.length > 0) {
                    let tripsFilteredByTripStatus = [];

                    if (selectedFilters.includes('Trip not Assgined')) {
                        if (selectedFilters.includes('Trip Running')) {
                            if (selectedFilters.includes('Trip Running') && selectedFilters.includes('Manual Bind')) {
                                tripsFilteredByTripStatus = allTrips.filter((data) => ((data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running") && data?.exitFrom === "Manual Bind");
                            } else if (selectedFilters.includes('Trip Running')) {
                                tripsFilteredByTripStatus = allTrips.filter((data) => ((data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running"));
                            }
                        } else if (selectedFilters.includes('Trip Completed')) {
                            tripsFilteredByTripStatus = [];
                        } else if (selectedFilters.includes('Trip not Assgined') && selectedFilters.length === 1) {
                            tripsFilteredByTripStatus = allTrips.filter((data) => (data?.tripLogNo === null || (data?.tripLogNo !== null && data?.tripLogNo.length === 0)) && data?.tripStatus === "Trip Running");
                        }
                    } else {
                        tripsFilteredByTripStatus = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && selectedFilters.includes(data?.finalStatus));

                        if (selectedFilters.includes("On Time & Early (As per OEM)") || selectedFilters.includes("Delayed (As per OEM)") || selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed') || selectedFilters.includes('Early') || selectedFilters.includes('On Time')) {
                            let finalStatusTrips = [];

                            if (selectedFilters.includes("Early") || selectedFilters.includes("On Time")) {
                                if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                    const trips = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && selectedFilters.includes(data?.finalStatus));
                                    trips.map((data) => finalStatusTrips.push(data));
                                } else {
                                    const trips = allTrips.filter((data) => selectedFilters.includes(data?.finalStatus));
                                    trips.map((data) => finalStatusTrips.push(data));
                                }
                            }

                            if (
                                (selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed')) &&
                                (!selectedFilters.includes('On Time & Early (As per OEM)') && !selectedFilters.includes('Delayed (As per OEM)'))
                            ) {
                                if (selectedFilters.includes('Mild Delayed')) {
                                    if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed') || selectedFilters.includes('On Time & Early (As per OEM)') || selectedFilters.includes('Delayed (As per OEM)')) {
                                        const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 0 && delayedHours <= 18) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 0 && delayedHours <= 18) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    }
                                }

                                if (selectedFilters.includes('Moderate Delayed')) {
                                    if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                        const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 19 && delayedHours <= 35) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 19 && delayedHours <= 35) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        });
                                    }
                                }

                                if (selectedFilters.includes('Critical Delayed')) {
                                    if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                        const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 36) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    } else {
                                        const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                        delayedArr1.forEach(data => {
                                            if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                const delayedHours = parseInt(data?.delayedHours);
                                                if (delayedHours >= 36) {
                                                    finalStatusTrips.push(data);
                                                }
                                            }
                                        })
                                    }
                                }
                            }

                            if (selectedFilters.includes("On Time & Early (As per OEM)") || selectedFilters.includes("Delayed (As per OEM)")) {
                                if (selectedFilters.includes('On Time & Early (As per OEM)')) {
                                    if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                        allTrips.forEach(data => {
                                            const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })

                                    } else if (selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed')) {
                                        if (selectedFilters.includes('Mild Delayed')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilters.includes('Moderate Delayed')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilters.includes('Critical Delayed')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    else {
                                        allTrips.forEach(data => {
                                            const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })
                                    }
                                }

                                if (selectedFilters.includes('Delayed (As per OEM)')) {
                                    if (((selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) && (selectedFilters.includes('Delayed (As per OEM)')))
                                        && (!selectedFilters.includes('Mild Delayed') && !selectedFilters.includes('Moderate Delayed') && !selectedFilters.includes('Critical Delayed'))
                                    ) {
                                        allTrips.forEach(data => {
                                            const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })

                                    }

                                    // if ((selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed') && (selectedFilters.includes('On Time & Early (As per OEM)') || selectedFilters.includes('Delayed (As per OEM)'))) &&
                                    //     (!selectedFilters.includes('On Time & Early (As per OEM)') && !selectedFilters.includes('Delayed (As per OEM)'))) {
                                    //     allTrips.forEach(data => {
                                    //         const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                    //         if (testData === true) {
                                    //             finalStatusTrips.push(data)
                                    //         }
                                    //     })

                                    // }

                                    if (selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed')) {
                                        if (selectedFilters.includes('Mild Delayed')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })

                                            } else {
                                                const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 0 && delayedHours <= 18) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilters.includes('Moderate Delayed')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 19 && delayedHours <= 35) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }

                                        if (selectedFilters.includes('Critical Delayed')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            } else {
                                                const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'Delayed');
                                                let delayedArr2 = [];
                                                delayedArr1.forEach(data => {
                                                    if (data?.delayedHours !== null && (data?.delayedHours !== undefined || data?.delayedHours.length > 0)) {
                                                        const delayedHours = parseInt(data?.delayedHours);
                                                        if (delayedHours >= 36) {
                                                            delayedArr2.push(data);
                                                        }
                                                    }
                                                });

                                                delayedArr2.forEach(data => {
                                                    const testData = (data?.oemFinalStatus === 'Delayed');
                                                    if (testData === true) {
                                                        finalStatusTrips.push(data)
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    else {
                                        allTrips.forEach(data => {
                                            const testData = (data?.oemFinalStatus === 'Delayed');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })
                                    }
                                }
                            }

                            tripsFilteredByTripStatus = finalStatusTrips;
                        } else {
                            tripsFilteredByTripStatus = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus));
                        }
                    };

                    if (selectedFilters.includes('Manual Bind')) {
                        if (selectedFilters.length === 1) {
                            tripsFilteredByTripStatus = allTrips.filter(data => data?.exitFrom === 'Manual Bind')
                        } else {
                            tripsFilteredByTripStatus = tripsFilteredByTripStatus.filter(data => data?.exitFrom === 'Manual Bind')
                        }
                    }

                    setFilteredTrips(tripsFilteredByTripStatus);
                } else {
                    setFilteredTrips(allTrips);
                }
            } else {
                setFilteredTrips([]);
            }
        }).catch((err) => console.log("err", err));
    };

    useEffect(() => {
        handleFilterTrips();
    }, [selectedFilters]);

    console.log("filtered", filteredTrips);

    const handleSelectFilter = (data) => {
        if (selectedFilters.includes(data)) {
            const filterRemoved = selectedFilters.filter(filter => filter !== data);
            setSelectedFilters(filterRemoved);
        } else {
            setSelectedFilters([...selectedFilters, data])
        }
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


    const formatData = (rowData) => {
        // Function to format specific attributes in each row
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                // Add custom formatting for specific attributes
                if (attr === 'loadingDate') {
                    // Format 'data' attribute to 'DD/MM/YYYY HH:mm:ss' format
                    formattedItem[attr] = handleFormateISTDate(item[attr]);
                }
                if (attr === 'exit, reportunloading, unoadingend, ') {
                    formattedItem[attr] = handleFormatDate(item[attr]);
                }
                if (attr === 'delayedHours') {
                    formattedItem[attr] = getDelayedHours(item[attr]);
                }
                else {
                    // Other attributes remain unchanged
                    formattedItem[attr] = item[attr];
                }
            });
            return formattedItem;
        });
        return formattedData;
    };


    const exportToPDF = () => {
        // Create a new PDF document
        const doc = new jsPDF('landscape');

        // Set the document title
        doc.setFontSize(16);
        doc.text('Trips Report', 130, 10);

        const formattedData = formatData(allTrips);

        // Define columns for the table
        const columns = attributes.map((attr, index) => ({ header: columnNames[index], dataKey: attr, styles: { fontWeight: 'bold' } }));

        // Define rows for the table
        // const rows = allTrips.map(item => {
        //     const row = {};
        //     attributes.forEach(attr => {
        //         row[attr] = item[attr];
        //     });
        //     return row;
        // });

        // Add table to PDF
        doc.autoTable({
            columns,
            body: formattedData,
            margin: { top: 20, right: 2, bottom: 0, left: 2 },
            styles: {
                fontSize: 8 // Set the font size of the data to 12 points
                // You can customize other styles here as well
            },
            columnStyles: {
                // Adjust the width of each column as needed
                // 9: { cellWidth: 13 }, // Example: Set the width of the first column to 40
                10: { cellWidth: 40 }, // Example: Set the width of the first column to 40
                // 1: { cellWidth: 60 }, // Example: Set the width of the second column to 60
                // Add more column styles as needed
            }
        });

        // Save the PDF
        doc.save('data.pdf');
    };



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


    return (
        <div className='thm-dark m-0 p-0 p-5 pt-3'>
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
                    <Col sm={3} className='ps-5'>
                        <h6 className='m-0 p-0'>Report Category</h6>

                        {
                            reportType === "Trips Report" ? (
                                <div className='mt-4 d-flex jsutify-content-start align-items-start flex-column'>
                                    {
                                        allFilters.map((data, index) => (
                                            <div className='pb-2 cursor-pointer d-flex justify-content-start align-items-center flex-row'
                                                onClick={() => handleSelectFilter(data, index)}
                                                key={index}>
                                                <Form.Check className='me-2' checked={selectedFilters.includes(data)} />
                                                {data}
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : null
                        }
                    </Col>

                    <Col sm={5}></Col>
                    <Col sm={1} className='d-flex justify-content-end align-items-start'>
                        {
                            selectedFilters.length > 0 ? (
                                <Tooltip title="Export To Excel">
                                    <Link>
                                        <BsFileEarmarkExcelFill className='ms-2 text-success cursor-pointer fs-3' onClick={exportToPDF} />
                                    </Link>
                                </Tooltip>
                            ) : null
                        }
                    </Col>


                </Row>
                {/* <div className=''>
                    <h5 className='m-0 p-0'>Trip Report</h5>

                    <div className='mt-4 d-flex jsutify-content-start align-items-start flex-column'>
                        <div className='pb-2 cursor-pointer'>Trip Running</div>
                        <div className='pb-2 cursor-pointer'>Trip completed</div>
                        <div className='pb-2 cursor-pointer'>Trip Early</div>
                        <div className='pb-2 cursor-pointer'>Trip On Time</div>
                        <div className='pb-2 cursor-pointer'>Trip Delayed</div>
                    </div>
                </div> */}
            </Card>
        </div>
    )
}

export default Reports
