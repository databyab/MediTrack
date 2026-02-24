import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function check() {
    const envContent = fs.readFileSync(".env", "utf8");
    const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY not found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-2.0-flash-exp"];

    console.log("Probing models for your API key...");
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            // Use a very simple prompt
            const result = await model.generateContent("test");
            await result.response;
            console.log(`✅ ${m}: AVAILABLE`);
        } catch (e) {
            console.log(`❌ ${m}: UNAVAILABLE (${e.message.split('\n')[0]})`);
        }
    }
}

check();
