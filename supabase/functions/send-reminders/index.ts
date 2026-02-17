
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl!, supabaseKey!)

Deno.serve(async (_req) => {
    try {
        const now = new Date()
        // Calculate time 20 mins from now
        const reminderTime = new Date(now.getTime() + 20 * 60000)

        // Format to HH:mm
        const hours = String(reminderTime.getHours()).padStart(2, '0')
        const minutes = String(reminderTime.getMinutes()).padStart(2, '0')
        const targetTime = `${hours}:${minutes}`
        const todayDate = now.toISOString().split('T')[0]

        console.log(`Checking reminders for ${targetTime}`)

        // 1. Get all users
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
        if (usersError) throw usersError

        const results = []

        for (const user of users.users) {
            // 2. Get medications for this user that have the targetTime
            const { data: medications, error: medsError } = await supabase
                .from('medications')
                .select('*')
                .eq('user_id', user.id)
                .contains('times', [targetTime])

            if (medsError) {
                console.error(`Error fetching meds for ${user.id}:`, medsError)
                continue
            }

            if (!medications || medications.length === 0) continue

            for (const med of medications) {
                // 3. Check if already taken (optional, but good practice to avoid nagging if they took it early)
                const { data: history } = await supabase
                    .from('dose_history')
                    .select('*')
                    .eq('medication_id', med.id)
                    .eq('scheduled_time', targetTime)
                    .eq('date', todayDate)
                    .single()

                if (history) {
                    console.log(`Skipping ${med.name} for ${user.email} - already recorded`)
                    continue
                }

                // 4. Send Email
                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: 'MediTrack <onboarding@resend.dev>', // User needs to verify domain or use this test one
                    to: [user.email!],
                    subject: `Reminder: Take ${med.name} in 20 minutes`,
                    html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>MediTrack Reminder</h2>
              <p>Hello,</p>
              <p>This is a reminder to take your medication in 20 minutes:</p>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
                <h3 style="margin: 0; color: #166534;">${med.name}</h3>
                <p style="margin: 5px 0 0 0; color: #15803d;">${med.dosage} ${med.unit}</p>
                <p style="margin: 5px 0 0 0; color: #15803d;">Scheduled for: <strong>${targetTime}</strong></p>
              </div>
              <p>Please log this in the MediTrack app once taken.</p>
              <p><a href="${Deno.env.get('APP_URL') ?? 'http://localhost:5173'}" style="background: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open MediTrack</a></p>
            </div>
          `
                })

                if (emailError) {
                    console.error(`Error sending email to ${user.email}:`, emailError)
                } else {
                    console.log(`Email sent to ${user.email} for ${med.name}`)
                    results.push({ user: user.email, med: med.name })
                }
            }
        }

        return new Response(
            JSON.stringify(results),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
})
