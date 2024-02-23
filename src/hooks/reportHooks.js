import axios from "axios";
import { APIPort2 } from "../backend";

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
