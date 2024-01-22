import axios from "axios";
import { APIBase } from "../backend"

export const getPolygonCategories = async () => {
    const url = `${APIBase}:8375/getPolygonCategories`;
    const config = {
        method: 'GET',
        url: url,
        header: {
            "Content-Type": "application/json"
        }
    };

    const response = await axios(config);
    return response;
};

export const getAllPolygonAreas = async () => {
    const url = `${APIBase}:8375/getAllPolygonAreas`;
    const config = {
        method: 'GET',
        url: url,
        header: {
            "Content-Type": "application/json"
        }
    };

    const response = await axios(config);
    return response;
};

export const createNewPolygonArea = async (form) => {
    const url = `${APIBase}:8375/storePolygonAreas`;
    const config = {
        method: 'POST',
        url: url,
        data: [form],
        header: {
            "Content-Type": "application/json"
        }
    };

    const response = await axios(config);
    return response;
};

export const updatePolygonArea = async (form) => {
    const url = `${APIBase}:8375/editPolygonArea`;
    const config = {
        method: 'PUT',
        url: url,
        data: form,
        header: {
            "Content-Type": "application/json"
        }
    };

    const response = await axios(config);
    return response;
};