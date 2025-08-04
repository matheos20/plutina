import React, { useState, useEffect } from 'react';
import api from '../../services/api';
// import './AjouterCommande.css'; // si tu veux ajouter du style

function AjouterCommande() {
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedProduits, setSelectedProduits] = useState([]);
    const [debut_location, setDebutLocation] = useState('');
    const [fin_location, setFinLocation] = useState('');
    const [errors, setErrors] = useState({});
    const token = localStorage.getItem("token")
    // Charger clients et produits
    useEffect(() => {
        fetchClients();
        fetchProduits();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients'); // adapte l'URL si besoin
            console.log("Clients chargés :", res.data);
            setClients(res.data);
        } catch (error) {
            console.error("Erreur chargement clients :", error);
        }
    };

    const fetchProduits = async () => {
        try {
            const res = await api.get('/produits');
            setProduits(res.data.data); // attention à ton format
        } catch (error) {
            console.error("Erreur chargement produits :", error);
        }
    };

    const handleProduitChange = (produitId, field, value) => {
        setSelectedProduits(prev => {
            const existing = prev.find(p => p.id === produitId);
            if (existing) {
                return prev.map(p =>
                    p.id === produitId ? { ...p, [field]: value } : p
                );
            } else {
                return [...prev, { id: produitId, [field]: value, quantite: 1, prix_unitaire: 0 }];
            }
        });
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
            // Reset
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
                    {errors.debut_location && <div className="text-danger">{errors.debut_location[0]}</div>}
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
                    {errors.fin_location && <div className="text-danger">{errors.fin_location[0]}</div>}
                </div>

                <h5 className="mt-4">Produits</h5>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Désignation</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                    </tr>
                    </thead>
                    <tbody>
                    {produits.map(produit => (
                        <tr key={produit.id}>
                            <td>{produit.designation}</td>
                            <td>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    onChange={(e) =>
                                        handleProduitChange(produit.id, 'quantite', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="form-control"
                                    onChange={(e) =>
                                        handleProduitChange(produit.id, 'prix_unitaire', e.target.value)
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {errors.produits && <div className="text-danger">{errors.produits[0]}</div>}

                <button type="submit" className="btn btn-primary">Valider la commande</button>
            </form>
        </div>
    );
}

export default AjouterCommande;
