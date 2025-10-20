import express from "express";
import { getAllUsers } from "../controllers/usersController.js";

export default function userRoutes(pool) {
  const router = express.Router();

  router.get("/", (req, res) => getAllUsers(req, res, pool));

  return router;
}
