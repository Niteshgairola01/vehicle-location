import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import { getRunningTrips } from '../../hooks/tripsHooks';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
import { FaFileExcel } from "react-icons/fa6";
import { getAllPartiesList } from '../../hooks/clientMasterHooks';
import { ErrorToast } from '../../components/toast/toast';
import { RxCross2 } from "react-icons/rx";
import '../../assets/styles/reports.css';

const TripsReport = ({ reportType, setReportType, selectedReportType, setSelectedReportType }) => {

    const [selectedFilters, setSelectedFilters] = useState([]);

    // Trips
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [finalTrips, setFinalTrips] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [columnNames, setColumnNames] = useState([]);
    const [excelAtrributes, setExcelAttributes] = useState([]);
    const [OEMList, setOEMList] = useState([]);
    const [selectedOEM, setSelectedOEM] = useState('');
    const [selectedOEMs, setSelectedOEMs] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedOrigins, setSelectedOrigins] = useState([]);

    const [sharedPdf, setsharedPdf] = useState(null);

    const tripsFilteredByOEM = finalTrips.length > 0 ? ((selectedOEMs.length === 0 || selectedOEMs.includes(undefined)) ? finalTrips : finalTrips.filter(item => {
        const consignorLowerCase = item.consignorName.toLowerCase();
        return selectedOEMs.some(consignor => consignor.toLowerCase() === consignorLowerCase) && item;
    })) : [];

    const filteredOEMTrips = tripsFilteredByOEM.length > 0 ? ((selectedOrigins.length === 0 || selectedOrigins.includes(undefined)) ? tripsFilteredByOEM : tripsFilteredByOEM.filter(item => {
        const originLowerCase = item.origin.toLowerCase();
        return selectedOrigins.some(consignor => consignor.toLowerCase() === originLowerCase) && item;
    })) : [];

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
            label: "Unloading Report",
            value: "Unloading Report"
        },
    ];

    useEffect(() => {
        if (selectedFilters.includes('On Time & Early (As per OEM)') || selectedFilters.includes('Delayed (As per OEM)')) {
            setAttributes(['S.No.', 'vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'oemReachTime', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'location', 'estimatedArrivalDate', 'oemFinalStatus', 'oemDelayedHours'
            ]);
            setColumnNames(['S.No.', 'Vehicle No.', 'Status', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA(OEM)', 'GPS (Date / Time)',
                'Reach Date', 'Route (KM)', 'KM Covered', 'Difference (Km)', 'Location', 'Estimated Arrival Date', 'OEM Final Status', 'OEM Delayed Hours'
            ]);
        } else {
            setAttributes(['S.No.', 'vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'origin', 'destination', 'staticETA', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'location', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);
            setColumnNames(['S.No.', 'Vehicle No.', 'Status', 'Loading (Date / Time)', 'Vehicle Exit (Date / Time)', 'Origin', 'Destination', 'Static ETA', 'GPS (Date / Time)',
                'Reach Date', 'Route (KM)', 'KM Covered', 'Difference (Km)', 'Location', 'Estimated Arrival Date', 'Final Status', 'Delayed Hours'
            ]);
        }
    }, [selectedFilters]);

    useEffect(() => {
        if (selectedFilters.includes('On Time & Early (As per OEM)') || selectedFilters.includes('Delayed (As per OEM)')) {
            setExcelAttributes(['vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'consignorName', 'origin', 'destination', 'oemReachTime', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'location', 'estimatedArrivalDate', 'oemFinalStatus', 'oemDelayedHours'
            ]);
        } else {
            setExcelAttributes(['vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'consignorName', 'origin', 'destination', 'staticETA', 'oemReachTime', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'location', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);
        }
    }, [selectedFilters]);

    const allFilters = ['Early', 'On Time', 'Mild Delayed', 'Moderate Delayed', 'Critical Delayed', 'On Time & Early (As per OEM)', 'Delayed (As per OEM)'];

    const sharePDFViaTelegram = async () => {
        const doc = new jsPDF('landscape');

        const firstPageMargin = { top: 15, right: 2, bottom: 0, left: 2 };

        doc.setFontSize(16);
        doc.text('Trips Report', 130, 10);

        const formattedData = formatData(filteredOEMTrips);

        formattedData.forEach((row, index) => {
            row['S.No.'] = index + 1
        });

        const columns = attributes.map((attr, index) => ({
            header: columnNames[index], dataKey: attr, styles: { fontWeight: 'bold' },
        }));

        doc.autoTable({
            columns,
            body: formattedData,
            margin: firstPageMargin,
            styles: {
                fontSize: 8
            },
            columnStyles: {
                12: { cellWidth: 35 },
            }
        });

        const pdfBlob = doc.output('blob');
        setsharedPdf(doc.output());
        const formData = new FormData();
        formData.append('chat_id', '6559524169'); // Replace 'RECIPIENT_CHAT_ID' with the chat ID of the recipient
        formData.append('document', pdfBlob, 'document.pdf');

        sendDocumentToTelegram(formData);
    };

    const sendDocumentToTelegram = async (formData) => {
        const telegramBotToken = '6919568815:AAFjrQ0vFPKGpOmdOHklBf2pDreyMeCb7Os';
        // const chatId = '6559524169';

        // const documentData = { /* Your document data */ };

        try {
            const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: '6559524169',
                    text: 'hi' // Assuming documentData contains the file data
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send document');
            }

            const responseData = await response.json();
        } catch (error) {
            console.error('Error sending document:', error);
        }
    }

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

    const sortByValue = (data) => {
        // console.log("data", data);
        data.sort((a, b) => {
            const valueA = parseInt(a?.delayedHours);
            const valueB = parseInt(b?.delayedHours);

            return valueB - valueA;
        });

        return data;
    };

    const sortByOEMValue = (data) => {
        // console.log("data", data);
        data.sort((a, b) => {
            const valueA = parseInt(a?.oemDelayedHours);
            const valueB = parseInt(b?.oemDelayedHours);

            return valueB - valueA;
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
        if (selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed') || selectedFilters.includes('Delayed (As per OEM)')) {
            if ((selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed')) &&
                (!selectedFilters.includes('Delayed (As per OEM)'))
            ) {
                let critical = filteredTrips.filter(data => parseInt(data?.delayedHours) >= 36);
                let moderate = filteredTrips.filter(data => (parseInt(data?.delayedHours) >= 19 && parseInt(data?.delayedHours) <= 35));
                let mild = filteredTrips.filter(data => parseInt(data?.delayedHours) <= 18);

                let sortedCritical = sortByValue(critical);
                let sortedModerate = sortByValue(moderate);
                let sortedMild = sortByValue(mild);

                let nonDelayed = filteredTrips.filter(data => data?.finalStatus !== 'Delayed');

                setFinalTrips([...sortedCritical, ...sortedModerate, ...sortedMild, ...nonDelayed]);
            }

            if (selectedFilters.includes('Delayed (As per OEM)')) {

                let critical = filteredTrips.filter(data => parseInt(data?.oemDelayedHours) >= 36);
                let moderate = filteredTrips.filter(data => (parseInt(data?.oemDelayedHours) >= 19 && parseInt(data?.oemDelayedHours) <= 35));
                let mild = filteredTrips.filter(data => parseInt(data?.oemDelayedHours) <= 18);

                let sortedCritical = sortByOEMValue(critical);
                let sortedModerate = sortByOEMValue(moderate);
                let sortedMild = sortByOEMValue(mild);

                let nonDelayed = filteredTrips.filter(data => data?.oemFinalStatus !== 'Delayed');

                setFinalTrips([...sortedCritical, ...sortedModerate, ...sortedMild, ...nonDelayed]);
            }
        } else {
            setFinalTrips(filteredTrips);
        }
    }, [filteredTrips, selectedFilters]);

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

    const getAllTrips = () => {
        getRunningTrips().then(response => {
            if (response?.status === 200) {
                const allData = response?.data;
                const allTrips = allData?.filter(data => data?.tripStatus === 'Trip Running');
                const uniqueOriginsSet = new Set();

                allTrips.forEach(item => {
                    item?.origin !== null && uniqueOriginsSet.add(item.origin.toLowerCase());
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

                setAllTrips(allTrips);
            } else {
                setAllTrips([]);
            }
        }).catch(() => {
            setAllTrips([]);
        })
    };

    useEffect(() => {
        getAllTrips();
    }, []);

    const handleFilterTrips = () => {

        const handleApplyFilters = (allTrips) => {
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
                                if ((selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) &&
                                    (!selectedFilters.includes('On Time') && !selectedFilters.includes('Early') && !selectedFilters.includes('Mild Delayed') && !selectedFilters.includes('Moderate Delayed') && !selectedFilters.includes('Critical Delayed'))
                                ) {
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
                                } else if (selectedFilters.includes('On Time') || selectedFilters.includes('Early')) {
                                    if (selectedFilters.includes('On Time')) {
                                        // if(selectedFilters.includes('Trip running') || selectedFilters.includes('Trip Completed')){
                                        const filtered = allTrips.filter(data => selectedFilters.includes(data?.tripStatus) && (data?.oemFinalStatus === 'On Time' || data?.oemFinalStatus === 'Early') && (data?.finalStatus === 'On Time'));
                                        finalStatusTrips = filtered;

                                        // filtered.map(data => {
                                        //     finalStatusTrips.push(data);
                                        // })
                                        // }
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

                                // if(selectedFilters.includes('Delayed (As per OEM)') && (
                                //     (!selectedFilters.includes('Trip Tunning') && !selectedFilters.includes('Trip Completed') && !selectedFilters.includes('Mo'))
                                // ))

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
                                // else {
                                //     allTrips.forEach(data => {
                                //         const testData = (data?.oemFinalStatus === 'Delayed');
                                //         if (testData === true) {
                                //             finalStatusTrips.push(data)
                                //         }
                                //     })
                                // }
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
        }

        if (selectedFilters.length === 1) {
            getRunningTrips().then((response) => {
                if (response.status === 200) {
                    const allData = response?.data;

                    const allTrips = allData?.filter(data => data?.tripStatus === 'Trip Running');
                    handleApplyFilters(allTrips);
                } else {
                    setFilteredTrips([]);
                }
            }).catch((err) => console.log("err", err));
        } else if (selectedFilters.length > 1) {
            handleApplyFilters(allTrips);
        }

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
    }

    const formatData = (rowData) => {
        const formattedData = rowData.map(item => {
            const formattedItem = {};
            attributes.forEach(attr => {
                if (attr === 'currVehicleStatus' || attr === 'loadingDate' || attr === 'vehicleExitDate' || attr === 'delayedHours' || attr === 'staticETA' || attr === 'oemReachTime'
                    || attr === 'estimatedArrivalDate' || attr === 'finalStatus' || attr === 'oemDelayedHours' || attr === 'oemFinalStatus' || attr === 'locationTime' || attr === 'unloadingReachDate') {
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

                    if (attr === 'unloadingReachDate') {
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

    const [pdfData, setPdfData] = useState('');

    // useEffect(() => {
    //     fetchContacts();
    // }, []);

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
        const availableHeight = doc.internal.pageSize.getHeight() - doc.autoTable.previous.finalY;

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

                    const cellWidth = data.cell.width; // Get cell width
                    const cellHeight = data.cell.height; // Get cell height
                    const cellX = data.cell.x + (cellWidth / 2); // Center circle horizontally
                    const cellY = data.cell.y + (cellHeight / 3); // Center circle vertically
                    const radius = 1.5; // Adjust radius based on cell size

                    const test = filteredOEMTrips.filter(filters => filters?.vehicleNo === data.row.raw.vehicleNo);

                    let color = 'black';
                    if (test[0].currVehicleStatus === 'On Hold') {
                        color = '#fffc00'
                    } else if (test[0].currVehicleStatus === 'GPS Off') {
                        color = '#ff0000'
                    } else if (test[0].currVehicleStatus === 'Running') {
                        color = '#00ff00'
                    }

                    doc.setFillColor(color); // Set fill to transparent (if supported)

                    doc.circle(cellX, cellY, radius, 'F', color);
                }
            },
            rowPageBreak: 'avoid'
        });

        doc.save('Trips-report.pdf');

        const pdfBlob = await doc.output('blob');
        setPdfData(pdfBlob);
        // return pdfBlob;
    };

    const formatDate = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        // Format the date-time string consistently for Excel
        return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}`;
    };

    // const exportToExcel = () => {
    //     let formattedData = []
    //     if (selectedFilters.includes('On Time & Early (As per OEM)') || selectedFilters.includes('Delayed (As per OEM)')) {
    //         formattedData = filteredOEMTrips.map(item => ({
    //             'Vehicle No': item.vehicleNo,
    //             'Status': item?.currVehicleStatus,
    //             'Loading (Date / Time)': new Date(handleFormateISTDate(item.loadingDate)),
    //             'Vehicle Exit (Date / Time)': new Date(handleFormatDate(item.vehicleExitDate)),
    //             'Consignor Name': item?.consignorName,
    //             'Origin': item.origin,
    //             'Destination': item.destination,
    //             'Static ETA(OEM)': new Date(handleFormateISTDate(item?.oemReachTime)),
    //             'GPS (Date / Time)': new Date(getGPSTime(item?.locationTime)),
    //             'Reach Date': item?.unloadingReachDate === "" || item?.unloadingReachDate === null ? '' : new Date(handleFormatDate(item?.unloadingReachDate)),
    //             'Route (KM)': item?.routeKM,
    //             'KM Covered': item?.runningKMs,
    //             'Difference (Km)': item?.kmDifference,
    //             'Location': item?.location,
    //             'Estimated Arrival Date': new Date(convertTo24HourFormat(item?.estimatedArrivalDate)),
    //             'OEM Final Status': getDelayedType(item?.oemFinalStatus, item?.oemDelayedHours),
    //             'OEM Delayed Hours': getDelayedHours(item?.oemDelayedHours),
    //         }));
    //     } else {
    //         formattedData = filteredOEMTrips.map(item => ({
    //             'Vehicle No': item.vehicleNo,
    //             'Status': item.currVehicleStatus,
    //             'Loading (Date / Time)': new Date(handleFormateISTDate(item.loadingDate)),
    //             'Vehicle Exit (Date / Time)': new Date(handleFormatDate(item.vehicleExitDate)),
    //             'Consignor Name': item?.consignorName,
    //             'Origin': item.origin,
    //             'Destination': item.destination,
    //             'Static ETA': new Date(convertTo24HourFormat(item?.staticETA)),
    //             'Static ETA(OEM)': new Date(handleFormateISTDate(item?.oemReachTime)),
    //             'GPS (Date / Time)': new Date(getGPSTime(item?.locationTime)),
    //             'Reach Date': item?.unloadingReachDate === "" || item?.unloadingReachDate === null ? '' : new Date(handleFormatDate(item?.unloadingReachDate)),
    //             'Route (KM)': item?.routeKM,
    //             'KM Covered': item?.runningKMs,
    //             'Difference (Km)': item?.kmDifference,
    //             'Location': item?.location,
    //             'Estimated Arrival Date': new Date(convertTo24HourFormat(item?.estimatedArrivalDate)),
    //             'Final Status': getDelayedType(item?.finalStatus, item?.delayedHours),
    //             'Delayed Hours': getDelayedHours(item?.delayedHours),
    //         }));
    //     }

    //     console.log("formatted data", formattedData);

    //     if (formattedData.length > 0) {
    //         const wb = XLSX.utils.book_new();
    //         const ws = XLSX.utils.json_to_sheet(formattedData);

    //         const dateColumns = ['C', 'D', 'H', 'I', 'J', 'K', 'P']; // Columns corresponding to 'Loading Date', 'Creation Date', and 'Vehicle Exit Date'
    //         dateColumns.forEach(column => {
    //             for (let i = 1; i <= formattedData.length; i++) {
    //                 const cellAddress = column + i;
    //                 const cell = ws[cellAddress];
    //                 if (cell && cell.t === 'd') {
    //                     cell.z = 'dd/mm/yyyy hh:mm:ss'; // Specify the desired date/time format
    //                 }
    //             }
    //         });

    //         const headerCellStyle = {
    //             font: { bold: true }
    //         };

    //         // Apply style to the header row (first row)
    //         const headerRange = XLSX.utils.decode_range(ws['!ref']);
    //         for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    //             const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    //             if (!ws[cellAddress]) continue;
    //             ws[cellAddress].s = headerCellStyle;
    //         }

    //         XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    //         XLSX.writeFile(wb, 'trips_report.xlsx');
    //     } else {
    //         ErrorToast("No data found")
    //     }


    // };

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

        if (selectedFilters.includes('On Time & Early (As per OEM)') || selectedFilters.includes('Delayed (As per OEM)')) {
            headers = [
                {
                    vehicleNo: 'Vehicle No.',
                    currVehicleStatus: 'Status',
                    loadingDate: 'Loading (Date / Time)',
                    vehicleExitDate: 'Vehicle Exit (Date / Time)',
                    consignorName: 'Consignor Name',
                    origin: 'Origin',
                    destination: 'Destination',
                    oemReachTime: 'Static ETA(OEM)',
                    locationTime: 'GPS (Date / Time)',
                    unloadingReachDate: 'Reach Date',
                    routeKM: 'Route (KM)',
                    runningKMs: 'KM Covered',
                    kmDifference: 'Difference (Km)',
                    location: 'Location',
                    estimatedArrivalDate: 'Estimated Arrival Date',
                    oemFinalStatus: 'OEM Final Status',
                    oemDelayedHours: 'OEM Delayed Hours'
                }
            ];
        } else {
            headers = [
                {
                    vehicleNo: 'Vehicle No.',
                    currVehicleStatus: 'Status',
                    loadingDate: 'Loading (Date / Time)',
                    vehicleExitDate: 'Vehicle Exit (Date / Time)',
                    consignorName: 'Consignor Name',
                    origin: 'Origin',
                    destination: 'Destination',
                    staticETA: 'Static ETA',
                    oemReachTime: 'Static ETA(OEM)',
                    locationTime: 'GPS (Date / Time)',
                    unloadingReachDate: 'Reach Date',
                    routeKM: 'Route (KM)',
                    runningKMs: 'KM Covered',
                    kmDifference: 'Difference (Km)',
                    location: 'Location',
                    estimatedArrivalDate: 'Estimated Arrival Date',
                    finalStatus: 'Final Status',
                    delayedHours: 'Delayed Hours'
                }
            ];
        };

        formattedData.unshift(headers[0]);

        const numberFormatter = (value) => {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const parsedDate = Date.parse(value, options);
            const dateTimeParts = value.split(' ');
            const datePart = dateTimeParts[0].split('/');
            const timePart = dateTimeParts.length > 1 ? dateTimeParts[1].split(':') : '';
            // console.log("value", dateTimeParts);

            if (typeof value === 'string' && !isNaN(Number(value))) {
                return value === "" || value === null ? "" : Number(value); // Convert number-like strings to numbers
            }
            // if (typeof value === 'string' && dateTimeParts.length > 1 && timePart.length > 2) {
            //     // Assuming DD/MM/YYYY format
            //     const day = parseInt(datePart[0], 10);
            //     const month = parseInt(datePart[1], 10) - 1; // Months start at 0 (January = 0)
            //     const year = parseInt(datePart[2], 10);
            //     const hour = parseInt(timePart[0], 10);
            //     const minute = parseInt(timePart[1], 10);
            //     const second = parseInt(timePart[2], 10);

            //     // return value === "" || value === null ? ""  : new Date(year, month, day); // Create Date with time

            //     return value === "" || value === null ? "" : new Date(year, month, day, hour, minute, second); // Create Date with time
            // }

            return value;
        };

        // const test = formattedData.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, numberFormatter(value)])));
        // console.log("test", test);

        const worksheet = XLSX.utils.json_to_sheet(formattedData.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, numberFormatter(value)]))),
            {
                // colStyles: {
                //     2: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
                //     3: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
                //     7: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
                //     8: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
                //     9: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
                //     15: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
                // },
                skipHeader: true,
            });
        // const worksheet = XLSX.utils.json_to_sheet(formattedData, {
        //     skipHeader: true,
        // });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'trips_report');
        XLSX.writeFile(workbook, `trips_report.xlsx`);
    }

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
        option: (provided, state) => ({
            ...provided,
            fontSize: '0.9rem',
            background: state.isSelected ? '#09215f' : 'white',
            cursor: 'pointer'
        }),
    };

    return (
        <>
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
                        </>
                    ) : null
                }
            </Col>


            <Col sm={2}>
                {
                    selectedReportType[0]?.value === 'Trips Report' ? (
                        <>
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
                                    selectedOrigins.length === 0 && <div className='text-secondary w-100 text-center'>No Origin Selected</div>
                                }
                            </div>
                        </>
                    ) : null
                }
            </Col>

            <Col sm={1} className='d-flex justify-content-end align-items-start'>
                {
                    selectedFilters.length > 0 ? (
                        <Tooltip title="Export As PDF">
                            <Link>
                                <FaFileExcel className='ms-2 cursor-pointer fs-3 text-success' onClick={() => exportToExcel()} />
                                <BsFileEarmarkPdfFill className='ms-2 cursor-pointer fs-3' style={{ color: "#ed031b" }} onClick={exportToPDF} />
                                {/* <button onClick={() => exportToExcel()}>Excel</button> */}
                            </Link>
                        </Tooltip>
                    ) : null
                }
            </Col>
        </>
    );
};

export default TripsReport;
