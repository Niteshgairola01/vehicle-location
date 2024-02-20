import React, { useEffect, useState } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import Card from '../../components/Card/card';
import { Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
import { getAllPartiesList } from '../../hooks/clientMasterHooks';

const Reports = () => {

    const [selectedReportType, setSelectedReportType] = useState('');
    const [reportType, setReportType] = useState('');

    const [selectedFilters, setSelectedFilters] = useState([]);

    // Trips
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [finalTrips, setFinalTrips] = useState([]);

    // const [tripsByOEM, setTri]
    const [OEMList, setOEMList] = useState([]);
    const [selectedOEM, setSelectedOEM] = useState('');
    const [OEMName, setOEMName] = useState('');
    const filteredOEMTrips = finalTrips.length > 0 ? (OEMName === "" ? finalTrips : finalTrips.filter(data => data?.consignorName && data?.consignorName?.toLowerCase().includes(OEMName.toLowerCase()))) : [];

    // useEffect(() => {
    //     const filteredOEMTrips = finalTrips.length > 0 ? (OEMName === "" ? filteredTrips : finalTrips.filter(data => data?.consignorName && data?.consignorName?.toLowerCase().includes(OEMName.toLowerCase()))) : [];
    //     setOEMTrips(filteredOEMTrips);
    // }, [filteredTrips])

    useEffect(() => {
        if (selectedOEM === null) {
            setOEMName('');
        }
    }, [selectedOEM]);

    const allFilters = ['Early', 'On Time', 'Mild Delayed', 'Moderate Delayed', 'Critical Delayed', 'On Time & Early (As per OEM)', 'Delayed (As per OEM)'];

    const attributes = ['S.No.', 'vehicleNo', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'staticETA', 'locationTime', 'routeKM', 'runningKMs',
        'kmDifference', 'location', 'estimatedArrivalDate', 'finalStatus', 'oemFinalStatus', 'delayedHours'
    ];

    const columnNames = ['S.No.', 'Vehicle No.', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
        'Route (KM)', 'KM Covered', 'Difference (Km)', 'Location', 'Estimated Arrival Date', 'Final Status', 'OEM Final Status', 'Delayed Hours'
    ];

    const reportTypes = [{
        label: "Trips Report",
        value: "Trips Report"
    }];

    const sortByDate = (data) => {
        data.sort((a, b) => {
            const dateA = new Date(a.loadingDate.split(' ')[0]);
            const timeA = a.loadingDate.split(' ')[1];
            const [hoursA, minutesA, secondsA] = timeA.split(':');

            const dateB = new Date(b.loadingDate.split(' ')[0]);
            const timeB = b.loadingDate.split(' ')[1];
            const [hoursB, minutesB, secondsB] = timeB.split(':');

            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;

            if (hoursA > hoursB) return -1;
            if (hoursA < hoursB) return 1;
            if (minutesA > minutesB) return -1;
            if (minutesA < minutesB) return 1;
            if (secondsA > secondsB) return -1;
            if (secondsA < secondsB) return 1;
            return 0;
        });

        return data;
    };

    const getOEMList = () => {
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
    }

    useEffect(() => {
        if (selectedReportType[0]?.value === 'Trips Report') {
            getOEMList();
        }
    }, [selectedReportType]);

    useEffect(() => {
        if (selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed')) {
            let critical = filteredTrips.filter(data => parseInt(data?.delayedHours) >= 36);
            let moderate = filteredTrips.filter(data => (parseInt(data?.delayedHours) >= 19 && parseInt(data?.delayedHours) <= 35));
            let mild = filteredTrips.filter(data => parseInt(data?.delayedHours) <= 18);

            let sortedCritical = sortByDate(critical);
            let sortedModerate = sortByDate(moderate);
            let sortedMild = sortByDate(mild);

            let nonDelayed = filteredTrips.filter(data => data?.finalStatus !== 'Delayed');

            setFinalTrips([...sortedCritical, ...sortedModerate, ...sortedMild, ...nonDelayed]);
        } else {
            setFinalTrips(filteredTrips);
        }
    }, [filteredTrips]);

    const handleChangeReportType = (report) => {
        const searchValue = report?.value;
        const filteredTypes = reportTypes.filter(data =>
            ((data?.value && data?.value.toLowerCase().includes(searchValue?.toLowerCase())))
        );

        setSelectedReportType(filteredTypes);
        setReportType(searchValue);
    };

    const handleSelectOEM = (oem) => {
        setSelectedOEM(oem);
        setOEMName(oem?.value);
    };

    const handleFilterTrips = () => {

        getRunningTrips().then((response) => {
            if (response.status === 200) {
                const allData = response?.data;

                const allTrips = allData?.filter(data => data?.tripStatus === 'Trip Running');

                allTrips.sort();
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

                            if ((selectedFilters.includes("Early") || selectedFilters.includes("On Time")) &&
                                (!selectedFilters.includes('On Time & Early (As per OEM)') && !selectedFilters.includes('Delayed (As per OEM)'))
                            ) {
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
                                    if (!selectedFilters.includes('On Time') && !selectedFilters.includes('Early') && !selectedFilters.includes('Mild Delayed') && !selectedFilters.includes('Moderate Delayed') && !selectedFilters.includes('Critical Delayed')) {
                                        allTrips.forEach(data => {
                                            const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                            if (testData === true) {
                                                finalStatusTrips.push(data)
                                            }
                                        })

                                    }

                                    if (selectedFilters.includes('On Time') || selectedFilters.includes('Early')) {
                                        if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                            const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && selectedFilters.includes(data?.finalStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early'));
                                            delayedArr1.map(data => finalStatusTrips.push(data))
                                            // finalStatusTrips = delayedArr1
                                        } else {
                                            const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.finalStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early'));
                                            delayedArr1.map(data => finalStatusTrips.push(data))
                                            // finalStatusTrips = delayedArr1
                                        }
                                        // if (selectedFilters.includes('On Time')) {
                                        //     if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                        //         const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'On Time' && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early'));
                                        //         delayedArr1.map(data => finalStatusTrips.push(data))
                                        //         // finalStatusTrips = delayedArr1
                                        //     } else {
                                        //         const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'On Time' && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early'));
                                        //         delayedArr1.map(data => finalStatusTrips.push(data))
                                        //         console.log("delayedArr1", delayedArr1);
                                        //         // finalStatusTrips = delayedArr1
                                        //     }
                                        // }

                                        // if (selectedFilters.includes('Early')) {
                                        //     if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                        //         const delayedArr1 = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Early' && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early'));
                                        //         delayedArr1.map(data => finalStatusTrips.push(data))
                                        //         // finalStatusTrips = delayedArr1
                                        //     } else {
                                        //         const delayedArr1 = allTrips.filter((data) => data?.finalStatus === 'On Time' && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early'));
                                        //         delayedArr1.map(data => finalStatusTrips.push(data))
                                        //         // finalStatusTrips = delayedArr1
                                        //     }
                                        // }

                                    }

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


                                    // if (!selectedFilters.includes('Early') || !selectedFilters.includes('On Time') || !selectedFilters.includes('Mild Delayed') || !selectedFilters.includes('Moderate Delayed') || !selectedFilters.includes('Critical Delayed')) {
                                    //     allTrips.forEach(data => {
                                    //         const testData = (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early');
                                    //         if (testData === true) {
                                    //             finalStatusTrips.push(data)
                                    //         }
                                    //     })
                                    // }
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
                return 'Mild Dealyed';
            } else if (parseInt(hours) >= 19 && parseInt(hours) <= 35) {
                return 'Moderate Delayed';
            } else if (parseInt(hours) >= 36) {
                return 'Critical Delayed';
            }
        }
    }

    const formatData = (rowData) => {
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                if (attr === 'loadingDate' || attr === 'vehicleExitDate' || attr === 'delayedHours' || attr === 'staticETA' || attr === 'estimatedArrivalDate' || attr === 'finalStatus') {
                    if (attr === 'loadingDate') {
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

    const [pdfData, setPdfData] = useState('');

    const exportToPDF = async () => {
        const doc = new jsPDF('landscape');
        const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

        doc.setFontSize(16);
        doc.text('Trips Report', 130, 10);

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
                fontSize: 8
            },
            columnStyles: {
                11: { cellWidth: 40 },
            }
        });

        doc.save('Trips-report.pdf');

        const pdfBlob = await doc.output('blob');
        setPdfData(pdfBlob);
        // return pdfBlob;
    };

    const constructWhatsAppLink = (pdfDataUri) => {
        console.log("pdf", pdfDataUri.length);
        // WhatsApp's maximum data URI length: 2048
        const truncatedDataUri = pdfDataUri.length > 2048 ? pdfDataUri.substring(0, 2048) : pdfDataUri;
        // return `https://wa.me/?text=${encodeURIComponent(pdfDataUri)}`;
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(pdfDataUri)}`)
        // return `https://wa.me/?text=${encodeURIComponent(truncatedDataUri)}`;
    };

    const openWhatsAppChat = (pdfDataUri) => {
        window.open(`whatsapp://send?text=${encodeURIComponent(pdfDataUri)}`, '_blank');
        // window.open(`whatsapp://send?text=${encodeURIComponent(`OEM Name:- ${selectedOEM?.value}`)}`, '_blank');
    };

    const sharePDFViaWhatsApp = async () => {
        const doc = new jsPDF('landscape');

        const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

        doc.setFontSize(16);
        doc.text('Trips Report', 130, 10);

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
                fontSize: 8
            },
            columnStyles: {
                11: { cellWidth: 40 },
            }
        });

        // Stack Overflow
        // const byteString = window.atob(dataURI);
        // const arrayBuffer = new ArrayBuffer(byteString.length);
        // const int8Array = new Uint8Array(arrayBuffer);
        // for (let i = 0; i < byteString.length; i++) {
        //     int8Array[i] = byteString.charCodeAt(i);
        // }
        // const blob = new Blob([int8Array], { type: 'application/pdf' });
        // return blob;

        // const buffer = await doc.output("arraybuffer");
        // const dataUri = `data:application/pdf;base64,${btoa(buffer)}`;
        // const pdfDataUri = doc.output('dataurlstring')
        // const base64PDF = pdfDataUri.split(',')[1];

        const blob = doc.output('blob');
        const blobPDF = new Blob([doc.output('blob')], { type: 'application/pdf' });
        // const blob = dataURItoBlob(doc.output('bloburl'));
        const url = URL.createObjectURL(blobPDF);

        console.log("blobPDF", blobPDF);
        console.log("url", url);

        // dataURItoBlob(doc.output());
        // console.log("url", doc.output('bloburl'));
        // const url = URL.createObjectURL(blob);
        window.open(`whatsapp://send?text=${url}`)
        // window.location.href = `https://wa.me/${8503879951}?text=Document%20shared%20via%20your%20app`;

        // console.log("uri", pdfDataUri);
        // const whatsappLink = constructWhatsAppLink(dataUri);
        // window.open(url, '_blank');
        // openWhatsAppChat(pdfDataUri);
    };

    function dataURItoBlob(dataURI) {
        // console.log("url", dataURI);
        // console.log("url length", dataURI.length);

        // window.open(dataURI, '_blank');
        // window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(dataURI)}`)

        // window.open(`whatsapp://send?text=${encodeURIComponent(dataURI)}`)

        // const byteString = window.atob(dataURI)
        const byteString = btoa(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: 'application/pdf' });
        return blob;
    }

    // data should be your response data in base64 format

    // const blob = dataURItoBlob(data);
    // const url = URL.createObjectURL(blob);

    // to open the PDF in a new 

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
            {/* <button onClick={sharePDFViaWhatsApp}>Share</button> */}
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
                    <Col sm={3}>
                        {
                            selectedReportType[0]?.value === 'Trips Report' ? (
                                <>
                                    <Form.Label>Select OEM</Form.Label>
                                    <Select
                                        options={OEMList}
                                        value={selectedOEM}
                                        onChange={handleSelectOEM}
                                        isClearable={true}
                                        styles={selectStyles}
                                        placeholder="Search OEM"
                                    />
                                </>
                            ) : null
                        }
                    </Col>

                    <Col sm={2}></Col>
                    <Col sm={1} className='d-flex justify-content-end align-items-start'>
                        {
                            selectedFilters.length > 0 ? (
                                <Tooltip title="Export As PDF">
                                    <Link>
                                        <BsFileEarmarkPdfFill className='ms-2 cursor-pointer fs-3' style={{ color: "#ed031b" }} onClick={exportToPDF} />
                                    </Link>
                                </Tooltip>
                            ) : null
                        }
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default Reports
