import React, { useContext } from 'react';
import './TopHeader.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TopHeader = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleAuthChange = (e) => {
        const value = e.target.value;
        if (value === 'login' || value === 'register') {
            navigate(`/${value}`);
        } else if (value === 'logout') {
            logout();
            navigate('/');
        }
    };

    return (
        <div className="top-header">
            <div className="container-header">
                {/* Gauche */}
                <div className="left">
                    <span className="email-text">plutina@gmail.com</span>
                </div>

                {/* Centre */}
                <div className="center">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Rechercher un produit, une commande..."
                    />
                </div>

                {/* Droite */}
                <div className="right">
                    <select className="dropdown">
                        <option value="fr">FR</option>
                        <option value="en">EN</option>
                        <option value="ma">MA</option>
                    </select>

                    <select className="dropdown" onChange={handleAuthChange} defaultValue="">
                        {!user ? (
                            <>
                                <option value="" disabled>Compte</option>
                                <option value="login">Connexion</option>
                                <option value="register">Inscription</option>
                            </>
                        ) : (
                            <>
                                <option value="" disabled>
                                    Bonjour, {user?.prenom || user?.nom || 'Utilisateur'}
                                </option>
                                <option value="logout">Déconnexion</option>
                            </>
                        )}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TopHeader;
