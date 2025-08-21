import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Devis.css"; // ton fichier CSS pour styliser

function Devis() {
    const [devis, setDevis] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDevis = async () => {
        try {
            setLoading(true);
            const response = await api.get("/devis");
            setDevis(response.data.filter(d => d.etat !== "transformé"));
        } catch (error) {
            console.error("Erreur lors de la récupération des devis :", error);
            alert("Erreur lors de la récupération des devis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevis();
    }, []);

    const accepterDevis = async (id) => {
        try {
            await api.post(`/devis/${id}/accepter`);
            fetchDevis();
            alert("Le devis a été accepté !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'acceptation du devis.");
        }
    };

    const refuserDevis = async (id) => {
        try {
            await api.post(`/devis/${id}/refuser`);
            fetchDevis();
            alert("Le devis a été refusé !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors du refus du devis.");
        }
    };

    const transformerCommande = async (id) => {
        try {
            await api.post(`/devis/${id}/transformer`);
            fetchDevis();
            alert("Le devis a été transformé en commande !");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de la transformation du devis.");
        }
    };

    if (loading) return <p>Chargement des devis...</p>;
    if (devis.length === 0) return <p>Aucun devis disponible.</p>;

    return (
        <div className="devis-container">
            <h2 className="devis-title">Liste des devis</h2>
            <div className="devis-grid">
                {devis.map((d) => (
                    <div key={d.id} className="devis-card">
                        <div className="devis-header">
                            <span className="devis-ref">Réf: {d.reference}</span>
                            <span className={`devis-etat etat-${d.etat.replace(' ', '-')}`}>
                {d.etat.toUpperCase()}
              </span>
                        </div>
                        <div className="devis-body">
                            <p><strong>Client:</strong> {d.user?.name || "N/A"}</p>
                            <p><strong>Total:</strong> {d.total} €</p>
                            <p><strong>Date:</strong> {d.date_devis}</p>
                        </div>
                        <div className="devis-actions">
                            {d.etat === "en attente" && (
                                <>
                                    <button className="btn accepter" onClick={() => accepterDevis(d.id)}>✅ Accepter</button>
                                    <button className="btn refuser" onClick={() => refuserDevis(d.id)}>❌ Refuser</button>
                                </>
                            )}
                            {d.etat === "accepté" && (
                                <button className="btn transformer" onClick={() => transformerCommande(d.id)}>🟢 Transformer</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Devis;
