import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.28.0"

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

        const apiKey = Deno.env.get('GROQ_API_KEY')
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'Groq API Key (GROQ_API_KEY) is not configured in Edge Function' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const groq = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        })

        const systemPrompt = "You are a professional medical assistant. You provide structured, accurate information about medications. You must respond ONLY with a valid JSON object."

        const userPrompt = `Provide detailed medical and usage information about the medication "${medicationName}". 
    Required structure:
    {
      "description": "Short summary",
      "uses": ["list of uses"],
      "sideEffects": ["list of effects"],
      "precautions": ["list of precautions"],
      "dosageInfo": "General guidance"
    }`

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
        })

        const resultText = completion.choices[0].message.content

        return new Response(
            resultText,
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Edge Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})

