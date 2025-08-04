import React, { useState, useEffect } from 'react';
import './Register.css'; // css
 import api from "../../services/api";
import authApi from "../../services/authApi";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        adresse: '',
        email: '',
        password: '',
        id_type_client: '',
        role: 'client' // Si tu envoies ça côté backend
    });

    const [typesClients, setTypesClients] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Charger les types de client depuis API Laravel
        api.get('/types-clients')
            .then((res) => setTypesClients(res.data))
            .catch(() => setTypesClients([]));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await authApi.get('/sanctum/csrf-cookie'); // important pour Sanctum
            await authApi.post('/api/register', {
                ...formData,
                password_confirmation: formData.password, // Laravel veut ça
            });

            setSuccess("Inscription réussie !");
            setFormData({
                nom: '',
                prenom: '',
                adresse: '',
                email: '',
                password: '',
                id_type_client: '',
                role: 'client'
            });
        } catch (err) {
            console.log("Erreur Laravel :", err.response?.data);

            const resErrors = err.response?.data?.errors;
            if (resErrors) {
                const msg = Object.values(resErrors).flat().join(' ');
                setError(msg);
            } else {
                setError("Une erreur est survenue.");
            }
        }
    };
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate("/login");
            }, 2000); // 2 secondes d'attente avant redirection
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);
    return (
        <div className="register-content">
            <div className="text">Inscription</div>
            <form onSubmit={handleSubmit}>
                <div className="field">
                    <input type="text" name="nom" placeholder=" Nom" required value={formData.nom} onChange={handleChange} />
                </div>
                <div className="field">
                    <input type="text" name="prenom" placeholder=" Prenom" required value={formData.prenom} onChange={handleChange} />
                </div>
                <div className="field">
                    <input type="text" name="adresse" placeholder=" Adresse" required value={formData.adresse} onChange={handleChange} />
                </div>
                <div className="field">
                    <input type="email" name="email" placeholder=" Email" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="field">
                    <input type="password" name="password" placeholder=" Password" required value={formData.password} onChange={handleChange} />
                </div>

                <div className="field">
                    <select name="id_type_client" required value={formData.id_type_client} onChange={handleChange} style={{ color: '#666' }}>
                        <option value="">Sélectionnez Votre type</option>
                        {typesClients.map((type) => (
                            <option key={type.id} value={type.id}>{type.designation}</option>
                        ))}
                    </select>
                </div>

                <button type="submit">S'inscrire</button>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <div className="login-link">
                    Déjà membre ? <a href="/login">Se connecter</a>
                </div>
            </form>
        </div>
    );
};

export default Register;



