import { Router } from "express";
import * as userController from "../controller/user.controller";
import { isAdmin } from "../middleware/roleCheckMiddleware";

const router: Router = Router();

// Render the signup form
router.get("/signup", (req, res) => {
  res.render("signup", { title: req.t("home.signup"), pageUrl: "/signup" });
});

router.post("/register", userController.register);

// Render the login form
router.get("/login", (req, res) => {
  res.render("login", { title: req.t("home.login"), pageUrl: "/login" });
});

router.post("/login", userController.login);
router.post("/verify", userController.verifyUser);

// crud
// Public access: Get the list of users
router.get('/', userController.userList);

// Admin only: Create new user
router.post('/create', isAdmin, userController.userCreatePost);

// Public access: Get details of a specific user
router.get('/:id', userController.userDetails);

// Admin only: Update an existing user
router.post('/:id/update', isAdmin, userController.userUpdatePost);

// Admin only: Delete a user
router.post('/:id/delete', isAdmin, userController.userDeletePost);

export default router;
