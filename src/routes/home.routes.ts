﻿import express from "express";
import { renderHomePage } from "../controller/home.controller";

const router = express.Router();

router.get("/", renderHomePage);

export default router;
