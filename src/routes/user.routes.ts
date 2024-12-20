import { Router } from "express";
import * as userController from "../controller/user.controller";

const router: Router = Router();

router.get("/signup", (req, res) => {
  res.render("signup", { title: req.t("home.signup"), pageUrl: "/signup" });
});

router.post("/register", userController.register);

router.get("/login", (req, res) => {
  res.render("login", { title: req.t("home.login"), pageUrl: "/login" });
});

router.post("/login", userController.login);
router.post("/verify", userController.verifyUser);

router.post("/logout", userController.logout);

router.get('/account', userController.getUserDetails);
router.post('/account/edit', userController.updateUserDetails);
router.post("/account/reset-password/:userId", userController.resetPassword);

export default router;
