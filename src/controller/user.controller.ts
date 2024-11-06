import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validateOrReject } from "class-validator";
import {
  userRegister,
  userLogin,
  decodeJwtToken,
  getUserById,
  saveUserDetails,
  getPurchasedCoursesWithDetails,
  updateUserPassword,
  formatFieldName
} from "../service/user.service";
import { getEnrollmentWithCourseAndUser } from "../service/enrollment.service";
import {
  getSectionsWithLessons,
  countEnrolledUsersInCourse,
  getCoursesByUserId,
} from "../service/course.service";
import { UserRegisterDto, UserLoginDto, UpdateUserDto } from 'src/entity/dto/user.dto';
import { UserGenderType, UserRoleType } from "src/enum/user.enum";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData = new UserRegisterDto();
  userData.name = req.body.name
  userData.email = req.body.email
  userData.password = req.body.password
  userData.role = req.body.role ? req.body.role : UserRoleType.USER
  userData.phone_number = req.body.phone_number
  userData.date_of_birth = req.body.date_of_birth
  userData.gender = req.body.gender ? req.body.gender : UserGenderType.MALE
  userData.address = req.body.address ? req.body.address : undefined
  userData.identity_card = req.body.identity_card ? req.body.identity_card : undefined
  userData.additional_info = req.body.additional_info ? req.body.additional_info : undefined
  if (userData.role == UserRoleType.PROFESSOR) {
    userData.department = req.body.department ? req.body.department : undefined
    userData.years_of_experience = req.body.years_of_experience ? parseInt(req.body.years_of_experience) : 0
  } else {
    userData.department = undefined
    userData.years_of_experience = undefined
  }

  const {
    name,
    email,
    password,
    role,
    phone_number,
    avatar,
    date_of_birth,
    gender,
    address,
    identity_card,
    additional_info,
    department,
    years_of_experience,
  } = req.body;

  try {
    await validateOrReject(userData)
    
    const user = await userRegister(
      name,
      email,
      password,
      role,
      phone_number,
      avatar,
      date_of_birth,
      gender,
      address,
      identity_card,
      additional_info,
      department,
      years_of_experience
    );

    res
      .status(201)
      .json({ status: 201, message: req.t("signup.signup-success"), user });
  } catch (error) {
    if (Array.isArray(error) && error[0].constraints) {
      const validationErrors = error.reduce((acc, err) => {
        acc[err.property] = Object.values(err.constraints).join(", ");
        return acc;
      }, {});
      // console.log(validationErrors)
      res.status(400).json({ status: 400, errors: validationErrors });
    } else {
      const message =
        error.message === req.t("user.user_error")
          ? error.message
          : req.t("signup.signup-failure");
      res.status(400).json({ status: 400, message });  
    }
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const userLoginData = new UserLoginDto()
  userLoginData.email = req.body.email
  userLoginData.password = req.body.password
  try {
    await validateOrReject(userLoginData);
    const { token, user } = await userLogin(userLoginData.email, userLoginData.password);

    if (req.session) {
      req.session.accessToken = token;
      req.session.user = user;
    }

    res.status(200).json({
      status: 200,
      message: req.t("login.login-success"),
      token,
      user,
    });
  } catch (error) {
    if (Array.isArray(error) && error[0].constraints) {
      const validationErrors = error.reduce((acc, err) => {
        acc[err.property] = Object.values(err.constraints).join(", ");
        return acc;
      }, {});
      // console.log(validationErrors)
      res.status(400).json({ status: 400, errors: validationErrors });
    } else {
      const message =
        error.message === req.t("user.user_error")
          ? error.message
          : req.t("signup.signup-failure");
      res.status(400).json({ status: 400, message });  
    }  
  }
});

