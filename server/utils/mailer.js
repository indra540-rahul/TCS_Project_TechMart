import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

let transporterPromise = null;

const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      if (!isProduction) {
        return null;
      }

      throw new Error("SMTP is not configured on the server");
    }

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  })();

  return transporterPromise;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!transporter) {
    return {
      provider: "dev-preview",
      preview: { to, subject }
    };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text
  });

  return { provider: "smtp" };
};
