import { AppDataSource } from "../repos/db";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export const userRegister = async (
  name: string,
  email: string,
  password: string,
  role: string,
  phone_number: number,
  avatar: string,
  date_of_birth: Date,
  gender: string,
  address: string,
  identity_card: string,
  additional_info: string
) => {
  const existingUser = await userRepository.findOne({
    where: [{ email }, { name }],
  });
  if (existingUser) {
    throw new Error("User already exists with this email or username");
  }

  const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT));

  const user = userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone_number,
    avatar,
    date_of_birth,
    gender,
    address,
    identity_card,
    additional_info
  });

  return await userRepository.save(user);
};

export const userLogin = async (email: string, password: string) => {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

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

export async function getAllUser() {
  return await userRepository.find({ 
    select : ['id','additional_info','address', 'date_of_birth','phone_number', 'gender', 'name', 'email', 'password', 'role'],
    order: {name: 'ASC'},
   }); 
};