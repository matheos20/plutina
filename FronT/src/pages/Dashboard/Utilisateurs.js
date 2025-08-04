import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Utilisateurs.css";

Modal.setAppElement('#root');

const Utilisateurs = () => {
    const { user } = useContext(AuthContext);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage] = useState(5); // tu peux ajuster le nombre par page


    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "client",
    });

    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        fetchUtilisateurs(currentPage);
    }, [currentPage]);

    const fetchUtilisateurs = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/utilisateurs?page=${page}&limit=${perPage}`);
            setUtilisateurs(response.data.data);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (err) {
            setError("Erreur lors du chargement des utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

        try {
            await api.delete(`/utilisateurs/${id}`);
            setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
        } catch {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleEdit = (utilisateur) => {
        setFormData({
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            password: "",
            role: utilisateur.role,
        });
        setEditMode(true);
        setEditingUserId(utilisateur.id);
        setModalIsOpen(true);
        setFormError(null);
        setFormSuccess(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        try {
            if (editMode) {
                await api.put(`/utilisateurs/${editingUserId}`, formData);
                setFormSuccess("Utilisateur modifié avec succès !");
            } else {
                await api.post('/utilisateurs', formData);
                setFormSuccess("Utilisateur ajouté avec succès !");
            }

            fetchUtilisateurs();
            setModalIsOpen(false);
            setFormData({
                nom: "",
                prenom: "",
                email: "",
                password: "",
                role: "client",
            });
            setEditMode(false);
            setEditingUserId(null);
        } catch (err) {
            if (err.response) {
                setFormError("Erreur : " + (err.response.data.message || "Erreur serveur"));
            } else {
                setFormError("Erreur de connexion au serveur");
            }
        }
    };

    const openAjoutModal = () => {
        setEditMode(false);
        setEditingUserId(null);
        setFormData({
            nom: "",
            prenom: "",
            email: "",
            password: "",
            role: "client",
        });
        setModalIsOpen(true);
        setFormError(null);
        setFormSuccess(null);
    };

    if (!user) {
        return <p>Chargement...</p>;
    }

    return (
        <div>
            <div className="utilisateurs-header">
                <h2>Gestion des utilisateurs</h2>
                <button onClick={openAjoutModal}>+ Ajouter</button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading ? (
                <p>Chargement des utilisateurs...</p>
            ) : (
                <>
                <table className="table-utilisateurs">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {utilisateurs.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.nom}</td>
                            <td>{u.prenom}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                                <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => handleEdit(u)} style={{ marginLeft: "10px",background: "#6ce505",borderRadius: "25px" }}>Modifier</button>
                                <button onClick={() => handleDelete(u.id)} style={{ marginLeft: "10px",background: "#e30808fc",borderRadius: "25px" }}>Supprimer</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="pagination">
                <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn-pagination">
                Précédent
                </button>
                <span>Page {currentPage} sur {lastPage}</span>
                <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn-pagination" >
                Suivant
                </button>
                </div>
                </>
            )}

            {/* MODAL */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Formulaire utilisateur"
                style={{
                    content: {
                        maxWidth: '388px',
                        margin: 'auto',
                        padding: '2rem',
                        height: 'fit-content'
                    }
                }}
            >
                <h3 className="modal-titre">{editMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h3>
                {formError && <p style={{ color: "red" }}>{formError}</p>}
                <form onSubmit={handleSubmit} className="modal-content">
                    <div>
                        <input
                            type="text"
                            name="nom"
                            placeholder="Nom"
                            value={formData.nom}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="prenom"
                            placeholder="Prénom"
                            value={formData.prenom}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required={!editMode}
                        />
                    </div>
                    <div>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="admin">Admin</option>
                            <option value="receptionniste">Réceptionniste</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                    <div className="modal-buttons">
                        <button type="submit" className="btn-submit">
                            {editMode ? "Modifier" : "Ajouter"}
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => setModalIsOpen(false)} style={{ marginLeft: "10px" }}>
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Utilisateurs;
