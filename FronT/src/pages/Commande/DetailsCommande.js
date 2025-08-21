// src/components/DetailsCommande/DetailsCommande.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../services/api';
import './DetailsCommande.css'; // Vous devrez créer ce fichier CSS

const DetailsCommande = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [commande, setCommande] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommande = async () => {
            try {
                const res = await axios.get(`/commandes/${id}`);
                setCommande(res.data);
            } catch (error) {
                console.error("Erreur lors du chargement de la commande :", error);
                // Gérer les erreurs (par exemple, afficher un message ou rediriger)
            } finally {
                setLoading(false);
            }
        };

        fetchCommande();
    }, [id]); // Dépendance à l'ID pour recharger si l'ID change

    if (loading) {
        return <p className="details-loading">⏳ Chargement des détails de la commande...</p>;
    }

    if (!commande) {
        return <p className="details-not-found">📭 Commande non trouvée.</p>;
    }

    // Calcul du total des produits (comme dans le composant Commande)
    const totalCommande = commande.produits.reduce((total, prod) => {
        const prix = parseFloat(prod.pivot.prix_unitaire);
        const quantite = parseFloat(prod.pivot.quantite);
        return total + (!isNaN(prix) && !isNaN(quantite) ? prix * quantite : 0);
    }, 0);

    return (
        <div className="details-container">
            <div className="details-header">
                <h2>Détails de la Commande #{commande.id}</h2>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>

            <div className="details-card">
                <div className="details-section">
                    <h3>Informations Générales</h3>
                    <p><strong>Client :</strong> {commande.client?.nom} {commande.client?.prenom}</p>
                    <p><strong>Période :</strong> {commande.debut_location} → {commande.fin_location}</p>
                    <p>
                        <strong>État :</strong>
                        <span className={`details-etat ${commande.etat.replace(' ', '-')}`}>
                            {commande.etat}
                        </span>
                    </p>
                </div>

                <div className="details-section">
                    <h3>Produits Commandés</h3>
                    <ul className="produits-list">
                        {commande.produits.map(prod => (
                            <li key={prod.id}>
                                <span>{prod.designation}</span>
                                <span>{prod.pivot.quantite} x {parseFloat(prod.pivot.prix_unitaire).toFixed(2)} €</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="details-total">
                    <strong>Prix total de la commande :</strong>
                    <span className="total-value">{totalCommande.toFixed(2)} €</span>
                </div>
            </div>
        </div>
    );
};

export default DetailsCommande;