import React from 'react'
import { Modal } from 'react-bootstrap'
import { GoogleMap, LoadScript, Marker, MarkerF } from '@react-google-maps/api';

const VehicleLocation = ({ show, setShow, vehicleData }) => {

    const mapContainerStyle = {
        width: '100%',
        height: '600px',
    };

    const center = {
        lat: parseFloat(vehicleData?.lattitude),
        lng: parseFloat(vehicleData?.longitude),
    };

    return (

        <Modal show={show} centered onHide={() => setShow(false)} size='xl' style={{minHeight: '80vh'}}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h5 className='thm-dark'>vehicle Location</h5>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: "60vh" }}>
                <LoadScript googleMapsApiKey="AIzaSyD1gPg5Dt7z6LGz2OFUhAcKahh_1O9Cy4Y">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={11}
                    >
                        <MarkerF position={center} />
                    </GoogleMap>
                </LoadScript>
            </Modal.Body>
        </Modal>
    )
}

export default VehicleLocation
