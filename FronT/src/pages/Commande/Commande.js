import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import './Commande.css';
import { useNavigate } from 'react-router-dom';

const Commande = () => {
    const [commandes, setCommandes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/commandes')
            .then(res => {
                setCommandes(res.data);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des commandes :", err);
            });
    }, []);

    const supprimerCommande = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette commande ?")) return;

        try {
            await axios.delete(`/commandes/${id}`);
            setCommandes(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Erreur suppression :", error);
        }
    };

    return (
        <div className="commandes-container">
            <h2 className="commandes-title">📦 Liste des Commandes</h2>

            <div className="commandes-grid">
                {commandes.map(commande => (
                    <div className="commande-card" key={commande.id}>
                        <div className="commande-header">
                            <h3>Commande #{commande.id}</h3>
                            <span className={`etat ${commande.etat.replace(' ', '-')}`}>{commande.etat}</span>
                        </div>
                        <p><strong>Client :</strong> {commande.client?.nom} {commande.client?.prenom}</p>
                        <p><strong>Période :</strong> {commande.debut_location} → {commande.fin_location}</p>
                        <p><strong>Prix total :</strong> <span className="prix">{commande.prix_total} €</span></p>

                        <div className="produits-section">
                            <strong>Produits :</strong>
                            <ul>
                                {commande.produits.map(prod => (
                                    <li key={prod.id}>
                                        {prod.nom} – {prod.pivot.quantite} x {prod.pivot.prix_unitaire} €
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Boutons d'action */}
                        <div className="commande-actions">
                            <button className="btn btn-view" onClick={() => alert("🟢 Voir détails pas encore implémenté")}>Voir détails</button>
                            <button className="btn btn-edit" onClick={() => navigate(`/dashboard/commandes/${commande.id}/edit`)}>Modifier</button>
                            <button className="btn btn-delete" onClick={() => supprimerCommande(commande.id)}>Supprimer</button>
                            <button className="btn btn-facture" onClick={() => alert("📄 Génération de facture en cours...")}>Générer PDF</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Commande;
