import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendWelcomeEmail(toEmail: string): Promise<boolean> {
  const subject = "Welcome to the Inner Circle - NAYORA Clothing";
  
  // Premium HTML design matching the NAYORA aesthetic
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to NAYORA</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAF9F6;
            color: #2C241E;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #FAF9F6;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border: 1px border #E5E5E5;
            padding: 50px 40px;
            text-align: center;
          }
          .brand-header {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            margin-bottom: 5px;
            color: #2C241E;
          }
          .brand-subtitle {
            font-size: 10px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: #8C7162;
            margin-bottom: 40px;
            display: block;
          }
          .title {
            font-family: serif;
            font-style: italic;
            font-size: 24px;
            color: #2C241E;
            margin-bottom: 20px;
            font-weight: normal;
          }
          .divider {
            width: 40px;
            height: 1px;
            background-color: #8C7162;
            margin: 30px auto;
          }
          .paragraph {
            font-size: 15px;
            line-height: 1.8;
            color: #555555;
            margin-bottom: 30px;
            font-weight: 300;
          }
          .cta-button {
            display: inline-block;
            background-color: #2C241E;
            color: #FAF9F6 !important;
            text-decoration: none;
            padding: 15px 35px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 30px;
            transition: background-color 0.3s;
          }
          .footer {
            font-size: 11px;
            color: #888888;
            margin-top: 40px;
            line-height: 1.6;
            letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="brand-header">NAYORA</div>
            <span class="brand-subtitle">Clothing</span>
            
            <h1 class="title">You are now in the loop.</h1>
            <div class="divider"></div>
            
            <p class="paragraph">
              Thank you for subscribing to NAYORA Clothing. You have joined our exclusive inner circle, granting you early access to new collection releases, private sales, and seasonal editorials.
            </p>
            
            <p class="paragraph">
              We believe in understated elegance and artistry in every stitch. We look forward to sharing our dialogue of form, fabric, and style with you.
            </p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="cta-button">Explore Collection</a>
            
            <div class="divider"></div>
            <div class="footer">
              &copy; 2026 NAYORA Clothing. All rights reserved.<br>
              You are receiving this email because you subscribed on our website.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log("-----------------------------------------");
    console.log("[MOCK EMAIL SENT] Resend not configured.");
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log("-----------------------------------------");
    return true;
  }

  try {
    const data = await resend.emails.send({
      from: "NAYORA Clothing <onboarding@resend.dev>",
      to: [toEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log(`[EMAIL SENT] Welcome email successfully sent to ${toEmail} via Resend. ID: ${data.data?.id}`);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email via Resend SDK:", error);
    // Return true even on failure so that storefront flow doesn't crash for the user,
    // but log it clearly.
    return false;
  }
}
