import { 
  userRegister, 
  userLogin, 
  decodeJwtToken, 
  getAllUser, 
  getUserById, 
  getCourseByUserId, 
  getPurchasedCoursesWithDetails, 
  saveUserDetails, 
  updateUserPassword, 
  formatFieldName 
} from '../service/user.service'; 
import { getCoursesByUserId, getSectionsWithLessons } from '../service/course.service';
import { calculateTotalTimeAndLessons } from '../service/lession.service';
import { AppDataSource } from '../repos/db';
import { DataSource, Repository } from "typeorm";
import { User } from '../entity/User'; 
import bcrypt from 'bcrypt';
import Jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { UserRegisterDto } from '../entity/dto/user.dto';
import { UserGenderType, UserRoleType } from '../enum/user.enum';
import { faker } from '@faker-js/faker/.';
import { Review } from '../entity/Review';
import { Course } from '../entity/Course';
import { CreateCourseDto } from '../entity/dto/course.dto';
import { Payment } from '../entity/Payment';
import { CreatePaymentDto } from '../entity/dto/payment.dto';

dotenv.config({ path: "test.env" });

let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

describe("userRegister", () => {
  it("should register a user successfully", async () => {
    const userData: UserRegisterDto = {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: "password",  
      role: UserRoleType.USER,
      phone_number: faker.phone.number(),
      date_of_birth: faker.date.past({ years: 20 }),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.string.uuid(),
      additional_info: faker.lorem.sentence(),
      department: '',
      years_of_experience: 0,
    };

    const user = await userRegister(
      userData.name,
      userData.email,
      userData.password,
      "user",
      userData.phone_number,
      '',
      userData.date_of_birth,
      "male",
      userData.address || '',
      userData.identity_card || '',
      userData.additional_info || '',
      userData.department,
      userData.years_of_experience
    );

    const savedUser = await AppDataSource.getRepository(User).findOne({
      where: { email: user.email },
    });

    if (savedUser) {
      expect(savedUser.name).toBe(user.name);
      expect(savedUser.email).toBe(user.email);
      expect(savedUser.password).not.toBe(userData.password); 
      expect(await bcrypt.compare(userData.password, savedUser.password)).toBe(true); 
    } else {
      throw new Error('Saved user is null or undefined');
    }
  });

  it("should throw an error if a user with the same email or username already exists", async () => {
    const userData: UserRegisterDto = {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: "password",  
      role: UserRoleType.USER,
      phone_number: faker.phone.number(),
      date_of_birth: faker.date.past({ years: 20 }),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.string.uuid(),
      additional_info: faker.lorem.sentence(),
      department: '',
      years_of_experience: 0,
    };

    // Register the first user
    const user = await userRegister(
      userData.name,
      userData.email,
      userData.password,
      "user",
      userData.phone_number,
      '',
      userData.date_of_birth,
      "male",
      userData.address || '',
      userData.identity_card || '',
      userData.additional_info || '',
      userData.department,
      userData.years_of_experience
    );

    const duplicateUserData = { ...userData, email: faker.internet.email() };

    // Attempt to register the second user with the same email
    await expect(userRegister(
      duplicateUserData.name,
      duplicateUserData.email,
      duplicateUserData.password,
      "user",
      duplicateUserData.phone_number,
      '',
      duplicateUserData.date_of_birth,
      "male",
      duplicateUserData.address || '',
      duplicateUserData.identity_card || '',
      duplicateUserData.additional_info || '',
      duplicateUserData.department,
      duplicateUserData.years_of_experience
    )).rejects.toThrow("User already exists with this email or username");
  });

  it("should set department and years_of_experience for professors", async () => {
    const professorData: UserRegisterDto = {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: "password",  
      role: UserRoleType.PROFESSOR,
      phone_number: faker.phone.number(),
      date_of_birth: faker.date.past({ years: 20 }),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.string.uuid(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 10 }),
    };

    const user = await userRegister(
      professorData.name,
      professorData.email,
      professorData.password,
      "professor",
      professorData.phone_number,
      '',
      professorData.date_of_birth,
      "female",
      professorData.address || '',
      professorData.identity_card || '',
      professorData.additional_info || '',
      professorData.department || '',
      professorData.years_of_experience
    );

    // Check if the professor's department and years_of_experience are saved correctly
    const savedUser = await AppDataSource.getRepository(User).findOne({
      where: { email: professorData.email },
    });

    if (savedUser) {
      expect(savedUser).toBeDefined();
      expect(savedUser.department).toBeTruthy();
      expect(savedUser.years_of_experience).toBeTruthy();
    } else {
      throw new Error('Saved user is null or undefined');
    }  
  });
});

