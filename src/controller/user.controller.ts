import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  userRegister,
  userLogin,
  decodeJwtToken,
  getUserById,
  saveUserDetails,
  getPurchasedCoursesWithDetails,
  updateUserPassword,
} from "../service/user.service";
import { getEnrollmentWithCourseAndUser } from "../service/enrollment.service";
import {
  getSectionsWithLessons,
  countEnrolledUsersInCourse,
} from "../service/course.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
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
    const message =
      error.message === req.t("user.user_error")
        ? error.message
        : req.t("signup.signup-failure");
    res.status(400).json({ status: 400, message });
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await userLogin(email, password);

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
    res
      .status(400)
      .json({ status: 400, message: req.t("login.login-failure") });
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
        });
      }

      res.render("user-details", {
        user,
        coursesWithDetails,
        courseDetailsList,
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
    const {
      name,
      phone_number,
      avatar,
      date_of_birth,
      gender,
      address,
      identity_card,
      additional_info,
    } = req.body;

    try {
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

        await saveUserDetails(user);
        res.redirect("/account");
      } else {
        return res
          .status(404)
          .render("error", { message: req.t("user.user_not_found") });
      }
    } catch (error) {
      return res
        .status(404)
        .render("error", { message: req.t("user.update_user_error") });
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
        res.status(200).json({
          status: 200,
          message: req.t("user.success_change_password"),
        });
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
