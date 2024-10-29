import { Category } from "../entity/Category";
import { AppDataSource } from "../repos/db";

const categoryRepository = AppDataSource.getRepository(Category);
export async function getAllCategories() {
  return await categoryRepository.find({ order: { name: "ASC" } });
}
