import { sendEmail } from "./mailer.js";

const isProduction = process.env.NODE_ENV === "production";

const sendEmailWithResend = async ({ to, code, userName }) => {
  await sendEmail({
    to,
    subject: "TechMart Pro password reset code",
    text: `Hello ${userName || "there"}, use this one-time code to reset your password: ${code}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;color:#0f172a;">
        <h2 style="margin:0 0 12px;">Password recovery</h2>
        <p style="margin:0 0 16px;">Hello ${userName || "there"}, use this one-time code to reset your password:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:0.24em;margin:16px 0;">${code}</div>
        <p style="margin:0;color:#64748b;">This code expires in 10 minutes.</p>
      </div>
    `
  });

  return { provider: "smtp" };
};

const sendSmsWithTwilio = async ({ to, code, userName }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_PHONE;

  if (!accountSid || !authToken || !fromPhone) {
    if (!isProduction) {
      return { provider: "dev-preview", previewCode: code };
    }

    throw new Error("SMS recovery is not configured on the server");
  }

  const body = new URLSearchParams({
    To: to,
    From: fromPhone,
    Body: `TechMart Pro reset code for ${userName || "your account"}: ${code}. It expires in 10 minutes.`
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SMS delivery failed: ${errorText}`);
  }

  return { provider: "twilio" };
};

export const sendRecoveryCode = async ({ channel, to, code, userName }) => {
  if (channel === "phone") {
    return sendSmsWithTwilio({ to, code, userName });
  }

  return sendEmailWithResend({ to, code, userName });
};
