import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopHeader from './components/Navbar/TopHeader';
import Navbar from "./components/Navbar/Navbar";
import Home from './pages/Home/Home';
import Footer from "./components/Footer/footer";
import Produits from './pages/Produit/Produits';
import Commande from './pages/Commande/Commande';
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard/Dashboard';
import Utilisateurs from "./pages/Dashboard/Utilisateurs"; // ou le bon chemin
import FicheProduitAdmin from "./pages/Produit/FicheProduitAdmin";
import ModifierProduit from './pages/Produit/ModifierProduit';
import AjouterCommande from "./pages/Commande/AjouterCommande"; // adapte selon ton chemin
import ModifierCommande from "./pages/Commande/ModifierCommande"; // adapte selon ton chemin
import DetailsCommande from './pages/Commande/DetailsCommande';
import Devis from "./pages/Devis/Devis";
import DevisPage from "./pages/Devis/DevisPage";






function App() {
    return (
        <AuthProvider>
            <Router>
                <>
                    <TopHeader />
                    <Navbar />
                    <Routes>

                        {/* === Routes publiques === */}
                        <Route path="/" element={<Home />} />
                        <Route path="/produits" element={<Produits />} />
                        <Route path="/commandes" element={<Commande />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/devis" element={<DevisPage />} />

                        {/*
            La route pour les détails de commande en public.
            C'est une route absolue, donc pas de problème ici.
            Cependant, l'URL sera /commandes/:id, et non /dashboard/commandes/:id
          */}
                        <Route path="/commandes/:id" element={<DetailsCommande />} />

                        {/*
            === Routes protégées (imbriquées dans le Dashboard) ===
            Toutes les routes ici sont RELATIVES au chemin parent /dashboard
          */}
                        <Route path="/dashboard" element={<Dashboard />}>
                            {/* Utilisateurs */}
                            <Route path="utilisateurs" element={<Utilisateurs />} />

                            {/* Produits */}
                            <Route path="produits" element={<Produits />} />
                            <Route path="produits/:id" element={<FicheProduitAdmin />} />
                            <Route path="produits/:id/edit" element={<ModifierProduit />} />

                            {/* Commandes */}
                            <Route path="commandes" element={<Commande />} />
                            <Route path="commandes/:id" element={<DetailsCommande />} />
                            <Route path="commandes/ajouter" element={<AjouterCommande />} />
                            <Route path="commandes/:id/edit" element={<ModifierCommande />} />
                            <Route path="devis" element={<Devis />} />

                            {/* Autres routes du Dashboard */}
                            <Route path="factures" element={<div>Gestion factures</div>} />
                            <Route path="statistiques" element={<div>Statistiques</div>} />
                            <Route path="clients" element={<div>Clients</div>} />
                            <Route path="mes-produits" element={<div>Mes produits</div>} />
                            <Route path="mes-commandes" element={<div>Mes commandes</div>} />
                            <Route path="mes-devis" element={<div>Mes devis</div>} />
                            <Route path="mes-factures" element={<div>Mes factures</div>} />
                            <Route path="profil" element={<div>Mon profil</div>} />
                            <Route path="assistance" element={<div>Assistance</div>} />
                        </Route>

                    </Routes>
                    <Footer />
                </>
            </Router>
        </AuthProvider>
    );
}

export default App;