describe("userLogin", () => {
  it("should return a token and user object for valid credentials", async () => {
    const plainTextPassword = "password";
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10)
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create({
      name: "Test User 2", 
      email: "test2@example.com",
      password: hashedPassword,
      role: UserRoleType.USER,
      phone_number: "1234567890",
      date_of_birth: "2020-11-01",
    });
    const savedUser = await userRepository.save(user);

    const logUser = await userRepository.findOne({ where: { email: user.email } })

    const result = await userLogin(savedUser.email, "password");

    expect(result).toHaveProperty("token");
    expect(result.user).toMatchObject({
      email: "test2@example.com",
      role: UserRoleType.USER,
    });
    const decoded = Jwt.verify(result.token, process.env.JWT_SECRET!);
    expect(decoded).toMatchObject({
      id: logUser?.id,
      email: "test2@example.com",
      role: UserRoleType.USER,
    });
  });

  it("should throw an error for invalid email", async () => {
    await expect(userLogin("invalid@example.com", "password")).rejects.toThrow(
      "Invalid email or password"
    );
  });

  it("should throw an error for incorrect password", async () => {
    const hashedPassword = await bcrypt.hash("password", 10);

    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create({
      name: "Test User", 
      email: "test@example.com",
      password: hashedPassword,
      role: UserRoleType.USER,
      phone_number: "1234567890",
      date_of_birth: "2020-11-01"
    });
    await userRepository.save(user);

    await expect(userLogin("test@example.com", "wrong_password")).rejects.toThrow(
      "Invalid email or password"
    );
  });
});

describe("decodeJwtToken", () => {
  it("should return decoded payload for a valid token", () => {
    const payload = { id: 1, email: "test@example.com" };
    const token = Jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

    const result = decodeJwtToken(token);

    expect(result).toMatchObject(payload);
  });

  it("should throw an error for an invalid token", () => {
    const invalidToken = "invalid_token";

    expect(() => decodeJwtToken(invalidToken)).toThrow("jwt malformed");
  });
});

describe("getAllUser", () => {
  beforeEach(async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.query('DELETE FROM comments WHERE review_id IS NOT NULL AND course_id IS NOT NULL AND user_id IS NOT NULL');
    await queryRunner.query('DELETE FROM reviews WHERE user_id IS NOT NULL AND course_id IS NOT NULL');
    await queryRunner.query('DELETE FROM courses WHERE professor_id IS NOT NULL');
    await queryRunner.query('DELETE FROM users WHERE id IS NOT NULL');

    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({})
    await queryRunner.release();

    await userRepository.save([
      {
        name: "Alice",
        email: "alice@example.com",
        password: "password1",
        role: "user",
        additional_info: "Additional Info for Alice",
        address: "123 Alice St",
        date_of_birth: "1990-01-01",
        phone_number: "1234567890",
        gender: "female",
      },
      {
        name: "Bob",
        email: "bob@example.com",
        password: "password2",
        role: "admin",
        additional_info: "Additional Info for Bob",
        address: "456 Bob Ave",
        date_of_birth: "1985-05-05",
        phone_number: "9876543210",
        gender: "male",
      },
    ]);
  });

  it("should return all users with specified fields, sorted by name", async () => {
    const result = await getAllUser();

    const sanitizedResult = result.map(({ id, ...rest }) => rest); 

    expect(sanitizedResult).toEqual([
      {
        additional_info: "Additional Info for Alice",
        address: "123 Alice St",
        date_of_birth: "1990-01-01",
        phone_number: "1234567890",
        gender: "female",
        name: "Alice",
        email: "alice@example.com",
        password: "password1",
        role: "user",
      },
      {
        additional_info: "Additional Info for Bob",
        address: "456 Bob Ave",
        date_of_birth: "1985-05-05",
        phone_number: "9876543210",
        gender: "male",
        name: "Bob",
        email: "bob@example.com",
        password: "password2",
        role: "admin",
      },
    ]);
  });
});

