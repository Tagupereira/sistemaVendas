import { API_URL } from "./api.js";

export async function pingAPI(){

    try {

        const response =
            await fetch(
                `${API_URL}?action=ping`
            );
            
        return response;

    } catch {

        return false;

    }

}