import { AppDataSource } from "../repos/db";
import { User } from "../entity/User";
import { Course } from "../entity/Course";
import { Payment } from "../entity/Payment";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";


import { calculateTotalTimeAndLessons } from "../service/lession.service";
import { getSectionsWithLessons, getUserPurchasedCourses } from "../service/course.service";

const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);
const paymentRepository = AppDataSource.getRepository(Payment);


export const userRegister = async (
  name: string,
  email: string,
  password: string,
  role: string,
  phone_number: string,
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

export const getUserById = async (userId: number) => {
  return await userRepository.findOne({
    where: { id: userId }
  });
}

export const getCourseByUserId= async (userId: number) => {
  return await courseRepository.findOne({
    where: { id: userId }
  });
}


interface CourseDetails {
  course: Course;
  totalHours: number;
}

export async function getPurchasedCoursesWithDetails(userId: number): Promise<CourseDetails[]> {

  const payments = await paymentRepository.find({
    where: { user_id: userId, status: 'done' },
    relations: ['course'],
  });

  const coursesWithDetails: CourseDetails[] = [];

  for (const payment of payments) {
    const course = payment.course;
    if (course) {
      let totalHours = 0;
      const sections = await getSectionsWithLessons(course.id);

      for (const section of sections) {
        const { total_time } = await calculateTotalTimeAndLessons(section.id);
        totalHours += total_time;
      }

      coursesWithDetails.push({ course, totalHours });
    }
  }

  return coursesWithDetails;
}

export async function saveUserDetails(user: User) {
  return await userRepository.save(user)
}


export const updateUserPassword = async (userId: number, newPassword: string): Promise<boolean> => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.SALT));
  user.password = hashedPassword;

  await userRepository.save(user);
  return true;
};