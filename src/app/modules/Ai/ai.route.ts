import express from "express";
import { AiController } from "./ai.controller";

const router = express.Router();

router.post(
    "/generate-tour-description",
    AiController.generateTourDescription
);

export const AiRoutes = router;