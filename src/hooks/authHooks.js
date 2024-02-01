import axios from "axios";
import { API, authBase } from "../backend"

export const singInUser = async (form) => {
    const url = `${authBase}/loginUser`;
    const config = {
        method: "POST",
        url,
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const signOutUser = async (form) => {
    const url = `${authBase}/logoutUser`;
    const config = {
        method: "POST",
        url,
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const autoSignOutUser = async (form) => {
    const url = `${authBase}/storeBrowserCloseTime`;
    const config = {
        method: "POST",
        url,
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const createNewUser = async (form) => {
    const url = `${authBase}/createUser`;
    const config = {
        method: "POST",
        url,
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const updateUser = async (form) => {
    console.log("form", form);
    const url = `${authBase}/updateUserData`;
    const config = {
        method: "PUT",
        url,
        data: form,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const getUsersList = async () => {
    const url = `${authBase}/getAllUsers`;
    const config = {
        method: "GET",
        url,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};

export const getUserId = async () => {
    const url = `${authBase}`;
    const config = {
        method: "GET",
        url,
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await axios(config);
    return response;
};