// Verifie que l'utilisateur connecte a le bon role pour acceder a la route

// On utilise ...roles pour accepter un ou plusieurs roles autorises
const autoriser = (...rolesAutorises) => {
    return (req, res, next) => {
        // req.utilisateur a ete rempli par le middleware d'authentification juste avant
        const roleUtilisateur = req.utilisateur?.role;

        if (!roleUtilisateur || !rolesAutorises.includes(roleUtilisateur)) {
            return res.status(403).json({
                message: `Acces interdit : cette action est reservee aux ${rolesAutorises.join(', ')}.`,
            });
        }

        next();
    };
};

module.exports = { autoriser };
