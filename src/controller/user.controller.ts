import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  userRegister,
  userLogin,
  decodeJwtToken,
} from "../service/user.service";
import { createUser, deleteUser, getAllUsers, getUserById, saveUser } from "../service/user.service";

// Register a new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const user = await userRegister(name, email, password, "user");
    res
      .status(201)
      .json({ status: 201, message: req.t("signup.signup-success"), user });
  } catch (error) {
    res
      .status(400)
      .json({ status: 400, message: req.t("signup.signup-failure") });
  }
});

// Login an user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await userLogin(email, password);
    res.status(200).json({
      status: 200,
      message: req.t("login.login-success"),
      token,
      user,
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: 400, message: req.t("login.login-failure") });
  }
});

export const verifyUser = asyncHandler((req: Request, res: Response) => {
  const token = req.body.token;
  const user = decodeJwtToken(token);
  if (user != null) {
    res.status(200).json({
      status: 200,
      message: req.t("login.authentication"),
      user: user,
    });
  } else
    res
      .status(401)
      .json({ status: 401, message: req.t("login.not-authentication") });
});

// crud
// Get all users
export const userList = async (req: Request, res: Response): Promise<void> => {
  const users = await getAllUsers();
  res.json(users);
};

// Get a specific user by ID
export const userDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await getUserById(parseInt(id))

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(user);
};

// Create a new user
export const userCreatePost = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  const newUser = createUser({ name, email, password, role })
  res.status(201).json(newUser);
};

// Update an existing user
export const userUpdatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const user = await getUserById(parseInt(id))
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  user.name = name;
  user.email = email;
  user.role = role;

  await saveUser(user)

  res.json(user);
};

// Delete a user
export const userDeletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await getUserById(parseInt(id))
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  await deleteUser(parseInt(id))

  res.status(204).json({ message: 'User deleted successfully' });
};
