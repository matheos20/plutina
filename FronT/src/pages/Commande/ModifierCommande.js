import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ModifierCommande = () => {
    const { id } = useParams(); // ID de la commande
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [produitsDisponibles, setProduitsDisponibles] = useState([]);
    const [commande, setCommande] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [commandeRes, clientsRes, produitsRes] = await Promise.all([
                    api.get(`/commandes/${id}`),
                    api.get('/clients'),
                    api.get('/produits'),
                ]);
                console.log("Commande =>", commandeRes.data);
                console.log("Clients =>", clientsRes.data);
                console.log("Produits =>", produitsRes.data);
                setCommande({
                    id_client: commandeRes.data.id_client,
                    debut_location: commandeRes.data.debut_location,
                    fin_location: commandeRes.data.fin_location,
                    produits: commandeRes.data.produits.map(p => ({
                        id: p.id,
                        nom: p.designation ,
                        quantite: p.pivot.quantite,
                        prix_unitaire: p.pivot.prix_unitaire,
                    })),
                });

                setClients(clientsRes.data);
                setProduitsDisponibles(produitsRes.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Erreur chargement:', err);
            }
        };

        fetchData();
    }, [id]);

    const handleProduitChange = (index, field, value) => {
        const newProduits = [...commande.produits];
        newProduits[index][field] = value;
        setCommande({ ...commande, produits: newProduits });
    };

    const ajouterProduit = () => {
        setCommande({
            ...commande,
            produits: [...commande.produits, { id: '', quantite: 1, prix_unitaire: 0 }],
        });
    };

    const supprimerProduit = (index) => {
        const newProduits = [...commande.produits];
        newProduits.splice(index, 1);
        setCommande({ ...commande, produits: newProduits });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/commandes/${id}`, commande);
            alert('Commande modifiée avec succès');
            navigate('/commandes');
        } catch (err) {
            console.error('Erreur modification:', err);
            alert('Une erreur est survenue.');
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
                        {clients.map((client) => (
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
                            type="date"
                            value={commande.debut_location}
                            onChange={(e) => setCommande({ ...commande, debut_location: e.target.value })}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label>Date fin :</label>
                        <input
                            type="date"
                            value={commande.fin_location}
                            onChange={(e) => setCommande({ ...commande, fin_location: e.target.value })}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2">Produits</h3>
                    {commande.produits.map((prod, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
                            <select
                                value={prod.id}
                                onChange={(e) => handleProduitChange(index, 'id', e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="">-- Choisir produit --</option>
                                {Array.isArray(produitsDisponibles) && produitsDisponibles.map((p) => (
                                    <option key={p.id} value={String(p.id)}>
                                        {p.designation}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={prod.quantite}
                                onChange={(e) => handleProduitChange(index, 'quantite', e.target.value)}
                                className="border p-2 rounded"
                                placeholder="Quantité"
                            />
                            <input
                                type="number"
                                value={prod.prix_unitaire}
                                onChange={(e) => handleProduitChange(index, 'prix_unitaire', e.target.value)}
                                className="border p-2 rounded"
                                placeholder="Prix unitaire"
                            />
                            <button
                                type="button"
                                onClick={() => supprimerProduit(index)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={ajouterProduit} className="mt-2 text-blue-600">
                        + Ajouter un produit
                    </button>
                </div>

                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">
                    Enregistrer les modifications
                </button>
            </form>
        </div>
    );
};

export default ModifierCommande;
