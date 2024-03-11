import axios from "axios";
import { API, APIPort2 } from "../backend";

export const getHoursReports = async (runningVehicles) => {
    const url = `${APIPort2}/getLastVehicleRecords`;
    const config = {
        method: "POST",
        url,
        data: runningVehicles,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const getUnloadingReport = async () => {
    const url = `${API}/getAllTripLogs`;
    const config = {
        method: "GEt",
        url,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};
