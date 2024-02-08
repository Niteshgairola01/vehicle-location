import React from 'react'
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import { truck } from '../assets/images';

const VehicleLocation = () => {

    const key = "AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y";
    // const key = "ABC";

    const location = useLocation();
    const form = location.state;

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    const center = {
        lat: parseFloat(form?.lattitude),
        lng: parseFloat(form?.longitude),
    };
    
    return (
        <div style={{ height: "92vh", width: "100vw" }}>
            <LoadScript googleMapsApiKey={key}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={11}
                >
                    <MarkerF
                        // icon={image}
                        position={center} />
                </GoogleMap>
            </LoadScript>
        </div>
    )
}

export default VehicleLocation
