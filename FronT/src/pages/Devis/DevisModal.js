import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './DevisPage.css'; // On importe le CSS ici aussi pour que les styles s'appliquent

const Modal = ({ children, onClose }) => {
    const [modalRoot, setModalRoot] = useState(null);

    useEffect(() => {
        // Cette fonction s'exécute seulement APRÈS que le composant est monté
        // et que le DOM est prêt.
        const rootElement = document.getElementById('modal-root');
        if (rootElement) {
            setModalRoot(rootElement);
        }
    }, []); // Le tableau vide [] garantit que cela ne s'exécute qu'une seule fois.

    // Si le children n'est pas fourni OU que le point d'ancrage n'a pas été trouvé, on ne rend rien.
    if (!children || !modalRoot) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="modal">
            <div className="modal-content">
                {children}
                <button
                    onClick={onClose}
                    className="button-close"
                    style={{ position: 'absolute', top: '15px', right: '15px' }}
                >
                    X
                </button>
            </div>
        </div>,
        modalRoot // Le point d'ancrage est maintenant une variable d'état
    );
};

export default Modal;