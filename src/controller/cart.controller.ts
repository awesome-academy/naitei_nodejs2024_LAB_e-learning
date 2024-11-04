import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addToCart,
  getCart,
  getItemByCourseId,
  getItemByUserAndCourseId,
  removeFromCart,
  updateCartItem,
} from "../service/cart.service";

export const viewCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  try {
    const cartItems = await getCart(userId);
    req.session!.cart = cartItems;
    res.render("cart", {
      cartItems,
      title: req.t("home.cart"),
      message: req.t("home.message"),
    });
  } catch (error) {
    res.status(400).render("error", { error: error.message });
  }
});

export const addItemToCartGet = asyncHandler(
  async (req: Request, res: Response) => {
    const courseId = parseInt(req.query.courseId as string);
    const userId = req.session!.user?.id;

    if (!courseId || !userId) {
      return res.status(400).redirect("/cart");
    }

    try {
      const existingItem = await getItemByUserAndCourseId(userId, courseId);
      if (existingItem) {
        // item already exists
      } else {
        await addToCart(userId, courseId);
      }
      res.redirect("/cart");
    } catch (error) {
      res.status(400).render("error", { error: error.message });
    }
  }
);

export const addItemToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.body;
    const userId = req.session!.user?.id;
    try {
      const existingItem = await getItemByUserAndCourseId(userId, courseId);
      if (existingItem) {
        // item already exists
      } else {
        await addToCart(userId, courseId);
      }
      res.redirect("/cart");
    } catch (error) {
      res.status(400).render("error", { error: error.message });
    }
  }
);

export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const itemId = req.body.itemId;
    try {
      await removeFromCart(parseInt(itemId));
      res.json({ success: true, message: req.t("cart.remove_msg") });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);
