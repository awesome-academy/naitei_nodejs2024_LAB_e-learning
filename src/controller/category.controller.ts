import { Request, Response } from "express";
import { getAllCategories } from "../service/category.service";
import asyncHandler from "express-async-handler";

export const getAllCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categories = await getAllCategories();
    res.json({ categories });
  }
);
