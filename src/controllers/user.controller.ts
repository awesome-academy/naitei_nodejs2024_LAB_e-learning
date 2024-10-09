import { getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} from '../service/user.service';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const userList = 
    asyncHandler(async (req: Request, res: Response) => {
        const users = await getAllUsers();
        res.status(200).json(users); 
});

export const userDetails = 
    asyncHandler(async (req: Request, res: Response) => {
        const userId = parseInt(req.params.id); 
        const user = await getUserById(userId);
            
        if (user) {
            res.status(200).json(user); 
        } else {
            res.status(404).json({ message: 'User not found' }); 
        }
});

export const userCreateGet = 
    asyncHandler(async (req: Request, res: Response) => {
        res.status(200).json({ message: 'Display user creation form' }); 
});

export const userCreatePost = 
    asyncHandler(async (req: Request, res: Response) => {
        const newUserData = req.body; 
        const newUser = await createUser(newUserData);
        res.status(201).json(newUser); 
});

export const userDeleteGet = 
    asyncHandler(async (req: Request, res: Response) => {
        const userId = parseInt(req.params.id); 
        const user = await getUserById(userId);
            
        if (user) {
            res.status(200).json({ message: 'Confirm deletion of user', user }); 
        } else {
            res.status(404).json({ message: 'User not found' }); 
        }
});

export const userDeletePost = 
    asyncHandler(async (req: Request, res: Response) => {
        const userId = parseInt(req.params.id); 
        await deleteUser(userId); 
        res.status(204).send(); 
});

export const userUpdateGet = 
    asyncHandler(async (req: Request, res: Response) => {
        const userId = parseInt(req.params.id); 
        const user = await getUserById(userId);
            
        if (user) {
            res.status(200).json(user); 
        } else {
            res.status(404).json({ message: 'User not found' }); 
        }
});

export const userUpdatePost = 
    asyncHandler(async (req: Request, res: Response) => {
        const userToUpdate = await getUserById(parseInt(req.params.id));
        const updatedUserData = req.body; 
        if (!userToUpdate) {
            throw new Error('User not found');
        }
        const updatedUser = await updateUser(userToUpdate, updatedUserData);
            
        if (updatedUser) {
            res.status(200).json(updatedUser); 
        } else {
            res.status(404).json({ message: 'User not found' }); 
        }
});
