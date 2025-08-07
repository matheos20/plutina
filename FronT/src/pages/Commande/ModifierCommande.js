import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ModifierCommande.css';
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
                    api.get('/produits'),
                ]);

                const produitsCommande = commandeRes.data.produits.map(p => ({
                    id: p.id,
                    designation: p.designation,
                    quantite: p.pivot.quantite,
                    prix_unitaire: p.pivot.prix_unitaire,
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

                setClients(clientsRes.data);
                setProduitsDisponibles(produitsRes.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Erreur de chargement:', error);
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
        const produits = [...commande.produits];
        const produit = { ...produits[index], [field]: value };

        if (field === 'id') {
            const prodDetails = produitsDisponibles.find(p => p.id == value);
            if (prodDetails) {
                produit.designation = prodDetails.designation;
                produit.mode_prix = prodDetails.mode_prix;
                produit.prix = prodDetails.prix;
                produit.quantite_lot = prodDetails.quantite_lot;

                if (prodDetails.mode_prix === 'proportionnel') {
                    const prixParUnite = prodDetails.prix / prodDetails.quantite_lot;
                    produit.prix_unitaire = prixParUnite.toFixed(2);
                } else {
                    produit.prix_unitaire = prodDetails.prix.toFixed(2);
                }
            }
        }


        if (field === 'quantite' && produit.mode_prix === 'proportionnel') {
            const prixParUnite = produit.prix / produit.quantite_lot;
            produit.prix_unitaire = (prixParUnite).toFixed(2);
        }

        produits[index] = produit;
        setCommande({ ...commande, produits });
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
                produits: commande.produits.map(p => ({
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
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Modifier Commande #{id}</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow p-4 rounded-xl">
                <div>
                    <label>Client :</label>
                    <select
                        value={commande.id_client}
                        onChange={(e) => setCommande({ ...commande, id_client: e.target.value })}
                        className="border rounded p-2 w-full"
                    >
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.nom} {client.prenom}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label>Date début :</label>
                        <input
                            type="datetime-local"
                            value={commande.debut_location}
                            onChange={(e) => setCommande({ ...commande, debut_location: e.target.value })}
                            className="border rounded p-2 w-full"
                        />

                        <label>Date fin :</label>
                        <input
                            type="datetime-local"
                            value={commande.fin_location}
                            onChange={(e) => setCommande({ ...commande, fin_location: e.target.value })}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2">Produits</h3>
                    {commande.produits.map((prod, index) => (
                        <div key={index} className="produit-grid">
                            <select
                                value={prod.id}
                                onChange={(e) => handleProduitChange(index, 'id', e.target.value)}
                                className="border p-2 rounded"
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
                                className="border p-2 rounded"
                            />

                            <input
                                type="number"
                                value={prod.prix_unitaire}
                                onChange={(e) => {
                                    if (prod.mode_prix !== 'proportionnel') {
                                        handleProduitChange(index, 'prix_unitaire', e.target.value);
                                    }
                                }}
                                className="border p-2 rounded bg-gray-100"
                                readOnly={prod.mode_prix === 'proportionnel'}
                            />


                            <span className="text-sm border p-2">
                                {prod.mode_prix === 'proportionnel' ? '💡 proportionnel' : '🧾 unitaire'}
                            </span>
                            <span className="text-sm">
                                {(prod.quantite * prod.prix_unitaire).toLocaleString()} Ar
                            </span>
                            <button
                                type="button"
                                onClick={() => supprimerProduit(index)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Supprimer
                            </button>

                        </div>
                    ))}

                    <button type="button" onClick={ajouterProduit} className="ajouter-produit-btn">
                        + Ajouter un produit
                    </button>
                </div>

                <div className="mt-4 text-right font-bold text-lg">
                    💰 Total commande : {totalCommande.toLocaleString()} Ar
                </div>

                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">
                    Enregistrer les modifications
                </button>
            </form>
        </div>
    );
};

export default ModifierCommande;
