// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth  } from '../../context/AuthContext';
import './Sidebar.css'; // tu peux styliser plus tard


const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="sidebar">
            <h3>Tableau de bord</h3>
            <nav>
                {user?.role === 'admin' && (
                    <>
                        <Link to="/dashboard/utilisateurs">👥 Utilisateurs</Link>
                        <Link to="/dashboard/produits">📦 Produits</Link>
                        <Link to="/dashboard/commandes">📋 Commandes</Link>
                        <Link to="/dashboard/devis">📝 Devis</Link>
                        <Link to="/dashboard/factures">💰 Factures</Link>
                        <Link to="/dashboard/statistiques">📊 Statistiques</Link>
                        <Link to="/dashboard/produits" className="nav-link">
                            <i className="bi bi-box-seam"></i> Produits
                        </Link>

                    </>
                )}
                {user?.role === 'receptionniste' && (
                    <>
                        <Link to="/dashboard/ajouter-commande">➕ Ajouter commande</Link>
                        <Link to="/dashboard/produits">📦 Produits</Link>
                        <Link to="/dashboard/clients">👤 Clients</Link>
                    </>
                )}
                {user?.role === 'client' && (
                    <>
                        <Link to="/dashboard/mes-produits">📦 Mes produits</Link>
                        <Link to="/dashboard/mes-commandes">📋 Mes commandes</Link>
                        <Link to="/dashboard/mes-devis">📝 Mes devis</Link>
                        <Link to="/dashboard/mes-factures">💰 Mes factures</Link>
                        <Link to="/dashboard/profil">👤 Mon profil</Link>
                        <Link to="/dashboard/assistance">📞 Assistance</Link>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;