describe("getUserById", () => {
  let savedUser: User; 

  beforeEach(async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.query('DELETE FROM users WHERE id IS NOT NULL');

    const userRepository = AppDataSource.getRepository(User);
    
    savedUser = await userRepository.save({
      name: "Alice",
      email: "alice@example.com",
      password: "password1",
      role: "user",
      additional_info: "Additional Info for Alice",
      address: "123 Alice St",
      date_of_birth: "1990-01-01",
      phone_number: "1234567890",
      gender: "female",
    });

    await queryRunner.release();
  });

  it("should return the user object if the user exists", async () => {
    const result = await getUserById(savedUser.id);

    const sanitizedResult = { ...result };
    delete (sanitizedResult as { id?: number }).id;
    const sanitizedExpected = { ...savedUser };
    delete (sanitizedExpected as { id?: number }).id; 

    expect(sanitizedResult).toEqual(sanitizedExpected);
  });

  it("should return null if the user does not exist", async () => {
    const result = await getUserById(999); 
    expect(result).toBeNull();
  });
});

describe("getCourseByUserId", () => {
  let savedCourse: CreateCourseDto;
  beforeEach(async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);

    await queryRunner.query('DELETE FROM courses WHERE id IS NOT NULL');

    const professor = await userRepository.save({
      name: "Professor John",
      email: "profjohn@example.com",
      password: "password123",
      role: "professor", 
      additional_info: "Professor of Computer Science",
      address: "123 Campus Rd",
      date_of_birth: "1970-05-15",
      phone_number: "5551234567",
      gender: "male",
    });

    savedCourse = await courseRepository.save({
      title: faker.company.catchPhrase(), 
      name: faker.commerce.productName(), 
      price: parseFloat(faker.commerce.price()), 
      description: faker.lorem.sentence(), 
      average_rating: Math.random() * 5,
      category_id: Math.floor(Math.random() * 100) + 1,
      professor_id: professor.id, 
    });

    await queryRunner.release(); 
  });

  it("should return the course object for the given user ID", async () => {
    const result = await getCourseByUserId(savedCourse.professor_id ?? 1); 

    const sanitizedResult = { ...result };
    delete (sanitizedResult as { id?: number }).id;

    const sanitizedExpected = { ...savedCourse };
    delete (sanitizedExpected as { id?: number }).id;

    expect(sanitizedResult).toEqual(sanitizedExpected);
  });

  it("should return null if no course is found", async () => {
    const result = await getCourseByUserId(999); 

    expect(result).toBeNull();
  });
});

