import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import './Commande.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importation correcte de la fonction autoTable

const Commande = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/commandes')
            .then(res => {
                setCommandes(res.data);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des commandes :", err);
            })
            .finally(() => {
                setLoading(false);
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

    const genererPDF = (commandeId) => {
        const commande = commandes.find(c => c.id === commandeId);
        if (!commande) {
            alert("Commande non trouvée !");
            return;
        }

        const doc = new jsPDF();
        const startY = 20;

        doc.setFontSize(22);
        doc.text("Facture de commande", 105, startY, null, null, "center");

        doc.setFontSize(12);
        doc.text(`Numéro de commande: #${commande.id}`, 14, startY + 15);
        doc.text(`Date de début de location: ${commande.debut_location}`, 14, startY + 22);
        doc.text(`Date de fin de location: ${commande.fin_location}`, 14, startY + 29);

        doc.text(`Client: ${commande.client?.nom} ${commande.client?.prenom}`, 14, startY + 40);
        doc.text(`État: ${commande.etat}`, 14, startY + 47);

        doc.setLineWidth(0.5);
        doc.line(14, startY + 55, 196, startY + 55);

        const tableColumn = ["Produit", "Quantité", "Prix unitaire (€)", "Total (€)"];
        const tableRows = [];

        let totalGeneral = 0;
        commande.produits.forEach(produit => {
            const prixUnitaire = parseFloat(produit.pivot.prix_unitaire);
            const quantite = parseFloat(produit.pivot.quantite);

            const totalLigne = !isNaN(prixUnitaire) && !isNaN(quantite) ? prixUnitaire * quantite : 0;
            totalGeneral += totalLigne;

            const produitData = [
                produit.designation,
                !isNaN(quantite) ? quantite : 0,
                !isNaN(prixUnitaire) ? prixUnitaire.toFixed(2) : "0.00",
                totalLigne.toFixed(2),
            ];
            tableRows.push(produitData);
        });

        // Modification de l'appel de la fonction autoTable
        autoTable(doc, {
            startY: startY + 60,
            head: [tableColumn], // L'en-tête doit être un tableau de tableaux
            body: tableRows,
            styles: {
                fontSize: 10,
                cellPadding: 3,
                valign: 'middle',
            },
            headStyles: {
                fillColor: [52, 73, 94],
                textColor: 255,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            margin: {
                left: 14,
                right: 14
            },
        });

        // Récupérer la position Y après l'exécution de autoTable
        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Prix total de la commande: ${totalGeneral.toFixed(2)} €`, 196, finalY + 15, null, null, "right");

        doc.save(`facture_commande_${commandeId}.pdf`);
    };

    if (loading) {
        return <p className="loading-message">⏳ Chargement des commandes...</p>;
    }

    if (commandes.length === 0) {
        return <p className="empty-message">📭 Aucune commande trouvée.</p>;
    }

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
                        <p><strong>Prix total :</strong> <span className="prix">
                            {
                                commande.produits.reduce((total, prod) => {
                                    const prix = parseFloat(prod.pivot.prix_unitaire);
                                    const quantite = parseFloat(prod.pivot.quantite);
                                    return total + (!isNaN(prix) && !isNaN(quantite) ? prix * quantite : 0);
                                }, 0).toFixed(2)
                            } €
                        </span></p>

                        <div className="produits-section">
                            <strong>Produits :</strong>
                            <ul>
                                {commande.produits.map(prod => (
                                    <li key={prod.id}>
                                        {prod.designation} – {prod.pivot.quantite} x {prod.pivot.prix_unitaire} €
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="commande-actions">
                            <button
                                className="btn btn-view"
                                onClick={() => navigate(`/commandes/${commande.id}`)}
                            >
                                Voir détails
                            </button>
                            <button className="btn btn-edit" onClick={() => navigate(`/dashboard/commandes/${commande.id}/edit`)}>Modifier</button>
                            <button className="btn btn-delete" onClick={() => supprimerCommande(commande.id)}>Supprimer</button>
                            <button className="btn btn-facture" onClick={() => genererPDF(commande.id)}>Générer PDF</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Commande;