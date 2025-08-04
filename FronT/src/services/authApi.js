import axios from "axios";

const authApi = axios.create({
    baseURL: "http://127.0.0.1:8000", // ✅ Pour la route csrf-cookie
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

export default authApi;
