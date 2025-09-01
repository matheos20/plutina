import axios from 'axios';

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

// Interceptor pour ajouter le token à chaque requête si présent
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    console.log("🔐 TOKEN PRIS EN COMPTE ?", token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


// // 🔹 Créer un devis
// export const createDevis = async (data) => {
//     return api.post('/devis', data);
// };
//
// // 🔹 Récupérer tous les devis
// export const getDevis = async () => {
//     return api.get('/devis');
// };
//
// // Récupérer clients et produits pour le formulaire
// export const getDevisCreateData = async () => {
//     return api.get('/devis/create');
// };
//

export default api;

