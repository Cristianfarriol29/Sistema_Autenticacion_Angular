const UserRoutes = require('express').Router();
const { isAuth } = require('../../middlewares/auth.middleware');
const { register, login, logout, confirm, forgotPassword, verifyToken, newPassword, verifyAdminByEmail} = require('./users.controllers');

UserRoutes.post('/register', register);
UserRoutes.post('/login', login);
UserRoutes.get("/confirmar-usuario/:token", confirm);
UserRoutes.post("/olvide-password", forgotPassword);
UserRoutes.get("/olvide-password/:token", verifyToken);
UserRoutes.post("/nuevo-password/:token", newPassword);
UserRoutes.get("/verify-admin/:token", verifyAdminByEmail)
UserRoutes.post('/logout', [isAuth], logout);

module.exports = UserRoutes;