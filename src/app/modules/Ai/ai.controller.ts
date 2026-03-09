import { Request, Response } from "express";
import { AiService } from "./ai.service";

const generateTourDescription = async (req: Request, res: Response) => {
    try {
        const result = await AiService.generateTourDescription(req.body);

        res.status(200).json({
            success: true,
            message: "Tour description generated successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "AI generation failed",
            error,
        });
    }
};

export const AiController = {
    generateTourDescription,
};