import { AppDataSource } from '../repos/db';
import { User } from '../entity/User';
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async () => {
  return await userRepository.find({
    order: { name: 'ASC'},
  });
};

export const getUserById = async (id: number) => {
  return await userRepository.findOne({
    where: { id: id },
  });
};

export const createUser = async (userData: Partial<User>) => {
  return await userRepository.save(new User(userData));
};

export const updateUser = async (userToUpdate: User, userData: Partial<User>) => {
  Object.assign(userToUpdate, userData);
  return await userRepository.save(userToUpdate);
};

export const deleteUser = async (id: number) => {
  return await userRepository.delete(id);
};

export const saveUser = async (user: User) => {
  return await userRepository
}

export const userRegister = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  // Check exist
  const existingUser = await userRepository.findOne({
    where: { email },
  });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT));

  // create new user and save
  const user = userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return await userRepository.save(user);
};

export const userLogin = async (email: string, password: string) => {
  // find user by email
  const user = await userRepository.findOne({
    where: { email },
  });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = Jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return { token, user };
};

export const decodeJwtToken = (token: string) => {
  return Jwt.verify(token, process.env.JWT_SECRET!);
};

