import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { getRunningTrips } from '../../hooks/tripsHooks';

const PlantInforDash = () => {

    // Maruti
    const [marutiMehsanaRunning, setMarutiMehsanaRunning] = useState(0);
    const [marutiManesarRunning, setMarutiManesarRunning] = useState(0);
    const [marutiBangaloreRunning, setMarutiBangaloreRunning] = useState(0);

    const [marutiMehsanaLoads, setMarutiMehsanaLoads] = useState(0);
    const [marutiManesarLoads, setMarutiManesarLoads] = useState(0);
    const [marutiBangaloreLoads, setMarutiBangaloreLoads] = useState(0);

    // Mahindra
    const [mahindraChakanRunning, setMahindraChakanRunning] = useState(0);
    const [mahindraHaridwarRunning, setMahindraHaridwarRunning] = useState(0);
    const [mahindraNasikRunning, setMahindraNasikRunning] = useState(0);

    const [mahindraChakanLoads, setMahindraChakanLoads] = useState(0);
    const [mahindraHaridwarLoads, setMahindraHaridwarLoads] = useState(0);
    const [mahindraNasikLoads, setMahindraNasikLoads] = useState(0);

    // Tapukara
    const [hondaTapukaraRunning, setHondaTapukaraRunning] = useState(0);
    const [hondaTapukaraLoads, setHondaTapukaraLoads] = useState(0);

    // Tata Motors
    const [tataRudrapurRunning, setTataRudrapurRunning] = useState(0);
    const [tataPuneRunning, setTataPuneRunning] = useState(0);
    const [tataSanandRunning, setTataSanandRunning] = useState(0);

    const [tataRudrapurLoads, setTataRudrapurLoads] = useState(0);
    const [tataPuneLoads, setTataPuneLoads] = useState(0);
    const [tataSanandLoads, setTataSanandLoads] = useState(0);

    // Glovis
    const [glovisPenukondaRunning, setGlovisPenukondaRunning] = useState(0);
    const [glovisChennaiRunning, setGlovisChennaiRunning] = useState(0);

    const [glovisPenukondaLoads, setGlovisPenukondaLoads] = useState(0);
    const [glovisChennaiLoads, setGlovisChennaiLoads] = useState(0);

    // SKODA
    const [SKODAChakanRunning, setSKODAChakanRunning] = useState(0);
    const [SKODAChakanLoads, setSKODAChakanLoads] = useState(0);

    // FCA
    const [fcaRanjangaonRunning, setFcaRanjanGaonRunning] = useState(0);
    const [fcaRanajngaoLoads, setFcaRanjanGaonLoads] = useState(0);

    // PCA
    const [pcaChennaiRunning, setPcaChennaiRunning] = useState(0);
    const [pcaChennaiLoads, setPcaChennaiLoads] = useState(0);

    // Transystem
    const [tranSystmeMehsanaRunning, setTransystemMehsanaRunning] = useState(0);
    const [transytemBangaloreRunning, setTransystemBangaloreRunning] = useState(0);

    const [tranSystemMehsanaLoads, setTransystemMehsanaLoads] = useState(0);
    const [transystemBanagaloreLoads, setTransystemBangaloreLoads] = useState(0);

    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    useEffect(() => {
        getRunningTrips().then(response => {
            if (response.status === 200) {
                const allTrips = response?.data;
                const runningTrips = response?.data.filter(data => data?.tripStatus === 'Trip Running');

                const isGreateThanFirstDay = (dateString) => {
                    const dateArr = dateString.split(' ');
                    const datePart = dateArr[0].split('/');
                    const day = datePart[0];
                    const month = datePart[1];
                    const year = datePart[2];

                    return `${year}-${month}-${day}`;
                };

                // Maruti
                const marutiMehsana = runningTrips.filter(data => data?.origin.toLowerCase().includes('Mehsana'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiManesar = runningTrips.filter(data => data?.origin.toLowerCase().includes('manesar'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiGurgaon = runningTrips.filter(data => data?.origin.toLowerCase().includes('gurgaon'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiBangalore = runningTrips.filter(data => data?.origin.toLowerCase().includes('bangalore'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));

                const marutiMehsanaTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('mehsana'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiMehsanaLoads = marutiMehsanaTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const marutiManesarTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('manesar'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiManesarLoads = marutiManesarTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const marutiGurgaonTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('gurgaon'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiGurgaonLoads = marutiGurgaonTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const marutiBangaloreTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('bangalore'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutibangaloreLoads = marutiBangaloreTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setMarutiMehsanaRunning(marutiMehsana.length);
                setMarutiManesarRunning(marutiManesar.length + marutiGurgaon.length);
                setMarutiBangaloreRunning(marutiBangalore.length);

                setMarutiMehsanaLoads(marutiMehsanaLoads.length);
                setMarutiManesarLoads(marutiManesarLoads.length + marutiGurgaonLoads.length);
                setMarutiBangaloreLoads(marutibangaloreLoads.length);

                // Mahindra
                const mahindraChakan = runningTrips.filter(data => data?.origin.toLowerCase().includes('chakan'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraHaridwar = runningTrips.filter(data => data?.origin.toLowerCase().includes('haridwar'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraNasik = runningTrips.filter(data => data?.origin.toLowerCase().includes('nasik'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));

                const mahindraChakanTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('chakan'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraChakanLoads = mahindraChakanTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const mahindraHaridwarTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('haridwar'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraHaridwarLoads = mahindraHaridwarTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const mahindraNasikTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('nasik'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraNasikLoads = mahindraNasikTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setMahindraChakanRunning(mahindraChakan.length);
                setMahindraHaridwarRunning(mahindraHaridwar.length);
                setMahindraNasikRunning(mahindraNasik.length);

                setMahindraChakanLoads(mahindraChakanLoads.length);
                setMahindraHaridwarLoads(mahindraHaridwarLoads.length);
                setMahindraNasikLoads(mahindraNasikLoads.length);

                // Honda
                const hondaTapukara = runningTrips.filter(data => data?.origin?.toLowerCase().includes('tapukara'.toLowerCase()) && data?.consignorName.toLowerCase().includes('honda'.toLowerCase()));
                const hondaTapukaraTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('tapukara'.toLowerCase()) && data?.consignorName.toLowerCase().includes('honda'.toLowerCase()));
                const hondaTapukaraLoads = hondaTapukaraTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setHondaTapukaraRunning(hondaTapukara.length);
                setHondaTapukaraLoads(hondaTapukaraLoads.length);

                // Tata Motots
                const tataRudrapur = runningTrips.filter(data => data?.origin?.toLowerCase().includes('rudrapur'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataPune = runningTrips.filter(data => data?.origin?.toLowerCase().includes('pune'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataSanand = runningTrips.filter(data => data?.origin?.toLowerCase().includes('sanand'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));

                const tataRudrapurTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('rudrapur'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataRudrapurLoads = tataRudrapurTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const tataPuneTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('pune'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataPuneLoads = tataPuneTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const tataSanandTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('sanand'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataSanandLoads = tataSanandTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setTataRudrapurRunning(tataRudrapur.length);
                setTataPuneRunning(tataPune.length);
                setTataSanandRunning(tataSanand.length);

                setTataRudrapurLoads(tataRudrapurLoads.length);
                setTataPuneLoads(tataPuneLoads.length);
                setTataSanandLoads(tataSanandLoads.length);

                // Glovis
                const glovisPenukonda = runningTrips.filter(data => data?.origin?.toLowerCase().includes('penukonda'.toLowerCase()) && data?.consignorName.toLowerCase().includes('glovis'.toLowerCase()));
                const glovisChennai = runningTrips.filter(data => data?.origin?.toLowerCase().includes('chennai'.toLowerCase()) && data?.consignorName.toLowerCase().includes('glovis'.toLowerCase()));

                const glovisPenukondaTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('penukonda'.toLowerCase()) && data?.consignorName.toLowerCase().includes('glovis'.toLowerCase()));
                const glovisPenukondaLoads = glovisPenukondaTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const glovisChennaiTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('chennai'.toLowerCase()) && data?.consignorName.toLowerCase().includes('glovis'.toLowerCase()));
                const glovisChennaiLoads = glovisChennaiTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setGlovisPenukondaRunning(glovisPenukonda.length);
                setGlovisChennaiRunning(glovisChennai.length);

                setGlovisPenukondaLoads(glovisPenukondaLoads.length);
                setGlovisChennaiLoads(glovisChennaiLoads.length);

                // SKODA
                const SKODAChakan = runningTrips.filter(data => data?.origin?.toLowerCase().includes('chakan'.toLowerCase()) && data?.consignorName.toLowerCase().includes('skoda'.toLowerCase()));
                const SKODAChakanTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('chakan'.toLowerCase()) && data?.consignorName.toLowerCase().includes('skoda'.toLowerCase()));
                const SKODAChakanLoads = SKODAChakanTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setSKODAChakanRunning(SKODAChakan.length);
                setSKODAChakanLoads(SKODAChakanLoads.length);

                // FCA
                const fcaRanjangaon = runningTrips.filter(data => data?.origin?.toLowerCase().includes('ranjangaon'.toLowerCase()) && data?.consignorName.toLowerCase().includes('fca'.toLowerCase()));
                const fcaRanjangaonTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('ranjangaon'.toLowerCase()) && data?.consignorName.toLowerCase().includes('fca'.toLowerCase()));
                const fcaRanjangaonLoads = fcaRanjangaonTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setFcaRanjanGaonRunning(fcaRanjangaon.length);
                setFcaRanjanGaonLoads(fcaRanjangaonLoads.length);

                // PCA
                const pcaChennai = runningTrips.filter(data => data?.origin?.toLowerCase().includes('chennai'.toLowerCase()) && data?.consignorName.toLowerCase().includes('pca'.toLowerCase()));
                const pcaChennaiTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('chennai'.toLowerCase()) && data?.consignorName.toLowerCase().includes('pca'.toLowerCase()));
                const pcaChennaiLoads = pcaChennaiTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setPcaChennaiRunning(pcaChennai.length);
                setPcaChennaiLoads(pcaChennaiLoads.length);

                // Transystem
                const transystemMehsana = runningTrips.filter(data => data?.origin?.toLowerCase().includes('mehsana'.toLowerCase()) && data?.consignorName.toLowerCase().includes('transystem'.toLowerCase()));
                const transystemBangalore = runningTrips.filter(data => data?.origin?.toLowerCase().includes('bangalore'.toLowerCase()) && data?.consignorName.toLowerCase().includes('transystem'.toLowerCase()));
                const transystemMehsanaTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('mehsana'.toLowerCase()) && data?.consignorName.toLowerCase().includes('transystem'.toLowerCase()));
                const tranSystemMehsanaLoads = transystemMehsanaTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));
                const transystemBangaloreTrips = allTrips.filter(data => data?.origin?.toLowerCase().includes('bangalore'.toLowerCase()) && data?.consignorName.toLowerCase().includes('transystem'.toLowerCase()));
                const transystemBangaloreLoads = transystemBangaloreTrips.filter(data => (data?.loadingDate !== null && data?.loadingDate !== "") && (new Date(isGreateThanFirstDay(data?.loadingDate)) > firstDay));

                setTransystemMehsanaRunning(transystemMehsana.length);
                setTransystemBangaloreRunning(transystemBangalore.length);

                setTransystemMehsanaLoads(tranSystemMehsanaLoads.length);
                setTransystemBangaloreLoads(transystemBangaloreLoads.length);

            } else {
                setMarutiMehsanaRunning(0);
                setMarutiManesarRunning(0);
                setMarutiBangaloreRunning(0);
            }
        }).catch(err => {
            setMarutiMehsanaRunning(0);
            setMarutiManesarRunning(0);
            setMarutiBangaloreRunning(0);

            console.log(err);
        })
    }, []);

    const runnings = [
        marutiMehsanaRunning, marutiManesarRunning, marutiBangaloreRunning, mahindraChakanRunning, mahindraHaridwarRunning, mahindraNasikRunning,
        hondaTapukaraRunning, tataRudrapurRunning, tataPuneRunning, tataSanandRunning, glovisPenukondaRunning, glovisChennaiRunning,
        SKODAChakanRunning, fcaRanjangaonRunning, pcaChennaiRunning, tranSystmeMehsanaRunning, transytemBangaloreRunning
    ];

    const loads = [
        marutiMehsanaLoads, marutiManesarLoads, marutiBangaloreLoads, mahindraChakanLoads, mahindraHaridwarLoads, mahindraNasikLoads,
        hondaTapukaraLoads, tataRudrapurLoads, tataPuneLoads, tataSanandLoads, glovisPenukondaLoads, glovisChennaiLoads,
        SKODAChakanLoads, fcaRanajngaoLoads, pcaChennaiLoads, tranSystemMehsanaLoads, transystemBanagaloreLoads
    ];

    const plants = [
        "Maruti- Mehsana", "Maruti- Gurgaon", "Maruti- Bangalore", "Mahindra- Chakan", "Mahindra- Haridwar", "Mahindra- Nasik", "Honda- Tapukara", "Tata Motors Lmited- Rudrapur", "Tata Motors pv ltd- Pune",
        "Tata Motors pv ltd- Sanand", "Glovis Anantpura- Penukonda", "Glovis- Chennai", "SKODA- Chakan", "FCA- Ranjangaon", "PCA- Chennai", "Transystem- Mehsana", "Transystem- Bangalore",
    ];

    return (
        <div className='thm-dark m-0 p-0 py-5 px-3 pt-3'>
            <Card>
                <div className='w-100 d-flex justify-content-between align-items-center'>
                    <h5 className='m-0 p-0'>Plant Info Dashboard</h5>
                </div>
            </Card>
            <div className='p-0 container-fluid'>
                <Card>
                    <div className='table-responsive'>
                        <table className='table w-100 position-relative table-striped' style={{ overflowX: "hidden", overflowY: "scroll", maxHeight: "1rem" }}>
                            <thead style={{ zIndex: 1, position: "sticky", top: 0 }}>
                                <tr className='text-white'>
                                    <th className=''>Test</th>
                                    {plants.map(data => <th className='text-nowrap' key={data}>{data}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='fw-bold thm-green'>R</td>
                                    {runnings.map((data, index) => <td className='text-nowrap ps-4' key={index}>{data}</td>)}
                                </tr>
                                <tr>
                                    <td className='text-danger'>W</td>
                                    {plants.map(data => <td className='text-nowrap ps-4' key={data}>0</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Month Loads History */}
            <div className='p-0 container-fluid'>
                <Card>
                    <h6>This Months Loads:</h6>
                    <div className='table-responsive'>
                        <table className='table w-100 position-relative table-striped' style={{ overflowX: "hidden", overflowY: "scroll", maxHeight: "1rem" }}>
                            <thead style={{ zIndex: 1, position: "sticky", top: 0 }}>
                                <tr className='text-white'>
                                    {plants.map(data => <th className='text-nowrap' key={data}>{data}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {loads.map((data, index) => <td className='text-nowrap ps-4' key={index}>{data}</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div >
    )
}

export default PlantInforDash
