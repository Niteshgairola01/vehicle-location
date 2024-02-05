import { APIPort2 } from "../backend";
import axios from "axios";

export const getAllVehiclesList = async () => {
    const url = `${APIPort2}/getVehicleMaster`;
    const config = {
        url: url,
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};

export const getVehicleRoute = async (form) => {
    const url = `${APIPort2}/getVehicleRouteCoordinates`;
    const config = {
        url: url,
        method: 'POST',
        data: form,
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};