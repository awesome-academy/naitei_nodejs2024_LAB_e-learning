import { AppDataSource } from "../repos/db";
import { Cart } from "../entity/Cart";
import { User } from "../entity/User";
import { Course } from "../entity/Course";

const cartRepository = AppDataSource.getRepository(Cart)
const courseRepository = AppDataSource.getRepository(Course);
const userRepository = AppDataSource.getRepository(User);

export async function addToCart(userId: number, courseId: number) {
    const user = await userRepository.findOne({ where: { id: userId } });
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!user) throw new Error('User not found');
    if (!course) throw new Error('Course not found');
    let cartItem = await cartRepository.findOne({ where: { user, course } });
    if (!cartItem) {
        cartItem = cartRepository.create({ user, course });
    }
    await cartRepository.save(cartItem);
    return cartItem;
}

export async function getCart(userId: number) {
    return await cartRepository.find({
        where: { user: { id: userId } },
        relations: ['course']
    })
}

export async function getAmountOfCartItems (userId: number) {
    return await cartRepository.count({
        where: { user: { id: userId }}
    })
}

export async function getItemByCourseId(courseId: number) {
    return await cartRepository.findOne({
        where: { course: { id: courseId }}
    })
}

export async function getItemByUserAndCourseId(userId: number, courseId: number) {
    return await cartRepository.findOne({
        where: { 
            user: { id: userId },
            course: { id: courseId }
        }
    })
}

export async function updateCartItem(userId: number, courseId: number, itemData: Partial<Cart>) {
    const cartItem = await cartRepository.findOne({
        where: {
            user: { id: userId },
            course: { id: courseId }
        }
    })
    if (!cartItem) {
        throw new Error('Cart item not found');
    }
    return await cartRepository.update(cartItem.id, itemData) 
}

export async function removeFromCart(itemId: number) {
    await cartRepository.delete(itemId);
}
