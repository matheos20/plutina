import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AjouterCommande.css';

function AjouterCommande() {
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedProduits, setSelectedProduits] = useState([]);
    const [debut_location, setDebutLocation] = useState('');
    const [fin_location, setFinLocation] = useState('');
    const [errors, setErrors] = useState({});

    // Ajout d'un state pour la recherche
    const [termeRecherche, setTermeRecherche] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const produitsParPage = 4; // 4 produits par page, comme dans l'image

    useEffect(() => {
        fetchClients();
        fetchProduits();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients'); // utiliser api et pas axios
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setClients(data);
        } catch (error) {
            console.error("Erreur chargement clients :", error.response?.data || error.message);
        }
    };



    const fetchProduits = async () => {
        try {
            const res = await api.get('/produits/all');
            const data = Array.isArray(res.data)
                ? res.data
                : (res.data && Array.isArray(res.data.data) ? res.data.data : []);
            setProduits(data);
            setCurrentPage(1); // revient à la page 1 quand on recharge
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

    const calculTotalProduit = (quantite, prix_unitaire) => {
        const q = Number(quantite || 0);
        const pu = Number(prix_unitaire || 0);
        return q * pu;
    };

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
                    }
                })
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

    // Filtre les produits en fonction du terme de recherche
    const produitsFiltres = produits.filter(produit =>
        produit.designation.toLowerCase().includes(termeRecherche.toLowerCase())
    );

    // Pagination calcul pour les produits filtrés
    const totalPages = Math.max(1, Math.ceil(produitsFiltres.length / produitsParPage));
    const start = (currentPage - 1) * produitsParPage;
    const end = start + produitsParPage;
    const produitsAffiches = produitsFiltres.slice(start, end);

    return (
        <div className="container mt-4">
            <h2>Ajouter une commande</h2>
            <form onSubmit={handleSubmit}>
                {/* Client */}
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

                {/* Dates */}
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

                {/* Recherche de produits et titre */}
                <h5 className="mt-4">Produits</h5>
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un produit..."
                        value={termeRecherche}
                        onChange={(e) => {
                            setTermeRecherche(e.target.value);
                            setCurrentPage(1); // Réinitialise la pagination lors de la recherche
                        }}
                    />
                </div>

                {/* Liste des produits sous forme de cartes */}
                <div className="row">
                    {produitsAffiches.length > 0 ? (
                        produitsAffiches.map(produit => {
                            const selection = selectedProduits.find(p => p.id === produit.id) || {};
                            return (
                                <div className="col-md-3 mb-4" key={produit.id}>
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <h5 className="card-title">{produit.designation}</h5>
                                            <p>Prix : {produit.prix} Ar</p>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Quantité"
                                                className="form-control mb-2"
                                                value={selection.quantite || ''}
                                                onChange={(e) => handleProduitChange(produit.id, e.target.value)}
                                            />
                                            <p>Total : {selection.quantite ? calculTotalProduit(selection.quantite, produit.prix) : 0} Ar</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12">
                            <p>Aucun produit trouvé pour votre recherche.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center my-3">
                        <button
                            type="button"
                            className="btn btn-light mx-2"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ◀
                        </button>
                        <span>Page {currentPage} / {totalPages}</span>
                        <button
                            type="button"
                            className="btn btn-light mx-2"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            ▶
                        </button>
                    </div>
                )}

                {/* Total */}
                <h5 className="text-end">💰 Total commande : <strong>{calculTotalCommande()} Ar</strong></h5>

                <button type="submit" className="btn btn-primary w-100">Valider la commande</button>
            </form>
        </div>
    );
}

export default AjouterCommande;