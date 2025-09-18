import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../Navbar/Navbar.css';
import { FaHome, FaBoxOpen, FaShoppingCart, FaFileInvoiceDollar, FaUser } from 'react-icons/fa';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="navbar-ogani">
            <div className="container-ogani">
                <div className="logo">
                    <Link to="/">Plutina</Link>
                </div>

                <nav className="menu">
                    <Link to="/"><FaHome /> Accueil</Link>
                    <Link to="/produits"><FaBoxOpen /> Produits</Link>

                    {user && (
                        <>
                            <Link to="/commandes"><FaShoppingCart /> Commandes</Link>
                            <Link to="/devis"><FaFileInvoiceDollar /> Devis</Link>
                            <Link to="/factures"><FaFileInvoiceDollar /> Factures</Link>
                        </>
                    )}

                    {user?.role === 'admin' && <Link to="/admin"><FaUser /> Admin</Link>}
                </nav>

                <div className="profile">
                    {user ? (
                        <>
                            <span style={{ marginRight: '10px' }}>Bonjour, {user.nom}</span>
                            <Link to="/profil" className="btn-profil">Profil</Link>
                            <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                        </>
                    ) : (
                        <Link to="/login">Connexion</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
