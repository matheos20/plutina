import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ModifierProduit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        designation: '',
        quantite: '',
        reference: '',
        prix: '',
        image: null,
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchProduit = async () => {
            try {
                const response = await api.get(`/produits/${id}`);
                setFormData({
                    designation: response.data.designation,
                    quantite: response.data.quantite,
                    reference: response.data.reference,
                    prix: response.data.prix,
                    image: null,
                });
                setPreviewImage(response.data.image);
            } catch (error) {
                setErrorMessage("Erreur lors du chargement du produit.");
                console.error(error);
            }
        };

        fetchProduit();
    }, [id]);

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');
        setErrorMessage('');

        const data = new FormData();
        data.append('designation', formData.designation);
        data.append('quantite', formData.quantite);
        data.append('reference', formData.reference);
        data.append('prix', formData.prix);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await api.post(`/produits/${id}?_method=PUT`, data);
            setSuccessMessage("Produit modifié avec succès !");
            // Redirection après 2 secondes par exemple
            setTimeout(() => {
                navigate('/dashboard/produits');
            }, 2000);
        } catch (error) {
            if (error.response?.status === 422 && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrorMessage("Une erreur est survenue lors de la modification.");
                console.error(error);
            }
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '600px' }}>
            <h2>Modifier un produit</h2>

            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                <div className="mb-3">
                    <label>Désignation</label>
                    <input
                        type="text"
                        name="designation"
                        className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                        value={formData.designation}
                        onChange={handleChange}
                    />
                    {errors.designation && (
                        <div className="invalid-feedback">{errors.designation[0]}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label>Quantité</label>
                    <input
                        type="number"
                        name="quantite"
                        className={`form-control ${errors.quantite ? 'is-invalid' : ''}`}
                        value={formData.quantite}
                        onChange={handleChange}
                    />
                    {errors.quantite && (
                        <div className="invalid-feedback">{errors.quantite[0]}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label>Référence</label>
                    <input
                        type="text"
                        name="reference"
                        className={`form-control ${errors.reference ? 'is-invalid' : ''}`}
                        value={formData.reference}
                        onChange={handleChange}
                    />
                    {errors.reference && (
                        <div className="invalid-feedback">{errors.reference[0]}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label>Prix (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="prix"
                        className={`form-control ${errors.prix ? 'is-invalid' : ''}`}
                        value={formData.prix}
                        onChange={handleChange}
                    />
                    {errors.prix && (
                        <div className="invalid-feedback">{errors.prix[0]}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label>Image</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                        onChange={handleChange}
                    />
                    {errors.image && (
                        <div className="invalid-feedback">{errors.image[0]}</div>
                    )}
                </div>

                {previewImage && (
                    <div className="mb-3">
                        <p>Image actuelle :</p>
                        <img
                            src={`http://127.0.0.1:8000/storage/${previewImage}`}
                            alt="Image actuelle"
                            style={{ width: '200px', borderRadius: '8px' }}
                        />
                    </div>
                )}

                <button type="submit" className="btn btn-primary">
                    Mettre à jour
                </button>
            </form>
        </div>
    );
};

export default ModifierProduit;
