import React, { createContext, useState, useEffect,useContext  } from 'react';

// Création du contexte
export const AuthContext = createContext();

// Provider qui englobe l'app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Au chargement, on récupère user depuis localStorage (si connecté)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Fonction login : stocker user + localStorage
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Fonction logout : vider user + localStorage
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
