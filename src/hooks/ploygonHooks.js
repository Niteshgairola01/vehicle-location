import axios from "axios";
import { APIBase } from "../backend"

export const getPolygonCategories = async () => {
    const url = `${APIBase}:8375/getPolygonCategories`;
    const config = {
        methode: 'GET',
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
        methode: 'GET',
        url: url,
        header: {
            "Content-Type": "application/json"
        }
    };

    const response = await axios(config);
    return response;
};