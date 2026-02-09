import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  email: string;
  username?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, username }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpUser || !smtpPassword) {
      throw new Error("SMTP credentials not configured");
    }

    console.log(`Sending welcome email to: ${email}`);

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    const displayName = username || email.split("@")[0];

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Tunu Cinema Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 16px 24px; border-radius: 12px; margin-bottom: 20px;">
                <span style="font-size: 32px;">🎬</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Welcome to the Family!
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="color: #e2e8f0; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey <strong style="color: #8b5cf6;">${displayName}</strong>! 🎉
              </p>
              
              <p style="color: #cbd5e1; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">
                You've successfully joined the <strong style="background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Tunu Cinema Hub Family</strong>! 
              </p>
              
              <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0;">
                  ✨ Welcome to the <strong>World of Infinity Entertainment</strong> ✨
                </p>
              </div>
              
              <p style="color: #cbd5e1; font-size: 16px; line-height: 1.8; margin: 24px 0;">
                Get ready to explore:
              </p>
              
              <ul style="color: #cbd5e1; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 24px 0;">
                <li>🎥 Unlimited Movies & Series</li>
                <li>🌟 Exclusive New Releases</li>
                <li>📱 Watch on Any Device</li>
                <li>💜 Personalized Recommendations</li>
              </ul>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://tunu-cinema.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);">
                  Start Watching Now 🍿
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 24px 40px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
                With love from the Tunu Cinema Hub Team 💜
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © 2024 Tunu Cinema Hub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await client.send({
      from: smtpUser,
      to: email,
      subject: "🎬 Welcome to Tunu Cinema Hub Family!",
      content: "Welcome to the Tunu Cinema Hub Family! You now have access to the World of Infinity Entertainment.",
      html: htmlContent,
    });

    await client.close();

    console.log(`Welcome email sent successfully to: ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
