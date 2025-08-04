import React, { useContext } from 'react';
import { Link,useNavigate  } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../Navbar/Navbar.css';


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
                    <Link to="/">Accueil</Link>
                    <Link to="/produits">Produits</Link>
                    {user && (
                        <>
                    <Link to="/commandes">Commandes</Link>
                    <Link to="/devis">Devis</Link>
                    <Link to="/factures">Factures</Link>
                        </>
                    )}
                    {/*{isAdmin && <Link to="/admin">Admin</Link>}*/}
                    {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
                </nav>

                <div className="profile">
                    {user ? (
                        <>
                            <Link to="/profil">{user.nom || "Profil"}</Link>
                            <span style={{ marginRight: '10px' }}> Bonjour, {user.nom}</span>
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
