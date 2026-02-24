import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function check() {
    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            console.error("GROQ_API_KEY not found in .env or is still the placeholder.");
            return;
        }

        const groq = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });

        console.log("Fetching list of all models available on Groq...");

        const response = await fetch("https://api.groq.com/openai/v1/models", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        const data = await response.json();

        if (data.data) {
            console.log("Total models found:", data.data.length);
            data.data.forEach(m => {
                console.log(`- ${m.id}`);
            });
        } else {
            console.log("No models returned. API Key Response:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

check();
