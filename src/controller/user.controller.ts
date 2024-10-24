import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  userRegister,
  userLogin,
  decodeJwtToken,
  getUserById,
  saveUserDetails
} from "../service/user.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, phone_number, avatar, date_of_birth, gender, address, identity_card, additional_info } = req.body;
  try {
    const user = await userRegister(name, email, password, role, phone_number, avatar, date_of_birth, gender, address, identity_card, additional_info);
    res.status(201).json({ status: 201, message: req.t("signup.signup-success"), user });
  } catch (error) {
    if (error.message === "User already exists with this email or username") {
      res.status(400).json({ status: 400, message: error.message });
    } else {
      res.status(400).json({ status: 400, message: req.t("signup.signup-failure") });
    }
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await userLogin(email, password);

    if (req.session) {
      req.session.accessToken = token;
      req.session.user = user;
    }

    res.status(200).json({
      status: 200,
      message: req.t("login.login-success"),
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: req.t("login.login-failure") });
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

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: 500, message: req.t("logout.failure") });
        }
        res.clearCookie("connect.sid"); 
        return res.redirect("/");
      });
    } else {
      res
        .status(400)
        .json({ status: 400, message: req.t("logout.no-session") });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: req.t("logout.failure") });
  }
});

export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;

  if (!userId) {
    res.status(400).send('User not authenticated');
  }

  try {
    const user = await getUserById(parseInt(userId))
    if (user) {
      res.render('user-details', { user });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

export const updateUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  if (!userId) {
    res.status(400).send('User not authenticated');
  }
  const { name, phone_number, avatar, date_of_birth, gender, address, identity_card, additional_info } = req.body;

  try {
    const user = await getUserById(parseInt(userId))
    if (user) {
      user.name = name;
      user.phone_number = phone_number;
      user.avatar = avatar;
      user.date_of_birth = new Date(date_of_birth);
      user.gender = gender;
      user.address = address;
      user.identity_card = identity_card;
      user.additional_info = additional_info;

      await saveUserDetails(user);
      res.redirect('/account');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error updating user details');
  }
});
