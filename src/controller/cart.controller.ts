import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import { addToCart, 
    getCart, 
    getItemByCourseId, 
    getItemByUserAndCourseId, 
    removeFromCart, 
    updateCartItem
} from '../service/cart.service';

export const viewCart = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.session!.user?.id;  
        try { 
            const cartItems = await getCart(userId);
            req.session!.cart = cartItems;
            res.render('cart', { cartItems })
        } catch (error) {
            res.status(400).render("error", { error: error.message });
        }
    }
)

export const addItemToCartGet = asyncHandler(
    async (req: Request, res: Response) => {
        const courseId = parseInt(req.query.courseId as string);
        const userId = req.session!.user?.id;
        
        if (!courseId || !userId) {
            return res.status(400).redirect('/cart');
        }

        try {
            const existingItem = await getItemByUserAndCourseId(userId, courseId);
            if (existingItem) {
                // item already exists
            } else {
                await addToCart(userId, courseId);
            }
            res.redirect('/cart'); 
        } catch (error) {
            res.status(400).render("error", { error: error.message });
        }
    }
)

export const addItemToCart = asyncHandler(
    async (req: Request, res: Response) => {
        const { courseId } = req.body
        const userId = req.session!.user?.id;
        try {
            const existingItem = await getItemByUserAndCourseId(userId, courseId)
            if (existingItem) {
                // item already exists
            } else {
                await addToCart(userId, courseId);
            }
            res.redirect('/cart');
        } catch (error) {
            res.status(400).render("error", { error: error.message });
        }
    }
)

// export const itemQuantityIncrease = asyncHandler(
//     async (req: Request, res: Response) => {
//         const userId = req.session!.user?.id;  
//         const cart = await getCart(userId);
//         const courseId = parseInt(req.body.courseId)
//         const item = await getItemByCourseId(courseId)
//         if (item) {
//             item.quantity += 1
//             await updateCartItem(userId, courseId, item)
//         } else {
//             res.status(404).send('Item not found in cart');
//             return;
//         }
//         req.session!.cart = cart;
//         console.log(req.session!.cart)
//         res.redirect('/cart');
//     }
// )

// export const itemQuantityDecrease = asyncHandler(
//     async (req: Request, res: Response) => {
//         const userId = req.session!.user?.id;  
//         const cart = await getCart(userId);
//         const courseId = parseInt(req.body.courseId)
//         const item = await getItemByCourseId(courseId)
//         if (item) {
//             if (item.quantity <= 1) {
//                 await removeFromCart(item.id)
//             } else {
//                 item.quantity -= 1
//                 await updateCartItem(userId, courseId, item)
//             }       
//         } else {
//             res.status(404).send('Item not found in cart');
//             return;
//         }
//         req.session!.cart = cart;
//         console.log(req.session!.cart)
//         res.redirect('/cart');
//     }
// )

export const removeItemFromCart = asyncHandler(
    async (req: Request, res: Response) => {
        const itemId = req.body.itemId
        try {
            await removeFromCart(parseInt(itemId));
            res.redirect('/cart');
        } catch (error) {
            res.status(400).render("error", { error: error.message });
        }
    }  
)
