import nodemailer from "nodemailer";

// ==========================================
// SMTP TRANSPORTER
// ==========================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ==========================================
// PASSWORD RESET EMAIL
// ==========================================
export const sendPasswordResetEmail = async ({
  to,
  resetUrl,
}) => {
  const from =
    process.env.SMTP_FROM ||
    `Ultradium Trading <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Reset Your Ultradium Trading Admin Password",

    text: `
Hello,

We received a request to reset your Ultradium Trading admin password.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.

Regards,
Ultradium Trading
`,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px 20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; padding:35px; border-radius:12px;">

          <h2 style="margin-top:0; color:#111;">
            Reset Your Admin Password
          </h2>

          <p style="color:#555; line-height:1.6;">
            We received a request to reset your Ultradium Trading admin password.
          </p>

          <div style="margin:30px 0;">
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                background:#080808;
                color:#ffffff;
                text-decoration:none;
                padding:14px 24px;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Reset Password
            </a>
          </div>

          <p style="color:#777; font-size:14px; line-height:1.6;">
            This password reset link will expire in 15 minutes.
          </p>

          <p style="color:#777; font-size:14px; line-height:1.6;">
            If you did not request this password reset, you can safely ignore
            this email.
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />

          <p style="color:#999; font-size:12px;">
            Ultradium Trading
          </p>

        </div>
      </div>
    `,
  });
};

// ==========================================
// EMAIL CHANGE VERIFICATION
// ==========================================
export const sendEmailChangeVerification = async ({
  to,
  verifyUrl,
}) => {
  const from =
    process.env.SMTP_FROM ||
    `Ultradium Trading <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Verify Your New Admin Email - Ultradium Trading",

    text: `
Hello,

A request was made to change your Ultradium Trading admin email address.

Please verify your new email address using this link:

${verifyUrl}

This link will expire in 30 minutes.

If you did not request this change, please ignore this email.

Regards,
Ultradium Trading
`,

    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;">

          <h2 style="margin-top:0;color:#111;">
            Verify Your New Email
          </h2>

          <p style="color:#555;line-height:1.6;">
            A request was made to change your Ultradium Trading admin email address.
          </p>

          <div style="margin:30px 0;">
            <a
              href="${verifyUrl}"
              style="
                display:inline-block;
                background:#080808;
                color:#ffffff;
                text-decoration:none;
                padding:14px 24px;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Verify Email Address
            </a>
          </div>

          <p style="color:#777;font-size:14px;">
            This verification link will expire in 30 minutes.
          </p>

          <p style="color:#777;font-size:14px;">
            If you did not request this change, please ignore this email.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

          <p style="color:#999;font-size:12px;">
            Ultradium Trading
          </p>

        </div>
      </div>
    `,
  });
};

// ==========================================
// FORGOT EMAIL / LOGIN EMAIL RECOVERY
// ==========================================
export const sendLoginEmailRecovery = async ({
  to,
  loginEmail,
}) => {
  const from =
    process.env.SMTP_FROM ||
    `Ultradium Trading <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,

    subject: "Your Ultradium Trading Admin Login Email",

    text: `
Hello,

You requested to recover your Ultradium Trading admin login email.

Your registered admin login email is:

${loginEmail}

You can use this email address to login to the admin panel.

If you did not request this information, please ignore this email.

Regards,
Ultradium Trading
`,

    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;">

          <h2 style="margin-top:0;color:#111;">
            Admin Login Email Recovery
          </h2>

          <p style="color:#555;line-height:1.6;">
            You requested to recover your Ultradium Trading admin login email.
          </p>

          <div
            style="
              background:#f7f7f7;
              border:1px solid #e5e5e5;
              border-radius:10px;
              padding:20px;
              margin:25px 0;
            "
          >
            <p style="margin:0 0 8px;color:#777;font-size:13px;">
              Your registered admin login email:
            </p>

            <p
              style="
                margin:0;
                font-size:20px;
                font-weight:bold;
                color:#111;
                word-break:break-word;
              "
            >
              ${loginEmail}
            </p>
          </div>

          <p style="color:#555;line-height:1.6;">
            You can use this email address to login to your admin panel.
          </p>

          <p style="color:#777;font-size:14px;line-height:1.6;">
            If you did not request this information, you can safely ignore
            this email.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

          <p style="color:#999;font-size:12px;">
            Ultradium Trading
          </p>

        </div>
      </div>
    `,
  });
};