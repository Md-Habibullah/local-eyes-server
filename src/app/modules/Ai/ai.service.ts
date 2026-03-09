import OpenAI from "openai";
import config from "../../../config";

const openai = new OpenAI({
    apiKey: config.openai_api_key,
});

const generateTourDescription = async (payload: {
    title: string;
    city: string;
    category: string;
}) => {

    const { title, city, category } = payload;

    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: `Write an engaging tourism tour description within 60 words.

Tour Title: ${title}
City: ${city}
Category: ${category}

Make it attractive for tourists.`,
    });

    return response.output_text;
};

export const AiService = {
    generateTourDescription,
};