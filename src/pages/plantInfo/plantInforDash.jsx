import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { getRunningTrips } from '../../hooks/tripsHooks';

const PlantInforDash = () => {

    // Maruti
    const [marutiMehsanaRunning, setMarutiMehsanaRunning] = useState(0);
    const [marutiManesarRunning, setMarutiManesarRunning] = useState(0);
    const [marutiBangaloreRunning, setMarutiBangaloreRunning] = useState(0);

    // Mahindra
    const [mahindraChakanRunning, setMahindraChakanRunning] = useState(0);
    const [mahindraHaridwarRunning, setMahindraHaridwarRunning] = useState(0);
    const [mahindraNasikRunning, setMahindraNasikRunning] = useState(0);

    // Tapukara
    const [hondaTapukaraRunning, setHondaTapukaraRunning] = useState(0);

    // Tata Motors
    const [tataRudrapurRunning, setTataRudrapurRunning] = useState(0);
    const [tataPuneRunning, setTataPuneRunning] = useState(0);
    const [tataSanandRunning, setTataSanandRunning] = useState(0);

    // Glovis
    const [glovisPenukondaRunning, setGlovisPenukondaRunning] = useState(0);
    const [glovisChennaiRunning, setGlovisChennaiRunning] = useState(0);

    // SKODA
    const [SKODAChakanRunning, setSKODAChakanRunning] = useState(0);

    // FCA
    const [fcaRanjangaonRunning, setFcaRanjanGaonRunning] = useState(0);
    
    // PCA
    const [pcaChennaiRunning, setPcaChennaiRunning] = useState(0);
    // Transystem
    const [tranSystmeMehsanaRunning, setTransystemMehsanaRunning] = useState(0);
    const [transytemBangaloreRunning, setTransystemBangaloreRunning] = useState(0);


    useEffect(() => {
        getRunningTrips().then(response => {
            if (response.status === 200) {
                const runningTrips = response?.data.filter(data => data?.tripStatus === 'Trip Running');

                // Maruti
                const marutiMehsana = runningTrips.filter(data => data?.origin.toLowerCase().includes('Mehsana'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiManesar = runningTrips.filter(data => data?.origin.toLowerCase().includes('manesar'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiGurgaon = runningTrips.filter(data => data?.origin.toLowerCase().includes('gurgaon'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));
                const marutiBangalore = runningTrips.filter(data => data?.origin.toLowerCase().includes('bangalore'.toLowerCase()) && data?.consignorName.toLowerCase().includes('maruti'.toLowerCase()));

                // Mahindra
                const mahindraChakan = runningTrips.filter(data => data?.origin.toLowerCase().includes('chakan'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraHaridwar = runningTrips.filter(data => data?.origin.toLowerCase().includes('haridwar'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));
                const mahindraNasik = runningTrips.filter(data => data?.origin.toLowerCase().includes('nasik'.toLowerCase()) && data?.consignorName.toLowerCase().includes('mahindra'.toLowerCase()));

                // Tapukara
                const hondaTapukara = runningTrips.filter(data => data?.origin.toLowerCase().includes('tapukara'.toLowerCase()) && data?.consignorName.toLowerCase().includes('honda'.toLowerCase()));

                // Tata Motots
                const tataRudrapur = runningTrips.filter(data => data?.origin.toLowerCase().includes('rudrapur'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataPune = runningTrips.filter(data => data?.origin.toLowerCase().includes('pune'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));
                const tataSanand = runningTrips.filter(data => data?.origin.toLowerCase().includes('sanand'.toLowerCase()) && data?.consignorName.toLowerCase().includes('tata'.toLowerCase()));

                // Glovis
                const glovisPenukonda = runningTrips.filter(data => data?.origin.toLowerCase().includes('penukonda'.toLowerCase()) && data?.consignorName.toLowerCase().includes('glovis'.toLowerCase()));
                const glovisChennai = runningTrips.filter(data => data?.origin.toLowerCase().includes('chennai'.toLowerCase()) && data?.consignorName.toLowerCase().includes('glovis'.toLowerCase()));

                // SKODA
                const SKODAChakan = runningTrips.filter(data => data?.origin.toLowerCase().includes('chakan'.toLowerCase()) && data?.consignorName.toLowerCase().includes('skoda'.toLowerCase()));

                // FCA
                const fcaRanjangaon = runningTrips.filter(data => data?.origin.toLowerCase().includes('ranjangaon'.toLowerCase()) && data?.consignorName.toLowerCase().includes('fca'.toLowerCase()));
                
                // PCA
                const pcaChennai = runningTrips.filter(data => data?.origin.toLowerCase().includes('chennai'.toLowerCase()) && data?.consignorName.toLowerCase().includes('pca'.toLowerCase()));
                
                // Transystem
                const transystemMehsana = runningTrips.filter(data => data?.origin.toLowerCase().includes('mehsana'.toLowerCase()) && data?.consignorName.toLowerCase().includes('transystem'.toLowerCase()));
                const transystemBangalore = runningTrips.filter(data => data?.origin.toLowerCase().includes('bangalore'.toLowerCase()) && data?.consignorName.toLowerCase().includes('transystem'.toLowerCase()));


                // maruti
                setMarutiMehsanaRunning(marutiMehsana.length);
                setMarutiManesarRunning(marutiManesar.length + marutiGurgaon.length);
                setMarutiBangaloreRunning(marutiBangalore.length);

                // Mahindra
                setMahindraChakanRunning(mahindraChakan.length);
                setMahindraHaridwarRunning(mahindraHaridwar.length);
                setMahindraNasikRunning(mahindraNasik.length);

                // Tapukara
                setHondaTapukaraRunning(hondaTapukara.length);

                // Tata Motors
                setTataRudrapurRunning(tataRudrapur.length);
                setTataPuneRunning(tataPune.length);
                setTataSanandRunning(tataSanand.length);

                // Glovis
                setGlovisPenukondaRunning(glovisPenukonda.length);
                setGlovisChennaiRunning(glovisChennai.length);

                // SKODA
                setSKODAChakanRunning(SKODAChakan.length);

                // FCA
                setFcaRanjanGaonRunning(fcaRanjangaon.length);
                
                // PCA
                setPcaChennaiRunning(pcaChennai.length);
                
                // Transystem
                setTransystemMehsanaRunning(transystemMehsana.length);
                setTransystemBangaloreRunning(transystemBangalore.length);

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
                <Card className='table-responsive'>
                    <table className='table w-100 position-relative table-striped' style={{ overflowX: "hidden", overflowY: "scroll", maxHeight: "1rem" }}>
                        <thead style={{ zIndex: 1, position: "sticky", top: 0 }}>
                            <tr className='text-white'>
                                <th className=''></th>
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
                </Card>
            </div>
        </div >
    )
}

export default PlantInforDash
