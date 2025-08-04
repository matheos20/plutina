import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const FicheProduitAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [produit, setProduit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchProduit = async () => {
            try {
                const response = await api.get(`/produits/${id}`);
                setProduit(response.data);
            } catch (err) {
                setErrorMessage("Produit introuvable");
            } finally {
                setLoading(false);
            }
        };

        fetchProduit();
    }, [id]);

    const handleDelete = async () => {
        const confirm = window.confirm("Voulez-vous vraiment supprimer ce produit ?");
        if (!confirm) return;

        try {
            await api.delete(`/produits/${id}`);
            setSuccessMessage("Produit supprimé avec succès !");
            setTimeout(() => {
                navigate("/dashboard/produits");
            }, 1500);
        } catch (err) {
            setErrorMessage("Erreur lors de la suppression du produit.");
        }
    };

    const handleEdit = () => {
        navigate(`/dashboard/produits/${id}/edit`);
    };

    if (loading) return <div className="text-center mt-5">Chargement...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!produit) return null;

    return (
        <div className="container py-5">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <h2 className="mb-4">Détails du produit</h2>
            <div className="card mx-auto" style={{ maxWidth: "600px", borderRadius: "20px", boxShadow: "0 0 15px rgba(0,0,0,0.1)" }}>
                {produit.image && (
                    <img
                        src={`http://127.0.0.1:8000/storage/${produit.image}`}
                        alt={produit.designation}
                        className="card-img-top"
                        style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", objectFit: "cover", height: "300px" }}
                    />
                )}
                <div className="card-body">
                    <h4 className="card-title">{produit.designation}</h4>
                    <p className="card-text"><strong>Référence :</strong> {produit.reference}</p>
                    <p className="card-text"><strong>Quantité :</strong> {produit.quantite}</p>
                    <p className="card-text"><strong>Prix :</strong> {produit.prix} €</p>

                    <div className="d-flex justify-content-between mt-4">
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                            ⬅ Retour
                        </button>
                        <button className="btn btn-primary" onClick={handleEdit}>
                            ✏️ Modifier
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FicheProduitAdmin;
