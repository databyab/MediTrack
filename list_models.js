import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function check() {
    try {
        const envContent = fs.readFileSync(".env", "utf8");
        const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

        if (!apiKey) {
            console.error("VITE_GEMINI_API_KEY not found in .env");
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Attempt to list all models available to this key
        // Note: Use a try-catch because some keys might not have permission to list
        console.log("Fetching list of all models available to your key...");

        // In newer SDKs, listModels is an async generator or a function
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Total models found:", data.models.length);
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (ID: ${m.name.split('/').pop()})`);
                }
            });
        } else {
            console.log("No models returned. API Key Response:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

check();
