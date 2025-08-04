import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // adapte ce chemin si besoin
import { Modal } from "bootstrap";

function Produits() {
    const modalRef = useRef(null);
    const navigate = useNavigate();

    const [produits, setProduits] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
    const [formData, setFormData] = useState({
        designation: "",
        quantite: "",
        reference: "",
        prix: "",
        image: null,
    });

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // Ouvre modal création ou modification
    const openModal = (produit = null) => {
        const modalEle = modalRef.current;

        if (produit) {
            setFormData({
                designation: produit.designation,
                quantite: produit.quantite,
                reference: produit.reference,
                prix: produit.prix,
                image: null,
            });
            setEditingId(produit.id);
        } else {
            setFormData({
                designation: "",
                quantite: "",
                reference: "",
                prix: "",
                image: null,
            });
            setEditingId(null);
        }

        const bsModal = new Modal(modalEle);
        bsModal.show();
    };

    // Charge les produits depuis API
    const fetchProduits = async (page = 1, search = "") => {
        try {
            const res = await api.get(`/produits?page=${page}&search=${search}`);
            console.log("Produits reçus :", res.data.data);
            setProduits(res.data.data);
            setPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (error) {
            console.error("Erreur lors du chargement des produits :", error);
        }
    };

    useEffect(() => {
        fetchProduits(1);
        const timer = setTimeout(() => setSuccessMessage(""), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Soumet formulaire ajout ou modification
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        }

        try {
            if (editingId) {
                await api.post(`/produits/${editingId}?_method=PUT`, data);
                setSuccessMessage("Produit modifié avec succès !");
            } else {
                await api.post("/produits", data);
                setSuccessMessage("Produit ajouté avec succès !");
            }
            fetchProduits(page);
            const modalEle = Modal.getInstance(modalRef.current);
            modalEle.hide();
            setEditingId(null);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                alert("Erreur de validation. Vérifiez les champs.");
                console.error("Erreurs Laravel :", error.response.data.errors);
            } else {
                console.error("Erreur :", error);
            }
        }
    };

    // Supprime un produit
    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
            try {
                await api.delete(`/produits/${id}`);
                fetchProduits(page);
                setSuccessMessage("Produit supprimé avec succès !");
            } catch (error) {
                console.error("Erreur suppression :", error);
            }
        }
    };

    // Gère les changements des inputs
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({ ...formData, [name]: files ? files[0] : value });
    };

    // Recherche
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProduits(1, searchTerm);
    };

    // Reset recherche
    const handleResetSearch = () => {
        setSearchTerm("");
        fetchProduits(1, "");
    };

    // Pagination
    const handlePrev = () => {
        if (page > 1) {
            fetchProduits(page - 1, searchTerm);
        }
    };
    const handleNext = () => {
        if (page < lastPage) {
            fetchProduits(page + 1, searchTerm);
        }
    };

    // Navigation vers fiche produit admin
    const handleVoirProduit = (id) => {
        navigate(`/dashboard/produits/${id}`);
    };

    return (
        <div className="container py-4">
            {successMessage && (
                <div className="alert alert-success text-center">{successMessage}</div>
            )}
            <form
                className="d-flex justify-content-between align-items-center mb-4"
                onSubmit={handleSearchSubmit}
            >
                <h2 style={{ marginRight: "20px" }}>Liste des produits</h2>

                <input
                    type="text"
                    className="form-control me-3"
                    placeholder="Rechercher par désignation ou référence"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: "42%",
                        borderRadius: "30px",
                        backgroundColor: "#fff",
                        marginTop: "23px",
                        height: "50px",
                    }}
                />

                <button
                    type="submit"
                    className="btn btn-outline-warning me-2"
                    style={{ width: "15%" }}
                >
                    Rechercher
                </button>

                <button
                    type="button"
                    className="btn btn-outline-dark me-3"
                    style={{ width: "15%" }}
                    onClick={handleResetSearch}
                >
                    Réinitialiser
                </button>

                <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={() => openModal()}
                    style={{ width: "17%" }}
                >
                    Ajouter un produit
                </button>
            </form>

            {produits.length === 0 && <p>Aucun produit trouvé.</p>}

            <div className="row">
                {produits.map((produit) => (
                    <div
                        key={produit.id}
                        className="col-lg-3 col-md-4 col-sm-6 mb-4 d-flex justify-content-center"
                    >
                        <div
                            className="card h-100"
                            style={{
                                boxShadow:
                                    "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                backgroundColor: "#f7f3f3",
                                margin: "10px auto",
                                width: "300px",
                                height: "610px",
                                borderRadius: "15px",
                                border: "none",
                                overflow: "hidden",
                                transition: "transform 0.2s ease-in-out",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            {produit.image && (
                                <div className="text-center bg-light">
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${produit.image}`}
                                        className="card-img-top mx-auto"
                                        alt={produit.designation}
                                        style={{
                                            height: "200px",
                                            objectFit: "cover",
                                            width: "100%",
                                        }}
                                    />
                                </div>
                            )}
                            <div className="card-body d-flex flex-column justify-content-between p-3">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h5 className="card-title text-primary">{produit.designation}</h5>
                                        <p className="card-text mb-1 text-muted">
                                            Quantité: {produit.quantite}
                                        </p>
                                        <p className="card-text mb-1 text-muted">
                                            Référence: {produit.reference}
                                        </p>
                                        <p className="card-text mb-1 text-muted">Prix: {produit.prix} €</p>
                                    </div>
                                    <div className="d-flex flex-column justify-content-end align-items-end">
                                        <button
                                            className="btn btn-outline-primary btn-sm mb-2"
                                            onClick={() => openModal(produit)}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm mb-2"
                                            onClick={() => handleDelete(produit.id)}
                                        >
                                            Supprimer
                                        </button>
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => handleVoirProduit(produit.id)}
                                        >
                                            Voir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <nav>
                        <ul className="pagination pagination-sm mb-0 d-flex align-items-center gap-2">
                            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={handlePrev}>
                                    Précédent
                                </button>
                            </li>
                            <li
                                className="page-item disabled"
                                style={{ marginTop: "23px" }}
                            >
                <span
                    className="page-link bg-white border-0"
                    style={{ pointerEvents: "none" }}
                >
                  Page {page} / {lastPage}
                </span>
                            </li>
                            <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                                <button className="page-link" onClick={handleNext}>
                                    Suivant
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modal */}
            <div
                className="modal fade"
                ref={modalRef}
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: "20px",
                            padding: "20px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            width: "83%",
                        }}
                    >
                        <div className="modal-header" style={{ borderBottom: "none" }}>
                            <h5 className="modal-title">
                                {editingId ? "Modifier le produit" : "Ajouter un produit"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Désignation</label>
                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.designation ? "is-invalid" : ""
                                        }`}
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "25px",
                                            border: "1px solid #dee2e6",
                                            padding: "10px",
                                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                            fontSize: "14px",
                                        }}
                                    />
                                    {errors.designation && (
                                        <div className="invalid-feedback">{errors.designation[0]}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Quantité</label>
                                    <input
                                        type="number"
                                        className={`form-control ${
                                            errors.quantite ? "is-invalid" : ""
                                        }`}
                                        name="quantite"
                                        value={formData.quantite}
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "25px",
                                            border: "1px solid #dee2e6",
                                            padding: "10px",
                                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                            fontSize: "14px",
                                        }}
                                    />
                                    {errors.quantite && (
                                        <div className="invalid-feedback">{errors.quantite[0]}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Référence</label>
                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.reference ? "is-invalid" : ""
                                        }`}
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "25px",
                                            border: "1px solid #dee2e6",
                                            padding: "10px",
                                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                            fontSize: "14px",
                                        }}
                                    />
                                    {errors.reference && (
                                        <div className="invalid-feedback">{errors.reference[0]}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Prix (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors.prix ? "is-invalid" : ""}`}
                                        name="prix"
                                        value={formData.prix}
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "25px",
                                            border: "1px solid #dee2e6",
                                            padding: "10px",
                                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                            fontSize: "14px",
                                        }}
                                    />
                                    {errors.prix && (
                                        <div className="invalid-feedback">{errors.prix[0]}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Image</label>
                                    <input
                                        type="file"
                                        className={`form-control ${errors.image ? "is-invalid" : ""}`}
                                        name="image"
                                        accept="image/*"
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: "#fff",
                                            borderRadius: "25px",
                                            border: "1px solid #dee2e6",
                                            padding: "10px",
                                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                            fontSize: "14px",
                                        }}
                                    />
                                    {errors.image && (
                                        <div className="invalid-feedback">{errors.image[0]}</div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: "none" }}>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    data-bs-dismiss="modal"
                                >
                                    Fermer
                                </button>
                                <button type="submit" className="btn btn-outline-success btn-sm">
                                    {editingId ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Produits;
