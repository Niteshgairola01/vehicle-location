import { APIPort2 } from "../backend";
import axios from "axios";

export const getAllDrivers = async () => {
    const url = `${APIPort2}/getAllDriversData`;
    const config = {
        url: url,
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};


export const createDriver = async (form) => {
    const url = `${APIPort2}/createNewDriver`;
    const config = {
        url: url,
        method: 'POST',
        data: form,
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};

export const updateDriver = async (form) => {
    const url = `${APIPort2}/updateDriverData`;
    const config = {
        url: url,
        method: 'PUT',
        data: form,
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};


// Mapping

export const getAllMappings = async () => {
    const url = `${APIPort2}/getAllMappings`;
    const config = {
        url: url,
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};

export const getAvailableOptionForDriver = async (form) => {
    const url = `${APIPort2}/getAvailableOptionForDriver`;
    const config = {
        url: url,
        method: 'POST',
        data: form,
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};

export const createNewMapping = async (form) => {
    const url = `${APIPort2}/createNewMapping`;
    const config = {
        url: url,
        method: 'POST',
        data: form,
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};

export const updateMapping = async (form) => {
    const url = `${APIPort2}/updateMapping`;
    const config = {
        url: url,
        method: 'PUT',
        data: form,
        headers: { "Content-Type": "application/json" },
    }

    const response = await axios(config);
    return response;
};
