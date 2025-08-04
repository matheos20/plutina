import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Outlet,useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../../components/Sidebar/Sidebar';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) {
        return <p>Chargement...</p>;
    }

    const role = user.role;

    return (
        <div className="d-flex">
            <Sidebar />

            <div style={{ flex: 1, padding: "20px", background: "#f9f9f9" }}>
                <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
                    Bonjour {user.nom} 👋
                </h1>

                {/* Ce Outlet est indispensable pour afficher Utilisateurs.js */}
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
