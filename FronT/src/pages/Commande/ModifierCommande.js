import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ModifierCommande.css'; // S'assurer que le fichier CSS existe
import api from '../../services/api';

const ModifierCommande = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [produitsDisponibles, setProduitsDisponibles] = useState([]);
    const [commande, setCommande] = useState(null);
    const [totalCommande, setTotalCommande] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [commandeRes, clientsRes, produitsRes] = await Promise.all([
                    api.get(`/commandes/${id}`),
                    api.get('/clients'),
                    api.get('/produits/all'), // Utiliser la route pour tous les produits non paginés
                ]);

                const produitsCommande = commandeRes.data.produits.map(p => ({
                    id: p.id,
                    designation: p.designation,
                    quantite: p.pivot.quantite,
                    prix_unitaire: parseFloat(p.pivot.prix_unitaire), // S'assurer que c'est un nombre
                    mode_prix: p.mode_prix,
                    prix: p.prix,
                    quantite_lot: p.quantite_lot,
                }));

                setCommande({
                    id_client: commandeRes.data.id_client,
                    debut_location: commandeRes.data.debut_location,
                    fin_location: commandeRes.data.fin_location,
                    produits: produitsCommande,
                });

                // Assurer que les données des produits sont des tableaux
                const produitsData = Array.isArray(produitsRes.data)
                    ? produitsRes.data
                    : (produitsRes.data && Array.isArray(produitsRes.data.data) ? produitsRes.data.data : []);

                setClients(clientsRes.data);
                setProduitsDisponibles(produitsData);
                setLoading(false);
            } catch (error) {
                console.error('Erreur de chargement:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!commande) return;

        const total = commande.produits.reduce((sum, p) => {
            const quantite = parseFloat(p.quantite) || 0;
            const prix = parseFloat(p.prix_unitaire) || 0;
            return sum + quantite * prix;
        }, 0);

        setTotalCommande(total);
    }, [commande]);

    const handleProduitChange = (index, field, value) => {
        const updatedProduits = [...commande.produits];
        let produit = { ...updatedProduits[index] };

        if (field === 'id') {
            const prodDetails = produitsDisponibles.find(p => p.id === parseInt(value));
            if (prodDetails) {
                produit = {
                    ...prodDetails,
                    id: prodDetails.id,
                    designation: prodDetails.designation,
                    quantite: 1, // Réinitialise la quantité à 1 lors du changement de produit
                    mode_prix: prodDetails.mode_prix,
                    prix: parseFloat(prodDetails.prix),
                    quantite_lot: parseFloat(prodDetails.quantite_lot),
                };

                if (prodDetails.mode_prix === 'proportionnel' && prodDetails.quantite_lot) {
                    produit.prix_unitaire = (parseFloat(prodDetails.prix) / parseFloat(prodDetails.quantite_lot));
                } else {
                    produit.prix_unitaire = parseFloat(prodDetails.prix);
                }
            } else {
                // Si l'option "Choisir produit" est sélectionnée
                produit = { id: '', designation: '', quantite: 0, prix_unitaire: 0 };
            }
        } else {
            produit = { ...produit, [field]: parseFloat(value) };
        }

        // Gérer le prix unitaire si le mode est proportionnel
        if (field === 'quantite' && produit.mode_prix === 'proportionnel' && produit.quantite_lot) {
            produit.prix_unitaire = (produit.prix / produit.quantite_lot);
        }

        updatedProduits[index] = produit;
        setCommande({ ...commande, produits: updatedProduits });
    };

    const ajouterProduit = () => {
        setCommande({
            ...commande,
            produits: [...commande.produits, {
                id: '',
                designation: '',
                quantite: 1,
                prix_unitaire: 0,
                mode_prix: '',
                prix: 0,
                quantite_lot: 1
            }]
        });
    };

    const supprimerProduit = (index) => {
        const produits = [...commande.produits];
        produits.splice(index, 1);
        setCommande({ ...commande, produits });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                id_client: commande.id_client,
                debut_location: commande.debut_location,
                fin_location: commande.fin_location,
                produits: commande.produits
                    .filter(p => p.id && parseFloat(p.quantite) > 0)
                    .map(p => ({
                        id: p.id,
                        quantite: parseFloat(p.quantite),
                        prix_unitaire: parseFloat(p.prix_unitaire),
                    })),
            };
            await api.put(`/commandes/${id}`, payload);
            alert("Commande modifiée avec succès !");
            navigate("/commandes");
        } catch (error) {
            console.error("Erreur de modification :", error);
            alert("Une erreur est survenue.");
        }
    };

    if (loading || !commande) return <p>Chargement...</p>;

    return (
        <div className="modifier-commande-container">
            <h2 className="modifier-commande-title">Modifier Commande #{id}</h2>

            <form onSubmit={handleSubmit} className="modifier-commande-form">
                <div className="section-client-dates">
                    <div className="form-group">
                        <label>Client :</label>
                        <select
                            value={commande.id_client}
                            onChange={(e) => setCommande({ ...commande, id_client: e.target.value })}
                            className="form-control"
                        >
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.nom} {client.prenom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="date-group">
                        <div className="form-group">
                            <label>Date début :</label>
                            <input
                                type="datetime-local"
                                value={commande.debut_location}
                                onChange={(e) => setCommande({ ...commande, debut_location: e.target.value })}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date fin :</label>
                            <input
                                type="datetime-local"
                                value={commande.fin_location}
                                onChange={(e) => setCommande({ ...commande, fin_location: e.target.value })}
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>

                <div className="section-produits">
                    <h3 className="section-title">Produits de la commande</h3>
                    <div className="produits-table">
                        <div className="table-header">
                            <span>Produit</span>
                            <span>Quantité</span>
                            <span>Prix Unitaire</span>
                            <span>Type</span>
                            <span>Total</span>
                            <span>Action</span>
                        </div>
                        {commande.produits.map((prod, index) => (
                            <div key={index} className="table-row">
                                <select
                                    value={prod.id}
                                    onChange={(e) => handleProduitChange(index, 'id', e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">-- Choisir produit --</option>
                                    {produitsDisponibles.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.designation}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    min="1"
                                    value={prod.quantite}
                                    onChange={(e) => handleProduitChange(index, 'quantite', e.target.value)}
                                    className="form-control"
                                />

                                <input
                                    type="number"
                                    value={parseFloat(prod.prix_unitaire).toFixed(2)}
                                    className="form-control readonly-input"
                                    readOnly={true}
                                />

                                <span className="cell-info">{prod.mode_prix || 'N/A'}</span>
                                <span className="cell-total">
                                    {(parseFloat(prod.quantite) * parseFloat(prod.prix_unitaire) || 0).toLocaleString()} Ar
                                </span>
                                <button
                                    type="button"
                                    onClick={() => supprimerProduit(index)}
                                    className="btn-delete-produit"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="add-product-btn-container">
                        <button type="button" onClick={ajouterProduit} className="ajouter-produit-btn">
                            + Ajouter un produit
                        </button>
                    </div>
                </div>

                <div className="total-section">
                    <div className="total-commande">
                        <span>💰 Total commande :</span>
                        <strong>{totalCommande.toLocaleString()} Ar</strong>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit">
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ModifierCommande;