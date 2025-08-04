import React, { useState, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // ✅ AJOUT

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await axios.get("http://127.0.0.1:8000/sanctum/csrf-cookie", {
                withCredentials: true,
            });

            const res = await api.post("/login", {
                email: formData.email,
                password: formData.password,
            });

            login(res.data.user); // stocke user
            localStorage.setItem('token', res.data.token);
            setSuccess("Connexion réussie !");
            navigate("/dashboard");

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Erreur serveur");
            } else {
                setError("Erreur de connexion au serveur");
            }
        }
    };


    return (
        <div className="register-content">
            <h2>Connexion</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="field">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                </div>
                <div className="field">
                <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                </div>
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
};

export default Login;
