import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function AjouterCommande() {
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedProduits, setSelectedProduits] = useState([]);
    const [debut_location, setDebutLocation] = useState('');
    const [fin_location, setFinLocation] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchClients();
        fetchProduits();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (error) {
            console.error("Erreur chargement clients :", error);
        }
    };

    const fetchProduits = async () => {
        try {
            const res = await api.get('/produits');
            setProduits(res.data.data); // adapter si nécessaire
        } catch (error) {
            console.error("Erreur chargement produits :", error);
        }
    };

    const handleProduitChange = (produitId, field, value) => {
        setSelectedProduits(prev => {
            const existing = prev.find(p => p.id === produitId);
            const produitData = produits.find(p => p.id === produitId);
            let updatedProduits;

            if (existing) {
                const updated = prev.map(p =>
                    p.id === produitId ? { ...p, [field]: value } : p
                );
                updatedProduits = updated;
            } else {
                const nouveauProduit = {
                    id: produitId,
                    quantite: field === 'quantite' ? parseInt(value) : 1,
                    prix_unitaire: 0,
                    type_prix: produitData?.type_prix || 'unitaire',
                    prix: produitData?.prix || 0,
                    quantite_par_lot: produitData?.quantite_par_lot || 1
                };
                updatedProduits = [...prev, nouveauProduit];
            }

            // Recalculer les prix unitaires
            return updatedProduits.map(p => {
                if (p.id === produitId) {
                    let prixUnitaire = 0;
                    if (p.type_prix === 'proportionnel' && p.quantite_par_lot) {
                        prixUnitaire = p.prix / p.quantite_par_lot;
                    } else {
                        prixUnitaire = p.prix;
                    }
                    return {
                        ...p,
                        quantite: field === 'quantite' ? parseInt(value) : p.quantite,
                        prix_unitaire: prixUnitaire,
                    };
                }
                return p;
            });
        });
    };

    const calculTotalProduit = (quantite, prix_unitaire) => {
        return quantite * prix_unitaire;
    };

    const calculTotalCommande = () => {
        return selectedProduits.reduce((total, p) => {
            return total + calculTotalProduit(p.quantite, p.prix_unitaire);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            id_client: selectedClient,
            debut_location,
            fin_location,
            produits: selectedProduits.map(p => ({
                id: p.id,
                quantite: parseInt(p.quantite),
                prix_unitaire: parseFloat(p.prix_unitaire),
            }))
        };

        try {
            await api.post('/commandes', payload);
            alert("Commande créée avec succès !");
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

    return (
        <div className="container mt-4">
            <h2>Ajouter une commande</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Client</label>
                    <select
                        className="form-control"
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        required
                    >
                        <option value="">-- Sélectionner un client --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.nom} {client.prenom}
                            </option>
                        ))}
                    </select>
                    {errors.id_client && <div className="text-danger">{errors.id_client[0]}</div>}
                </div>

                <div className="mb-3">
                    <label>Date début location</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={debut_location}
                        onChange={(e) => setDebutLocation(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Date fin location</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={fin_location}
                        onChange={(e) => setFinLocation(e.target.value)}
                        required
                    />
                </div>

                <h5 className="mt-4">Produits</h5>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Désignation</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total ligne</th>
                    </tr>
                    </thead>
                    <tbody>
                    {produits.map(produit => {
                        const selection = selectedProduits.find(p => p.id === produit.id) || {};
                        return (
                            <tr key={produit.id}>
                                <td>{produit.designation}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        value={selection.quantite || ''}
                                        onChange={(e) =>
                                            handleProduitChange(produit.id, 'quantite', e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selection.prix_unitaire || 0}
                                        readOnly
                                    />
                                </td>
                                <td>
                                    {selection.quantite && selection.prix_unitaire
                                        ? calculTotalProduit(selection.quantite, selection.prix_unitaire)
                                        : 0}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                <h5 className="text-end">💰 Total commande : <strong>{calculTotalCommande()} Ar</strong></h5>

                <button type="submit" className="btn btn-primary">Valider la commande</button>
            </form>
        </div>
    );
}

export default AjouterCommande;
