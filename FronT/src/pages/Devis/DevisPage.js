import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./DevisPage.css";

function DevisPage() {
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [devisList, setDevisList] = useState([]);
    const [totalGeneral, setTotalGeneral] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [erreurs, setErreurs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const perPage = 10; // nombre de devis par page

    const [devisForm, setDevisForm] = useState({
        id_client: "",
        reference: "",
        debut_location: "",
        fin_location: "",
        produits: [],
    });

    const etatsAutorises = ['Brouillon','en attente','accepté','refusé','transformé','annulé'];

    useEffect(() => {
        fetchDevis(currentPage);
        fetchFormData();
    }, [currentPage]);

    const fetchDevis = async (page = 1) => {
        try {
            const res = await api.get(`/devis?page=${page}&limit=${perPage}`);
            setDevisList(res.data.data);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFormData = async () => {
        try {
            const res = await api.get("/devis/create");
            setClients(res.data.clients);
            setProduits(res.data.produits);
        } catch (err) {
            console.error(err);
        }
    };

    const addProduitLine = () => {
        setDevisForm(prev => ({
            ...prev,
            produits: [...prev.produits, { id: "", quantite: 1, prix_unitaire: 0, prix_total: 0 }]
        }));
    };

    const removeProduitLine = (index) => {
        const newProduits = [...devisForm.produits];
        newProduits.splice(index, 1);
        setDevisForm(prev => ({ ...prev, produits: newProduits }));
        updateTotalGeneral(newProduits);
    };

    const handleProduitChange = (index, field, value) => {
        const newProduits = [...devisForm.produits];
        if (field === "id" || field === "quantite") value = parseInt(value) || 0;
        if (field === "prix_unitaire") value = parseFloat(value) || 0;

        newProduits[index][field] = value;

        if (field === "id") {
            const produit = produits.find(p => p.id === value);
            if (produit) {
                newProduits[index].prix_unitaire =
                    produit.mode_prix === "unitaire"
                        ? parseFloat(produit.prix)
                        : parseFloat(produit.prix_par_lot) / parseFloat(produit.quantite_par_lot);
            } else {
                newProduits[index].prix_unitaire = 0;
            }
        }

        newProduits[index].prix_total = newProduits[index].quantite * newProduits[index].prix_unitaire;
        setDevisForm(prev => ({ ...prev, produits: newProduits }));
        updateTotalGeneral(newProduits);
    };

    const updateTotalGeneral = (produitsList) => {
        const total = produitsList.reduce((acc, p) => acc + (p.prix_total || 0), 0);
        setTotalGeneral(total);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreurs([]);
        try {
            const payload = {
                id_client: parseInt(devisForm.id_client),
                reference: devisForm.reference,
                debut_location: devisForm.debut_location,
                fin_location: devisForm.fin_location,
                produits: devisForm.produits.map(p => ({
                    id: parseInt(p.id),
                    quantite: parseInt(p.quantite),
                    prix_unitaire: parseFloat(p.prix_unitaire)
                }))
            };

            await api.post("/devis", payload, {
                headers: { "Content-Type": "application/json", "Accept": "application/json" }
            });

            alert("Devis créé avec succès !");
            setModalVisible(false);
            setDevisForm({ id_client: "", reference: "", debut_location: "", fin_location: "", produits: [] });
            setTotalGeneral(0);
            fetchDevis(currentPage);
        } catch (err) {
            console.error(err.response?.data || err);
            if (err.response?.data?.errors) {
                const messages = Object.values(err.response.data.errors).flat();
                setErreurs(messages);
            } else {
                alert("Erreur lors de la création du devis.");
            }
        }
    };

    const changerEtatDevis = async (id, nouvelEtat) => {
        if (!etatsAutorises.includes(nouvelEtat)) {
            alert("État invalide !");
            return;
        }
        try {
            const res = await api.post(`/devis/${id}/changer-etat`, {etat: nouvelEtat});
            let messageClair = "";
            switch (nouvelEtat) {
                case "en attente": messageClair = "Le devis est maintenant en attente."; break;
                case "accepté": messageClair = "Le devis a été accepté."; break;
                case "transformé": messageClair = "Le devis a été transformé en commande."; break;
                case "annulé": messageClair = "Le devis a été annulé."; break;
                case "refusé": messageClair = "Le devis a été refusé."; break;
                case "Brouillon": messageClair = "Le devis est en brouillon."; break;
                default: messageClair = res.data.message;
            }
            alert(messageClair);
            fetchDevis(currentPage);
        } catch (err) {
            console.error(err.response?.data || err);
            if (err.response?.data?.error) {
                alert("Erreur : " + err.response.data.error);
            } else {
                alert("Erreur lors du changement d'état.");
            }
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'en attente': return 'status-en-attente';
            case 'accepté': return 'status-accepté';
            case 'transformé': return 'status-transformé';
            case 'annulé': return 'status-annulé';
            case 'refusé': return 'status-refusé';
            default: return '';
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < lastPage) setCurrentPage(prev => prev + 1);
    };

    return (
        <div>
            <h2>Devis</h2>
            <button onClick={() => setModalVisible(true)}>Ajouter un Devis</button>

            {/* Modal création devis */}
            <div className={`modal-overlay ${modalVisible ? 'visible' : ''}`}>
                <div className="modal-content">
                    <h3>Créer un Devis</h3>
                    {erreurs.length > 0 && (
                        <div style={{ color: 'red', marginBottom: '1rem' }}>
                            {erreurs.map((err, index) => <p key={index}>{err}</p>)}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {/* Formulaire client, référence et dates */}
                        <div className="form-row">
                            <div className="form-field">
                                <label>Client</label>
                                <select
                                    value={devisForm.id_client}
                                    onChange={(e) => setDevisForm(prev => ({ ...prev, id_client: e.target.value }))}
                                >
                                    <option value="">-- Sélectionner un client --</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Référence</label>
                                <input
                                    type="text"
                                    value={devisForm.reference}
                                    onChange={(e) => setDevisForm(prev => ({ ...prev, reference: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Début de la location</label>
                                <input
                                    type="date"
                                    value={devisForm.debut_location}
                                    onChange={(e) => setDevisForm(prev => ({ ...prev, debut_location: e.target.value }))}
                                />
                            </div>
                            <div className="form-field">
                                <label>Fin de la location</label>
                                <input
                                    type="date"
                                    value={devisForm.fin_location}
                                    onChange={(e) => setDevisForm(prev => ({ ...prev, fin_location: e.target.value }))}
                                />
                            </div>
                        </div>

                        <h4>Produits</h4>
                        {devisForm.produits.map((p, index) => (
                            <div key={index} className="product-list-item">
                                <select
                                    value={p.id}
                                    onChange={(e) => handleProduitChange(index, "id", e.target.value)}
                                >
                                    <option value="">-- Sélectionner un produit --</option>
                                    {produits.map(prod => (
                                        <option key={prod.id} value={prod.id}>{prod.designation} ({prod.reference})</option>
                                    ))}
                                </select>
                                <input type="number" min="1" value={p.quantite} onChange={(e) => handleProduitChange(index, "quantite", e.target.value)} />
                                <input type="number" value={p.prix_unitaire} readOnly className="fixed-price" />
                                <input type="number" value={p.prix_total} readOnly className="fixed-price" />
                                <button type="button" onClick={() => removeProduitLine(index)} className="button-remove">Supprimer</button>
                            </div>
                        ))}
                        <button type="button" onClick={addProduitLine} className="button-add">Ajouter un produit</button>

                        <div className="form-row" style={{ marginTop: "20px" }}>
                            <button type="submit" className="button-submit">Créer le Devis</button>
                            <button type="button" onClick={() => setModalVisible(false)} className="button-close">Fermer</button>
                        </div>

                        <h4>Total Général : {totalGeneral.toFixed(2)} €</h4>
                    </form>
                </div>
            </div>

            {/* Liste des devis */}
            <h3>Liste des Devis</h3>
            <div className="devis-list-container">
                {devisList.map(d => (
                    <div key={d.id} className="devis-card">
                        <div className="devis-header">
                            <h4>Devis #{d.id} - Réf: {d.reference}</h4>
                            <span className={`devis-status ${getStatusClass(d.etat)}`}>{d.etat}</span>
                        </div>
                        <div className="devis-details">
                            <p><strong>Client :</strong> {d.client?.nom} {d.client?.prenom}</p>
                            <p><strong>Total :</strong> {d.total} €</p>
                            {d.debut_location && <p><strong>Début :</strong> {d.debut_location}</p>}
                            {d.fin_location && <p><strong>Fin :</strong> {d.fin_location}</p>}
                        </div>
                        <div className="devis-products">
                            <h5>Produits:</h5>
                            <ul className="devis-products-list">
                                {d.produits.map(p => (
                                    <li key={p.id}>{p.designation} - Qté: {p.pivot.quantite} ({p.pivot.prix_unitaire} €/unité)</li>
                                ))}
                            </ul>
                        </div>
                        <div className="devis-actions">
                            {d.etat === 'en attente' && (
                                <button onClick={() => changerEtatDevis(d.id, 'accepté')} className="button-accepter">Accepter</button>
                            )}
                            {d.etat === 'accepté' && (
                                <button onClick={() => changerEtatDevis(d.id, 'transformé')} className="button-transformer">Transformer en commande</button>
                            )}
                            {d.etat !== 'transformé' && d.etat !== 'refusé' && (
                                <button onClick={() => changerEtatDevis(d.id, 'annulé')} className="button-annuler">Annuler</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Précédent</button>
                <span>Page {currentPage} / {lastPage}</span>
                <button onClick={handleNextPage} disabled={currentPage === lastPage}>Suivant</button>
            </div>
        </div>
    );
}

export default DevisPage;
