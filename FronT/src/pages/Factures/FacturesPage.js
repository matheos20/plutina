import React, { useEffect, useState } from "react";
import api from "../../services/api"; // axios configuré
import { Modal, Button, Form } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./FacturesPage.css";

const FacturesPage = () => {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [commandes, setCommandes] = useState([]);
    const [selectedCommande, setSelectedCommande] = useState("");
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchFactures();
        fetchCommandes();
    }, []);

    // Fetch toutes les factures
    const fetchFactures = async () => {
        try {
            const res = await api.get("/factures");
            setFactures(res.data || []);
        } catch (err) {
            console.error("Erreur fetch factures:", err);
            setFactures([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch commandes disponibles pour génération de facture
    const fetchCommandes = async () => {
        try {
            const res = await api.get("/commandes/pour-facture");
            if (res.data.success && Array.isArray(res.data.commandes)) {
                setCommandes(res.data.commandes);
            } else {
                setCommandes([]);
            }
        } catch (err) {
            console.error("Erreur fetch commandes:", err);
            setCommandes([]);
        }
    };

    // Supprimer une facture
    const handleSupprimer = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette facture ?")) return;
        try {
            await api.delete(`/factures/${id}`);
            setFactures(factures.filter(f => f.id !== id));
            fetchCommandes();
        } catch (err) {
            console.error("Erreur suppression facture:", err);
            alert("Erreur suppression facture");
        }
    };

    // Générer une facture depuis une commande
    const handleGenerate = async () => {
        if (!selectedCommande) return alert("Veuillez sélectionner une commande.");
        setGenerating(true);
        try {
            const res = await api.post(`/factures/generer/${selectedCommande}`);
            if (res.data.facture) {
                setFactures([res.data.facture, ...factures]);
            }
            setShowModal(false);
            setSelectedCommande("");
            fetchCommandes();
        } catch (err) {
            console.error("Erreur génération facture:", err);
            alert(err.response?.data?.error || "Erreur génération facture");
        } finally {
            setGenerating(false);
        }
    };

    // Générer le PDF
    // Générer le PDF
    const handlePDF = (facture) => {
        // Vérification de sécurité des données
        if (!facture || !facture.commande || !Array.isArray(facture.commande.produits) || facture.commande.produits.length === 0) {
            return alert("Aucun produit dans cette facture !");
        }

        // Création du document PDF avec une taille A4
        const doc = new jsPDF({
            unit: "pt",
            format: "A4",
        });

        const margin = 40;
        let y = margin;
        const pageWidth = doc.internal.pageSize.getWidth();

        // En-tête de la facture
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50); // Texte gris foncé
        doc.setFont("helvetica", "normal");

        // Informations de l'entreprise (gauche)
        doc.setFont("helvetica", "bold");
        doc.text("Plutina SARL", margin, y);
        doc.setFont("helvetica", "normal");
        y += 15;
        doc.text("Adresse: Ambatobe", margin, y);
        y += 15;
        doc.text("Lot: 125 AB 001", margin, y);
        y += 15;
        doc.text("NIF: 00001548777", margin, y);
        y += 15;
        doc.text("Tel: 034 00 034 00", margin, y);

        // Informations du client (droite)
        const client = facture.user || {};
        const clientBlockX = pageWidth - margin - 150; // Aligner à droite
        doc.setFont("helvetica", "bold");
        doc.text("Facturé à:", clientBlockX, margin);
        doc.setFont("helvetica", "normal");
        doc.text(`${client.nom || ""} ${client.prenom || ""}`, clientBlockX, margin + 15);
        doc.text(`Email: ${client.email || ""}`, clientBlockX, margin + 30);
        if (client.adresse) {
            doc.text(`Adresse: ${client.adresse}`, clientBlockX, margin + 45);
        }

        // --- Lignes modifiées ---

        // Numéro de facture et date
        y = Math.max(y, margin + 60);
        y += 40; // AJOUT : Ajoute un espace de 40pt après les infos de l'entreprise/client

        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 62, 80); // Bleu foncé

        // MODIFICATION : Utilise la largeur de la page pour centrer le texte
        doc.text(`FACTURE #${facture.reference}`, pageWidth / 2, y + 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(127, 140, 141); // Gris
        doc.text(`Date de facture: ${new Date(facture.date_facture).toLocaleDateString()}`, pageWidth / 2, y + 40, { align: 'center' }); // MODIFICATION : Centre aussi la date de facture

        // Ligne de séparation
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + 55, pageWidth - margin, y + 55);

        // Tableau des produits
        const tableRows = facture.commande.produits.map(prod => [
            prod.reference || "",
            prod.designation || "",
            prod.pivot?.quantite || 0,
            `${parseFloat(prod.pivot?.prix_unitaire || 0).toFixed(2)} Ar`,
            `${parseFloat(prod.pivot?.prix_total || 0).toFixed(2)} Ar`,
        ]);

        autoTable(doc, {
            startY: y + 70,
            head: [["Réf", "Produit", "Quantité", "Prix Unitaire", "Total"]],
            body: tableRows,
            theme: 'striped', // Thème 'striped' pour un look moderne
            headStyles: {
                fillColor: [52, 152, 219], // Bleu distinctif
                textColor: 255,
                fontStyle: "bold",
                fontSize: 10,
            },
            styles: {
                fontSize: 9,
                cellPadding: 8,
                overflow: "linebreak",
            },
            margin: { left: margin, right: margin },
        });

        // Totaux
        const finalY = doc.lastAutoTable.finalY + 30;
        const totalTTC = parseFloat(facture.total || 0);
        const totalHT = totalTTC / 1.2;
        const TVA = totalTTC - totalHT;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);

        const totalsBlockX = pageWidth - margin - 150;
        doc.text("Résumé de la facture", totalsBlockX, finalY);

        doc.setFont("helvetica", "normal");
        doc.text(`Total HT : ${totalHT.toFixed(2)} Ar`, totalsBlockX, finalY + 20);
        doc.text(`TVA (20%) : ${TVA.toFixed(2)} Ar`, totalsBlockX, finalY + 35);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 62, 80);
        doc.text(`Total TTC : ${totalTTC.toFixed(2)} Ar`, totalsBlockX, finalY + 50);

        // Pied de page
        const footerY = doc.internal.pageSize.getHeight() - 40;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150); // Gris clair
        doc.text("Merci de votre confiance !", margin, footerY);
        doc.text("Plutina SARL | contact@plutina.mg", pageWidth - margin, footerY, { align: "right" });

        // Enregistrer le PDF
        doc.save(`Facture_${facture.reference}.pdf`);
    };
    return (
        <div className="factures-page">
            <h2>Liste des factures</h2>
            <Button onClick={() => setShowModal(true)} className="mb-3">
                Générer facture depuis commande
            </Button>

            {loading ? (
                <p>Chargement...</p>
            ) : factures.length === 0 ? (
                <p>Aucune facture disponible.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Client</th>
                        <th>Commande</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {factures.map(facture => (
                        <tr key={facture.id}>
                            <td>{facture.reference}</td>
                            <td>{new Date(facture.date_facture).toLocaleDateString()}</td>
                            <td>{facture.total}</td>
                            <td>{facture.user ? `${facture.user.nom} ${facture.user.prenom}` : "—"}</td>
                            <td>{facture.commande ? `#${facture.commande.id} (${facture.commande.etat})` : "—"}</td>
                            <td>
                                <Button size="sm" variant="danger" onClick={() => handleSupprimer(facture.id)} className="me-1">Supprimer</Button>
                                <Button size="sm" variant="success" onClick={() => handlePDF(facture)}>PDF</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Modal Générer facture */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Générer une facture</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {commandes.length === 0 ? (
                        <p>Aucune commande disponible pour générer une facture.</p>
                    ) : (
                        <Form>
                            <Form.Group>
                                <Form.Label>Sélectionnez une commande</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedCommande}
                                    onChange={e => setSelectedCommande(e.target.value)}
                                >
                                    <option value="">-- Choisir une commande --</option>
                                    {commandes.map(cmd => (
                                        <option key={cmd.id} value={cmd.id}>
                                            {`Commande #${cmd.id} | Client: ${cmd.client?.nom || cmd.id_client} | Début: ${cmd.debut_location ? new Date(cmd.debut_location).toLocaleString() : ""}`}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        disabled={generating || !selectedCommande || commandes.length === 0}
                    >
                        {generating ? "Génération..." : "Générer"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FacturesPage;
