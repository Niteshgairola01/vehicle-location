import { API } from "../backend";
import axios from "axios";

export const getRunningTrips = async () => {
    const url = `${API}/getVehiclesLatestTrip`;
    const config = {
        url: url,
        method: 'GET',
        mode: 'no-cors',
        headers: {
            "Content-Type": "application/json",
            "access-control-allow-origin": "*"
        },
    }

    const response = await axios(config);
    return response;
}