export const verifyUser = asyncHandler((req: Request, res: Response) => {
  const token = req.body.token;
  const user = decodeJwtToken(token);
  if (user != null) {
    res.status(200).json({
      status: 200,
      message: req.t("login.authentication"),
      user: user,
    });
  } else
    res
      .status(401)
      .json({ status: 401, message: req.t("login.not-authentication") });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: 500, message: req.t("logout.failure") });
        }
        res.clearCookie("connect.sid");
        return res.redirect("/");
      });
    } else {
      res
        .status(400)
        .json({ status: 400, message: req.t("logout.no-session") });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: req.t("logout.failure") });
  }
});

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.session?.user?.id;
    const isLoggedIn = Boolean(userId);

    if (!userId) {
      return res
        .status(404)
        .render("error", { message: req.t("user.user_authenticated") });
    }

    try {
      const coursesWithDetails = await getPurchasedCoursesWithDetails(userId);
      const user = await getUserById(parseInt(userId, 10));

      if (!user) {
        return res
          .status(404)
          .render("error", { message: req.t("user.user_not_found") });
      }

      const courseDetailsList = [];
      const professorCourses = []; 

      for (const courseDetails of coursesWithDetails) {
        const courseId = courseDetails.course.id;

        const enrollment = await getEnrollmentWithCourseAndUser(
          Number(userId),
          Number(courseId)
        );

        if (!enrollment || !enrollment.course) {
          continue;
        }

        const sectionsWithLessons = await getSectionsWithLessons(
          Number(courseId)
        );

        const totalHours = sectionsWithLessons.reduce(
          (sum, section) => sum + section.total_time,
          0
        );
        const totalLessons = sectionsWithLessons.reduce(
          (sum, section) => sum + section.lessons.length,
          0
        );
        const totalStudents = await countEnrolledUsersInCourse(
          Number(courseId)
        );

        courseDetailsList.push({
          course: courseDetails.course,
          totalHours,
          totalLessons,
          totalStudents,
          enrollment,
          sectionsWithLessons,
          userId: req.session!.user?.id
        });
      }

      if (user.role === UserRoleType.PROFESSOR) {
        const professorCourseDetails = await getCoursesByUserId(userId); 

        for (const courseDetails of professorCourseDetails) {
          const courseId = courseDetails.id;

          const sectionsWithLessons = await getSectionsWithLessons(
            Number(courseId)
          );

          const totalHours = sectionsWithLessons.reduce(
            (sum, section) => sum + section.total_time,
            0
          );
          const totalLessons = sectionsWithLessons.reduce(
            (sum, section) => sum + section.lessons.length,
            0
          );

          professorCourses.push({
            course: courseDetails,
            totalHours,
            totalLessons,
            sectionsWithLessons,
          });
        }
      }

      res.render("user-details", {
        user,
        coursesWithDetails,
        courseDetailsList,
        professorCourses, 
        isLoggedIn,
        t: req.t,
        title: req.t("home.account"),
        message: req.t("home.message"),
      });
    } catch (error) {
      return res
        .status(404)
        .render("error", { message: req.t("user.server_error") });
    }
  }
);

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.session!.user?.id;
    if (!userId) {
      return res
        .status(404)
        .render("error", { message: req.t("user.user_authenticated") });
    }
    const userData = new UpdateUserDto()
    userData.additional_info = req.body.additional_info ? req.body.additional_info : undefined
    userData.address = req.body.address ? req.body.address : undefined
    userData.avatar = req.body.avatar ? req.body.avatar : undefined
    userData.date_of_birth = req.body.date_of_birth ? req.body.date_of_birth : undefined
    userData.department = req.body.department ? req.body.department : undefined
    userData.gender = req.body.gender ? req.body.gender : undefined
    userData.identity_card = req.body.identity_card ? req.body.identity_card : undefined
    userData.name = req.body.name ? req.body.name : undefined
    userData.phone_number = req.body.phone_number ? req.body.phone_number : undefined 
    userData.years_of_experience = req.body.years_of_experience ? parseInt(req.body.years_of_experience) : 0

    const {
      name,
      phone_number,
      avatar,
      date_of_birth,
      gender,
      address,
      identity_card,
      additional_info,
      department, 
      years_of_experience, 
    } = req.body;

    try {
      await validateOrReject(userData)
      const user = await getUserById(parseInt(userId));
      if (user) {
        user.name = name;
        user.phone_number = phone_number;
        user.avatar = avatar;
        user.date_of_birth = new Date(date_of_birth);
        user.gender = gender;
        user.address = address;
        user.identity_card = identity_card;
        user.additional_info = additional_info;

        if (user.role === UserRoleType.PROFESSOR) {
          user.department = department; 
          user.years_of_experience = years_of_experience; 
        }

        await saveUserDetails(user);
        res.redirect("/account");
      } else {
        return res
          .status(404)
          .render("error", { message: req.t("user.user_not_found") });
      }
    } catch (error) {
      if (Array.isArray(error) && error[0].constraints) {
        const validationErrors = error.reduce((acc, err) => {
          acc[err.property] = Object.values(err.constraints).join(", ");
          return acc;
        }, {});
        res.status(400).json({ status: 400, errors: validationErrors });
      } else {
        return res
          .status(404)
          .render("error", { message: req.t("user.update_user_error") });
      }
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    const userId = req.session!.user?.id;

    try {
      const result = await updateUserPassword(userId, newPassword);
      if (result) {
        res.redirect(`/login`);
      } else {
        res
          .status(404)
          .json({ status: 404, message: req.t("user.user_not_found") });
      }
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: req.t("user.server_error") });
    }
  }
);
