import axios from "axios";
import { API } from "../backend"

export const singInUser = async (form) => {
    const url = `${API}`;
    const config = {
        method: "POST",
        url,
        data: form,
        headers: {
            "Content-Type": "application/josn",
        },
    };

    const response = await axios(config);
    return response;
}