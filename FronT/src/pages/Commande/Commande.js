import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import './Commande.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from 'bootstrap';

const Commande = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null); // utilisateur connecté

    // États pour le formulaire d’ajout
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedProduits, setSelectedProduits] = useState([]);
    const [debut_location, setDebutLocation] = useState('');
    const [fin_location, setFinLocation] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    useEffect(() => {
        if (user && user.role === 'client') {
            setSelectedClient(user.id);
        }
    }, [user]);

    useEffect(() => {
        // Récupérer l'utilisateur connecté
        const fetchUser = async () => {
            try {
                const res = await axios.get('/user'); // endpoint pour l'utilisateur connecté
                setUser(res.data);
            } catch (err) {
                console.error("Erreur chargement utilisateur :", err);
            }
        };
        // Récupérer les commandes
        const fetchCommandes = async () => {
            try {
                const res = await axios.get('/commandes');
                setCommandes(res.data);
            } catch (err) {
                console.error("Erreur chargement commandes :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchCommandes();
        fetchClients();
        fetchProduits();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get('/clients');
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setClients(data);
        } catch (error) {
            console.error("Erreur chargement clients :", error);
        }
    };

    const fetchProduits = async () => {
        try {
            const res = await axios.get('/produits/all');
            const data = Array.isArray(res.data)
                ? res.data
                : (res.data && Array.isArray(res.data.data) ? res.data.data : []);
            setProduits(data);
        } catch (error) {
            console.error("Erreur chargement produits :", error);
        }
    };

    const handleProduitChange = (produitId, value) => {
        const quantite = parseInt(value, 10);
        setSelectedProduits(prev => {
            const existing = prev.find(p => p.id === produitId);
            const produitData = produits.find(p => p.id === produitId);
            let updatedProduits;

            if (quantite > 0) {
                if (existing) {
                    updatedProduits = prev.map(p =>
                        p.id === produitId ? { ...p, quantite: quantite } : p
                    );
                } else {
                    const nouveauProduit = {
                        id: produitId,
                        quantite: quantite,
                        prix_unitaire: produitData?.prix || 0,
                    };
                    updatedProduits = [...prev, nouveauProduit];
                }
            } else {
                updatedProduits = prev.filter(p => p.id !== produitId);
            }
            return updatedProduits;
        });
    };

    const calculTotalProduit = (quantite, prix_unitaire) => Number(quantite || 0) * Number(prix_unitaire || 0);

    const calculTotalCommande = () => {
        return selectedProduits.reduce((total, p) => {
            const produitOriginal = produits.find(prod => prod.id === p.id);
            const prixUnitaire = produitOriginal?.prix || 0;
            return total + calculTotalProduit(p.quantite, prixUnitaire);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            id_client: selectedClient,
            debut_location,
            fin_location,
            produits: selectedProduits
                .filter(p => Number(p.quantite) > 0)
                .map(p => {
                    const produitOriginal = produits.find(prod => prod.id === p.id);
                    return {
                        id: p.id,
                        quantite: parseInt(p.quantite, 10),
                        prix_unitaire: parseFloat(produitOriginal?.prix || 0),
                    };
                }),
        };

        try {
            const res = await axios.post('/commandes', payload);
            setCommandes(prev => [...prev, res.data.commande]);
            alert("Commande créée avec succès !");
            setShowModal(false);

            // Reset formulaire
            setSelectedClient('');
            setSelectedProduits([]);
            setDebutLocation('');
            setFinLocation('');
            setErrors({});
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                alert("Erreur : " + Object.values(error.response.data.errors).flat().join('\n'));
            } else {
                alert("Erreur inattendue");
                console.error(error);
            }
        }
    };

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
        if (!commande) return alert("Commande non trouvée !");

        const doc = new jsPDF();
        const startY = 20;

        doc.setFontSize(22);
        doc.text("Facture de commande", 105, startY, null, null, "center");

        doc.setFontSize(12);
        doc.text(`Numéro de commande: #${commande.id}`, 14, startY + 15);
        doc.text(`Date de début: ${commande.debut_location}`, 14, startY + 22);
        doc.text(`Date de fin: ${commande.fin_location}`, 14, startY + 29);
        doc.text(`Client: ${commande.client?.nom} ${commande.client?.prenom}`, 14, startY + 40);
        doc.text(`État: ${commande.etat}`, 14, startY + 47);

        autoTable(doc, {
            startY: startY + 60,
            head: [["Produit", "Quantité", "Prix unitaire (€)", "Total (€)"]],
            body: commande.produits.map(prod => {
                const prixUnitaire = parseFloat(prod.pivot.prix_unitaire);
                const quantite = parseFloat(prod.pivot.quantite);
                const totalLigne = !isNaN(prixUnitaire) && !isNaN(quantite) ? prixUnitaire * quantite : 0;
                return [
                    prod.designation,
                    quantite || 0,
                    prixUnitaire.toFixed(2),
                    totalLigne.toFixed(2),
                ];
            }),
        });

        const finalY = doc.lastAutoTable.finalY;
        const totalGeneral = commande.produits.reduce((total, prod) => {
            const prix = parseFloat(prod.pivot.prix_unitaire);
            const quantite = parseFloat(prod.pivot.quantite);
            return total + (!isNaN(prix) && !isNaN(quantite) ? prix * quantite : 0);
        }, 0);

        doc.text(`Prix total: ${totalGeneral.toFixed(2)} €`, 196, finalY + 15, null, null, "right");
        doc.save(`facture_commande_${commandeId}.pdf`);
    };

    if (loading) return <p>⏳ Chargement des commandes...</p>;

    return (
        <div className="commandes-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="commandes-title">📦 Liste des Commandes</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Ajouter une commande
                </button>
            </div>

            {/* Modal ajout commande */}
            {/* Modal ajout commande */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Ajouter une commande</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Client */}
                                    <div className="mb-3">
                                        <label>Client</label>
                                        <select
                                            className="form-control"
                                            value={selectedClient}
                                            onChange={(e) => setSelectedClient(e.target.value)}
                                            required
                                            disabled={user?.role === 'client'} // désactive pour client
                                        >
                                            {user?.role === 'client' ? (
                                                <option value={user.id}>{user.nom} {user.prenom}</option>
                                            ) : (
                                                <>
                                                    <option value="">-- Sélectionner --</option>
                                                    {clients.map(client => (
                                                        <option key={client.id} value={client.id}>
                                                            {client.nom} {client.prenom}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {/* Dates */}
                                    <div className="mb-3">
                                        <label>Date début</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={debut_location}
                                            onChange={(e) => setDebutLocation(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Date fin</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={fin_location}
                                            onChange={(e) => setFinLocation(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Produits */}
                                    <h5>Produits</h5>
                                    <div className="row">
                                        {produits.map(produit => {
                                            const selection = selectedProduits.find(p => p.id === produit.id) || {};
                                            return (
                                                <div className="col-md-4 mb-3" key={produit.id}>
                                                    <div className="card p-2">
                                                        <h6>{produit.designation}</h6>
                                                        <p>Prix : {produit.prix} Ar</p>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={selection.quantite || ''}
                                                            placeholder="Quantité"
                                                            className="form-control"
                                                            onChange={(e) => handleProduitChange(produit.id, e.target.value)}
                                                        />
                                                        <p>Total : {selection.quantite ? calculTotalProduit(selection.quantite, produit.prix) : 0} Ar</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <h5 className="text-end">💰 Total commande : {calculTotalCommande()} Ar</h5>
                                    <button type="submit" className="btn btn-success w-100">Valider</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste commandes filtrée selon l'utilisateur */}
            <div className="commandes-grid">
                {(commandes.filter(c => {
                    // Si client, ne voir que ses commandes
                    if (user?.role === 'client') return c.id_client === user.id;
                    return true; // admin/receptionniste voient tout
                })).map(commande => (
                    <div className="commande-card" key={commande.id}>
                        <div className="commande-header">
                            <h3>Commande #{commande.id}</h3>
                            <span className={`etat ${(commande.etat || 'en-cours').replace(' ', '-')}`}>
                              {commande.etat || 'En cours'}
                            </span>
                        </div>
                        <p><strong>Client :</strong> {commande.client?.nom} {commande.client?.prenom}</p>
                        <p><strong>Période :</strong> {commande.debut_location} → {commande.fin_location}</p>
                        <p><strong>Total :</strong> {
                            (commande.produits || []).reduce((total, prod) => {
                                const prix = parseFloat(prod.pivot?.prix_unitaire || 0);
                                const quantite = parseFloat(prod.pivot?.quantite || 0);
                                return total + prix * quantite;
                            }, 0).toFixed(2)
                        } €</p>

                        <div className="commande-actions">
                            <button className="btn btn-view" onClick={() => navigate(`/commandes/${commande.id}`)}>Voir</button>
                            <button className="btn btn-edit" onClick={() => navigate(`/dashboard/commandes/${commande.id}/edit`)}>Modifier</button>
                            <button className="btn btn-delete" onClick={() => supprimerCommande(commande.id)}>Supprimer</button>
                            <button className="btn btn-facture" onClick={() => genererPDF(commande.id)}>PDF</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Commande;
