import { APIPort2 } from "../backend";
import axios from "axios";

export const getAllOfficesList = async () => {
    const url = `${APIPort2}/getOfficeMaster`;
    const config = {
        url: url,
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};