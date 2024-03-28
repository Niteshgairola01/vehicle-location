import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Col, Form } from 'react-bootstrap';
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

const TripsReport = ({ reportType, selectedReportType }) => {

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

    const today = new Date();

    let currentDay = new Date(today.setHours(0, 0, 0, 0));

    let date = new Date(today);
    date.setDate(date.getDate(23, 59, 59, 0));

    const twoDaysAfter = new Date(today);
    twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

    const tommorrow = new Date(today.setHours(23, 59, 59, 0));
    tommorrow.setDate(tommorrow.getDate() + 1);

    const tripsFilteredByOEM = finalTrips.length > 0 ? ((selectedOEMs.length === 0 || selectedOEMs.includes(undefined)) ? finalTrips : finalTrips.filter(item => {
        const consignorLowerCase = item.consignorName.toLowerCase();
        return selectedOEMs.some(consignor => consignor.toLowerCase() === consignorLowerCase) && item;
    })) : [];

    const filteredOEMTrips = tripsFilteredByOEM.length > 0 ? ((selectedOrigins.length === 0 || selectedOrigins.includes(undefined)) ? tripsFilteredByOEM : tripsFilteredByOEM.filter(item => {
        const originLowerCase = item.origin.toLowerCase();
        return selectedOrigins.some(consignor => consignor.toLowerCase() === originLowerCase) && item;
    })) : [];

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
            setExcelAttributes(['vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'consignorName', 'dealerName', 'origin', 'destination', 'oemReachTime', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'last10HoursKms', 'location', 'estimatedArrivalDate', 'oemFinalStatus', 'oemDelayedHours'
            ]);
        } else {
            setExcelAttributes(['vehicleNo', 'currVehicleStatus', 'loadingDate', 'vehicleExitDate', 'consignorName', 'dealerName', 'origin', 'destination', 'staticETA', 'oemReachTime', 'locationTime', 'unloadingReachDate', 'routeKM', 'runningKMs',
                'kmDifference', 'last10HoursKms', 'location', 'estimatedArrivalDate', 'finalStatus', 'delayedHours'
            ]);
        }
    }, [selectedFilters]);

    const allFilters = ['Early', 'On Time', 'Late', 'Nominal Delayed', 'Critical Delayed', 'On Time & Early (As per OEM)', 'Delayed (As per OEM)'];

    const sortByValue = (data) => {
        data.sort((a, b) => {
            const valueA = parseInt(a?.delayedHours);
            const valueB = parseInt(b?.delayedHours);

            return valueB - valueA;
        });

        return data;
    };

    const sortByOEMValue = (data) => {
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
        const getLateCounts = (allTrips, oem) => {
            const delayedTrips = allTrips.filter((data) => data?.tripStatus === 'Trip Running' && data?.finalStatus === 'Delayed');
            const lateTrips = oem ? delayedTrips.filter((data) => ((data?.oemReachTime !== null && data?.oemReachTime !== "") && new Date(formatStaticETADate(data?.oemReachTime)) < currentDay))
                : delayedTrips.filter((data) => ((data?.staticETA !== null && data?.staticETA !== "") && new Date(formatStaticETADate(data?.staticETA)) < currentDay));

            return lateTrips;
        };

        const getDelayedCounts = (allTrips, type, oem) => {
            const delayedTrips = allTrips.filter((data) => data?.tripStatus === 'Trip Running' && data?.finalStatus === 'Delayed');
            const todayTrips = oem ? delayedTrips.filter((data) => ((data?.oemReachTime !== null && data?.oemReachTime !== "") && (new Date(formatStaticETADate(data?.oemReachTime)) > currentDay) && (new Date(formatStaticETADate(data?.oemReachTime)) < twoDaysAfter)))
                : delayedTrips.filter((data) => ((data?.staticETA !== null && data?.staticETA !== "") && (new Date(formatStaticETADate(data?.staticETA)) > currentDay) && (new Date(formatStaticETADate(data?.staticETA)) < twoDaysAfter)));

            const upcomingTrips = oem ? delayedTrips.filter((data) => ((data?.oemReachTime !== null && data?.oemReachTime !== "") && (new Date(formatStaticETADate(data?.oemReachTime)) > twoDaysAfter)))
                : delayedTrips.filter((data) => ((data?.staticETA !== null && data?.staticETA !== "") && (new Date(formatStaticETADate(data?.staticETA)) > twoDaysAfter)));

            let staticDelayeds = [];

            todayTrips.forEach(data => {
                const delayedHours = oem ? parseFloat(data?.oemDelayedHours) : parseFloat(data?.delayedHours);

                if (type === 'Nominal') (delayedHours >= 0 && delayedHours <= 5) && staticDelayeds.push(data)
                else (delayedHours > 5) && staticDelayeds.push(data);
            });

            upcomingTrips.forEach(data => {
                const delayedHours = oem ? parseFloat(data?.oemDelayedHours) : parseFloat(data?.delayedHours);
                if (type === 'Nominal') (delayedHours >= 0 && delayedHours <= 18) && staticDelayeds.push(data);
                else (delayedHours > 18) && staticDelayeds.push(data)
            });

            return staticDelayeds;
        };

        if (selectedFilters.includes('Delayed (As per OEM)')) {
            const lateTrips = getLateCounts(filteredTrips, true);
            const nominalTrips = getDelayedCounts(filteredTrips, 'Nominal', true);
            const criticalTrips = getDelayedCounts(filteredTrips, 'Critical', true);

            const sortedLateTrips = sortByOEMValue(lateTrips);
            const sortedNominalTrips = sortByOEMValue(nominalTrips);
            const sortedCriticalTrips = sortByOEMValue(criticalTrips);

            let nonDelayed = filteredTrips.filter(data => data?.finalStatus === 'On Time' || data?.finalStatus === 'Early');

            setFinalTrips([...sortedLateTrips, ...sortedCriticalTrips, ...sortedNominalTrips, ...nonDelayed]);
        } else {
            const lateTrips = getLateCounts(filteredTrips, false);
            const nominalTrips = getDelayedCounts(filteredTrips, 'Nominal', false);
            const criticalTrips = getDelayedCounts(filteredTrips, 'Critical', false);

            const sortedLateTrips = sortByValue(lateTrips);
            const sortedNominalTrips = sortByValue(nominalTrips);
            const sortedCriticalTrips = sortByValue(criticalTrips);

            let nonDelayed = filteredTrips.filter(data => data?.finalStatus === 'On Time' || data?.finalStatus === 'Early');

            setFinalTrips([...sortedLateTrips, ...sortedCriticalTrips, ...sortedNominalTrips, ...nonDelayed]);
        }
    }, [filteredTrips, selectedFilters]);

    const handleSelectOEM = (oem) => {
        setSelectedOEM(oem);

        if (oem?.value !== undefined && !selectedOEMs.includes(oem?.value)) {
            oem?.value !== undefined && setSelectedOEMs([...selectedOEMs, oem?.value])
        } else if (selectedOEMs.includes(oem?.value)) {
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

                if (selectedFilters.includes('10 Hrs On Time Report')) {
                    tripsFilteredByTripStatus = allTrips.filter(data => data?.tripStatus === 'Trip Running' && data?.tripLogNo !== '' && data?.reachPointName === '' && (data?.unloadingReachDate === null || data?.unloadingReachDate === "") && (parseInt(data?.last10HoursKms) < 30) && (data?.finalStatus === "On Time" || data?.finalStatus === 'Early'));
                } else {
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

                        if (selectedFilters.includes("On Time & Early (As per OEM)") || selectedFilters.includes("Delayed (As per OEM)") || selectedFilters.includes('Late') || selectedFilters.includes('Nominal Delayed') || selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed') || selectedFilters.includes('Early') || selectedFilters.includes('On Time')) {
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
                                (selectedFilters.includes('Late') || selectedFilters.includes('Nominal Delayed') || selectedFilters.includes('Mild Delayed') || selectedFilters.includes('Moderate Delayed') || selectedFilters.includes('Critical Delayed')) &&
                                (!selectedFilters.includes('On Time & Early (As per OEM)') && !selectedFilters.includes('Delayed (As per OEM)'))
                            ) {
                                if (selectedFilters.includes('Late')) {
                                    const getLateTrips = (status) => {

                                        let delayedTrips = [];

                                        (status === 'included') ? delayedTrips = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed')
                                            : delayedTrips = allTrips.filter((data) => data?.finalStatus === 'Delayed');

                                        const lateTrips = delayedTrips.filter((data) => ((data?.staticETA !== null && data?.staticETA !== "") && new Date(formatStaticETADate(data?.staticETA)) < currentDay));

                                        lateTrips.forEach(data => finalStatusTrips.push(data));
                                    }

                                    if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                        getLateTrips('included');
                                    } else {
                                        getLateTrips('excluded');
                                    }
                                }

                                if (selectedFilters.includes('Nominal Delayed') || selectedFilters.includes('Critical Delayed')) {
                                    const getDelayedTrips = (status, type) => {
                                        let delayedTrips = [];

                                        (status === 'included') ? delayedTrips = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.finalStatus === 'Delayed')
                                            : delayedTrips = allTrips.filter((data) => data?.finalStatus === 'Delayed');

                                        const todayTrips = delayedTrips.filter((data) => ((data?.staticETA !== null && data?.staticETA !== "") && (new Date(formatStaticETADate(data?.staticETA)) > currentDay) && (new Date(formatStaticETADate(data?.staticETA)) < twoDaysAfter)))

                                        const upcomingTrips = delayedTrips.filter((data) => ((data?.staticETA !== null && data?.staticETA !== "") && (new Date(formatStaticETADate(data?.staticETA)) > twoDaysAfter)))

                                        let staticDelayeds = [];

                                        todayTrips.forEach(data => {
                                            const delayedHours = parseFloat(data?.delayedHours);
                                            if (type === 'Nominal') (delayedHours >= 0 && delayedHours <= 5) && staticDelayeds.push(data)
                                            else (delayedHours > 5) && staticDelayeds.push(data);
                                        });

                                        upcomingTrips.forEach(data => {
                                            const delayedHours = parseFloat(data?.delayedHours);
                                            if (type === 'Nominal') (delayedHours >= 0 && delayedHours <= 18) && staticDelayeds.push(data);
                                            else (delayedHours > 18) && staticDelayeds.push(data)
                                        });

                                        staticDelayeds.forEach(data => finalStatusTrips.push(data));
                                    };

                                    if (selectedFilters.includes('Trip running') || selectedFilters.includes('Trip Completed')) {
                                        selectedFilters.includes('Nominal Delayed') && getDelayedTrips('included', 'Nominal');
                                        selectedFilters.includes('Critical Delayed') && getDelayedTrips('included', 'Nominal');
                                    } else {
                                        selectedFilters.includes('Nominal Delayed') && getDelayedTrips('excluded', 'Nominal');
                                        selectedFilters.includes('Critical Delayed') && getDelayedTrips('excluded', 'Critical');
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

                                    } else if (selectedFilters.includes('On Time') || selectedFilters.includes('Early')) {
                                        let onTimeEarly = [];
                                        if (selectedFilters.includes('On Time')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                allTrips.forEach(data => {
                                                    const filtered = selectedFilters.includes(data?.tripStatus) && data?.oemFinalStatus === 'On Time';
                                                    if (filtered === true) {
                                                        onTimeEarly.push(data)
                                                    }
                                                });
                                            } else {
                                                allTrips.forEach(data => {
                                                    const filtered = data?.oemFinalStatus === 'On Time';
                                                    if (filtered === true) {
                                                        onTimeEarly.push(data)
                                                    }
                                                });
                                            }
                                        }

                                        if (selectedFilters.includes('Early')) {
                                            if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                                allTrips.forEach(data => {
                                                    const filtered = selectedFilters.includes(data?.tripStatus) && data?.oemFinalStatus === 'Early';
                                                    if (filtered === true) {
                                                        onTimeEarly.push(data)
                                                    }
                                                });
                                            } else {
                                                allTrips.forEach(data => {
                                                    const filtered = data?.oemFinalStatus === 'Early';
                                                    if (filtered === true) {
                                                        onTimeEarly.push(data)
                                                    }
                                                });
                                            }
                                        }

                                        finalStatusTrips = onTimeEarly;
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

                                    if (selectedFilters.includes('Delayed (As per OEM)') && selectedFilters.length <= 2) {
                                        if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                            const OEMDealyeds = allTrips.filter(data => selectedFilters.includes(data?.tripStatus) && data?.oemFinalStatus === 'Delayed');
                                            finalStatusTrips = OEMDealyeds;
                                        } else {
                                            const OEMDealyeds = allTrips.filter(data => data?.oemFinalStatus === 'Delayed');
                                            finalStatusTrips = OEMDealyeds;
                                        }
                                    }

                                    if (selectedFilters.includes('Late')) {

                                        const getLateTrips = (status) => {

                                            let delayedTrips = [];

                                            (status === 'included') ? delayedTrips = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.oemFinalStatus === 'Delayed')
                                                : delayedTrips = allTrips.filter((data) => data?.oemFinalStatus === 'Delayed');

                                            const lateTrips = delayedTrips.filter((data) => ((data?.oemReachTime !== null && data?.oemReachTime !== "") && new Date(formatStaticETADate(data?.oemReachTime)) < currentDay));
                                            lateTrips.forEach(data => finalStatusTrips.push(data));
                                        }

                                        if (selectedFilters.includes('Trip Running') || selectedFilters.includes('Trip Completed')) {
                                            getLateTrips('included');
                                        } else {
                                            getLateTrips('excluded');
                                        }
                                    }


                                    if (selectedFilters.includes('Nominal Delayed') || selectedFilters.includes('Critical Delayed')) {
                                        const getDelayedTrips = (status, type) => {
                                            let delayedTrips = [];

                                            (status === 'included') ? delayedTrips = allTrips.filter((data) => selectedFilters.includes(data?.tripStatus) && data?.oemFinalStatus === 'Delayed')
                                                : delayedTrips = allTrips.filter((data) => data?.oemFinalStatus === 'Delayed');

                                            const todayTrips = delayedTrips.filter((data) => ((data?.oemReachTime !== null && data?.oemReachTime !== "") && (new Date(formatStaticETADate(data?.oemReachTime)) > currentDay) && (new Date(formatStaticETADate(data?.oemReachTime)) < twoDaysAfter)))

                                            const upcomingTrips = delayedTrips.filter((data) => ((data?.oemReachTime !== null && data?.oemReachTime !== "") && (new Date(formatStaticETADate(data?.oemReachTime)) > twoDaysAfter)))

                                            let staticDelayeds = [];

                                            todayTrips.forEach(data => {
                                                const delayedHours = parseFloat(data?.oemDelayedHours);
                                                if (type === 'Nominal') (delayedHours >= 0 && delayedHours <= 5) && staticDelayeds.push(data)
                                                else (delayedHours > 5) && staticDelayeds.push(data);
                                            });

                                            upcomingTrips.forEach(data => {
                                                const delayedHours = parseFloat(data?.oemDelayedHours);
                                                if (type === 'Nominal') (delayedHours >= 0 && delayedHours <= 18) && staticDelayeds.push(data);
                                                else (delayedHours > 18) && staticDelayeds.push(data)
                                            });

                                            staticDelayeds.forEach(data => finalStatusTrips.push(data));
                                        };

                                        if (selectedFilters.includes('Trip running') || selectedFilters.includes('Trip Completed')) {
                                            selectedFilters.includes('Nominal Delayed') && getDelayedTrips('included', 'Nominal', true);
                                            selectedFilters.includes('Critical Delayed') && getDelayedTrips('included', 'Critical', true);
                                        } else {
                                            selectedFilters.includes('Nominal Delayed') && getDelayedTrips('excluded', 'Nominal', true);
                                            selectedFilters.includes('Critical Delayed') && getDelayedTrips('excluded', 'Critical', true);
                                        }
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
        if (givenDate === null || givenDate === "" || givenDate === undefined) {
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
        if (hours === null || hours === '' || hours === undefined) {
            return ''
        } else {
            const hoursArr = hours.split('.');
            return hoursArr[0];
        }
        // if (hours !== null && hours.length > 0 && hours === undefined) {
        // } else {
        // }
    };

    const convertTo24HourFormat = (timeString) => {
        if (timeString === null || timeString === undefined || timeString === '') {
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

    const getDelayedType = (attr, hours, eta) => {
        if (attr === 'On Time' || attr === "Early" || attr === "" || attr === " ") {
            return attr;
        } else if (attr === 'Delayed') {

            if (((eta !== null && eta !== "") && new Date(formatStaticETADate(eta)) < currentDay)) {
                return 'Late';
            } else {
                if (((eta !== null && eta !== "") && (new Date(formatStaticETADate(eta)) > currentDay) && (new Date(formatStaticETADate(eta)) < twoDaysAfter))) {
                    if (parseInt(hours) >= 0 && parseInt(hours) <= 5) {
                        return 'Nominal Delayed';
                    } else if (parseInt(hours) >= 6) {
                        return 'Critical Delayed';
                    }
                } else if (((eta !== null && eta !== "") && (new Date(formatStaticETADate(eta)) > twoDaysAfter))) {
                    if (parseInt(hours) >= 0 && parseInt(hours) <= 18) {
                        return 'Nominal Delayed';
                    } else if (parseInt(hours) >= 19) {
                        return 'Critical Delayed';
                    }
                }
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
                        formattedItem[attr] = getDelayedType(item[attr], item['delayedHours'], item['staticETA']);
                    }

                    if (attr === 'oemFinalStatus') {
                        formattedItem[attr] = getDelayedType(item[attr], item['oemDelayedHours'], item['oemReachTime']);
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

        if (filteredOEMTrips.length === 0) {
            ErrorToast('No data found');
        } else {
            doc.save('Trips-report.pdf');
        }
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
                    dealerName: 'Dealer Name',
                    origin: 'Origin',
                    destination: 'Destination',
                    oemReachTime: 'Static ETA(OEM)',
                    locationTime: 'GPS (Date / Time)',
                    unloadingReachDate: 'Reach Date',
                    routeKM: 'Route (KM)',
                    runningKMs: 'KM Covered',
                    kmDifference: 'Difference (Km)',
                    last10HoursKms: 'Last 10 hrs KM',
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
        };

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
                        <>
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
                        </>
                    ) : null
                }
            </Col>
        </>
    );
};

export default TripsReport;
