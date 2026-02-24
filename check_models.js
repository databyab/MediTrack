import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function check() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        console.error("GROQ_API_KEY not found in .env");
        return;
    }

    const groq = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });

    const models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
    ];

    console.log("Probing Groq models for your API key...");
    for (const m of models) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: "test" }],
                model: m,
                max_tokens: 5
            });
            console.log(`✅ ${m}: AVAILABLE`);
        } catch (e) {
            console.log(`❌ ${m}: UNAVAILABLE (${e.message.split('\n')[0]})`);
        }
    }
}

check();
