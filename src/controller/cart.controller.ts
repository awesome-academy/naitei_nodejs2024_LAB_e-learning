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
import { validateOrReject } from "class-validator";
import { addItemToCartDTO, CartDTO } from "src/entity/dto/cart.dto";

export const viewCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session!.user?.id;
  const cartData = new CartDTO();
  cartData.userId = parseInt(userId);
  try {
    // await validateOrReject(cartData)
    const cartItems = await getCart(userId);
    req.session!.cart = cartItems;
    res.render("cart", {
      cartItems,
      title: req.t("home.cart"),
      message: req.t("home.message"),
    });
  } catch (error) {
    if (Array.isArray(error) && error[0].constraints) {
      // Handle validation errors
      const validationErrors = error.map(err => Object.values(err.constraints)).flat();
      res.status(400).render("error", { error: validationErrors.join(', ') });
    } else {
      res.status(400).render("error", { error: error.message });
    }
  }
});

export const addItemToCartGet = asyncHandler(
  async (req: Request, res: Response) => {
    const courseId = parseInt(req.query.courseId as string);
    const userId = req.session!.user?.id;

    const cartData = new addItemToCartDTO();
    cartData.userId = parseInt(userId);
    cartData.courseId = courseId;

    if (!courseId || !userId) {
      return res.status(400).redirect("/cart");
    }

    try {
      // await validateOrReject(cartData)
      const existingItem = await getItemByUserAndCourseId(userId, courseId);
      if (existingItem) {
        // item already exists
      } else {
        await addToCart(userId, courseId);
      }
      res.redirect("/cart");
    } catch (error) {
      if (Array.isArray(error) && error[0].constraints) {
        // Handle validation errors
        const validationErrors = error.map(err => Object.values(err.constraints)).flat();
        res.status(400).render("error", { error: validationErrors.join(', ') });
      } else {
        res.status(400).render("error", { error: error.message });
      }
    }
  }
);

export const addItemToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.body;
    const userId = req.session!.user?.id;

    const cartData = new addItemToCartDTO();
    cartData.userId = parseInt(userId);
    cartData.courseId = courseId;

    try {
      // await validateOrReject(cartData) // validate data
      const existingItem = await getItemByUserAndCourseId(userId, courseId);
      if (existingItem) {
        // item already exists
      } else {
        await addToCart(userId, courseId);
      }
      res.redirect("/cart");
    } catch (error) {
      if (Array.isArray(error) && error[0].constraints) {
        // Handle validation errors
        const validationErrors = error.map(err => Object.values(err.constraints)).flat();
        res.status(400).render("error", { error: validationErrors.join(', ') });
      } else {
        res.status(400).render("error", { error: error.message });
      }
    }
  }
);

export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    try {
      await removeFromCart(itemId);
      res.json({ success: true, message: req.t("cart.item-remove-success") });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);
