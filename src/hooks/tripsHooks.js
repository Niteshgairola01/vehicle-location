import { API, APIBase } from "../backend";
import axios from "axios";

export const getRunningTrips = async () => {
    const url = `${API}/getVehiclesLatestTrip`;
    const config = {
        url: url,
        method: 'GET',
        mode: 'no-cors',
        headers: {
            "Content-Type": "application/json",
        },
    }

    const response = await axios(config);
    return response;
};

export const forceCompleteTrip = async ({ form }) => {
    const url = `${APIBase}:9065/forceCompleteTrip`;
    const config = {
        url: url,
        method: 'POST',
        mode: 'no-cors',
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    }

    const response = await axios(config);
    return response;
};