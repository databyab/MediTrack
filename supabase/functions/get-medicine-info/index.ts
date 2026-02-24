import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { medicationName } = await req.json()

        if (!medicationName) {
            return new Response(
                JSON.stringify({ error: 'Medication name is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'Gemini API Key is not configured in Edge Function' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `Provide detailed medical and usage information about the medication "${medicationName}". 
    Respond ONLY with a JSON object. Do not include markdown formatting or backticks.
    Required structure:
    {
      "description": "Short summary",
      "uses": ["list of uses"],
      "sideEffects": ["list of effects"],
      "precautions": ["list of precautions"],
      "dosageInfo": "General guidance"
    }`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const textResponse = response.text()

        // More robust JSON parsing
        let parsedData
        try {
            const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim()
            parsedData = JSON.parse(cleanedText)
        } catch (jsonErr) {
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0])
            } else {
                throw new Error("Could not parse AI response.")
            }
        }

        return new Response(
            JSON.stringify(parsedData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Edge Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
