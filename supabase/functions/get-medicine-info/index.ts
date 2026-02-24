import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
        const body = await req.json()
        let { medicationName } = body

        // 🛡️ Security: Basic Sanitization
        if (typeof medicationName !== 'string') {
            throw new Error('Invalid medication name format')
        }

        // Limit length and strip potentially dangerous characters
        medicationName = medicationName.trim().substring(0, 50).replace(/[<>{}[\]\\^`|]/g, '')

        console.log(`Analyzing medication: ${medicationName}`)

        if (!medicationName || medicationName.length < 2) {
            return new Response(
                JSON.stringify({ error: 'Valid medication name is required (min 2 chars)' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const apiKey = Deno.env.get('GROQ_API_KEY')
        if (!apiKey) {
            console.error("GROQ_API_KEY is missing from environment")
            return new Response(
                JSON.stringify({ error: 'Groq API Key is not configured in Edge Function' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const systemPrompt = "You are a professional medical assistant. Respond only in JSON."
        const userPrompt = `Provide medical info about "${medicationName}":
        {
          "description": "Short summary",
          "uses": ["list"],
          "sideEffects": ["list"],
          "precautions": ["list"],
          "dosageInfo": "Guidance"
        }`

        console.log("Calling Groq API (8B model)...")
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                max_tokens: 512,
                temperature: 0.1,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Groq API Error: ${response.status} - ${errorText}`)
            throw new Error(`Groq API Error: ${response.status}`)
        }

        const result = await response.json()
        const resultText = result.choices[0].message.content
        console.log("Successfully retrieved response from Groq")

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