describe("getPurchasedCoursesWithDetails", () => {
  let professor: User
  let course1Title: string;
  let course2Title: string;
  beforeEach(async () => {
    const userRepository = await AppDataSource.getRepository(User);
    const paymentRepository = await AppDataSource.getRepository(Payment); 
    const courseRepository =  await AppDataSource.getRepository(Course);
    paymentRepository.delete({});
    courseRepository.delete({});

    professor = await userRepository.save({
      name: faker.person.fullName(), 
      email: faker.internet.email(), 
      password: faker.internet.password(), 
      role: "professor", 
      additional_info: faker.lorem.sentence(), 
      address: faker.location.streetAddress(), 
      date_of_birth: faker.date.past({ years: 50 }).toISOString().split('T')[0], 
      phone_number: faker.phone.number(), 
      gender: "male",
    });

    const course1 = await AppDataSource.getRepository(Course).save({        
      name: faker.commerce.productName(),   
      description: faker.lorem.sentence(),   
      price: parseFloat(faker.commerce.price()),  
      professor_id: professor.id,
      category_id: 1
    });

    const course2 = await AppDataSource.getRepository(Course).save({         
      name: faker.commerce.productName(),   
      description: faker.lorem.sentence(),   
      price: parseFloat(faker.commerce.price()),  
      professor_id: professor.id,
      category_id: 1
    });

    await paymentRepository.save({
      amount: Math.random() * 1000 + 1,
      status: "pending",
      payment_date: new Date(),
      user_id: professor.id,
      course_id: course1.id
    });

    await paymentRepository.save({
      amount: Math.random() * 1000 + 1,
      status: "done",
      payment_date: new Date(),
      user_id: professor.id,
      course_id: course2.id
    });

    course1Title = course1.name;
    course2Title = course2.name;
  });

  it("should return purchased courses with their details", async () => {
    const result = await getPurchasedCoursesWithDetails(professor.id); 

    const compare = await getCoursesByUserId(professor.id)

    expect(result).toEqual(compare)
  });

  it("should return an empty array if no payments or courses exist", async () => {
    const result = await getPurchasedCoursesWithDetails(1);
    expect(result).toEqual([]);
  });
});

describe("saveUserDetails", () => {
  beforeEach(async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.query('DELETE FROM payments WHERE user_id IS NOT NULL AND course_id IS NOT NULL');
    await queryRunner.query('DELETE FROM courses WHERE professor_id IS NOT NULL');
    await queryRunner.query('DELETE FROM users WHERE id IS NOT NULL');

    const userRepository = AppDataSource.getRepository(User);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const courseRepository = AppDataSource.getRepository(Course);
    
    await paymentRepository.delete({});
    await userRepository.delete({});
    await courseRepository.delete({})

    await queryRunner.release();
  });

  it("should save and return the user object when a valid User entity is provided", async () => {
    const user: User = {
      id: 1,
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.phone.number(),
      avatar: faker.image.avatar(),
      date_of_birth: new Date("2001-03-25"),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.string.uuid(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: 0,
      cart: [],
      review: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await saveUserDetails(user);

    const savedUser = await AppDataSource.getRepository(User).findOneBy({ id: 1 });
    expect(savedUser).not.toBeNull();
    expect(savedUser).toEqual(expect.objectContaining(user));
  });
});

describe("updateUserPassword", () => {
  beforeEach(async () => {
    await AppDataSource.getRepository(User).delete({})
  });

  it("should update the password and return true if the user exists", async () => {
    const user: User = {
      id: 1,
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: "old_password",
      role: UserRoleType.USER,
      phone_number: faker.phone.number(),
      avatar: faker.image.avatar(),
      date_of_birth: new Date("2001-03-25"),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.string.uuid(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: 0,
      cart: [],
      review: [],
      created_at: new Date(),
      updated_at: new Date()
    };
    await AppDataSource.getRepository(User).save(user);  

    await updateUserPassword(1, "new_password"); 

    const updatedUser = await AppDataSource.getRepository(User).findOne({ where: { id: 1 } });

    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.password).not.toBe("old_password");
    const passwordMatches = await bcrypt.compare("new_password", updatedUser?.password || "");
    expect(passwordMatches).toBe(true);
  });

  it("should return false if the user does not exist", async () => {
    const result = await updateUserPassword(999, "new_password");  

    expect(result).toBe(false);
  });
});

describe("formatFieldName", () => {
  it("should format field names correctly", () => {
    expect(formatFieldName("user_name")).toBe("User Name");
    expect(formatFieldName("date_of_birth")).toBe("Date Of Birth");
  });

  it("should handle already formatted field names", () => {
    expect(formatFieldName("User Name")).toBe("User Name");
  });
});
