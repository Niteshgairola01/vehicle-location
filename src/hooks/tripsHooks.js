import { API, APIBase } from "../backend";
import axios from "axios";

export const getRunningTrips = async () => {
    const url = `${API}/getVehiclesLatestTrip`;
    const config = {
        url: url,
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const forceCompleteTrip = async (form) => {
    const url = `${APIBase}:9065/forceCompleteTrip`;
    const config = {
        url: url,
        method: 'POST',
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const deleteVehicleOnTripComplete = async (form) => {
    const url = `${APIBase}:9060/deleteVehicleOnTripComplete`;
    const config = {
        url: url,
        method: 'POST',
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};