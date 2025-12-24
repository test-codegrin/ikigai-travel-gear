import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendAdminLoginOTP(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "IKIGAI Admin Login - OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #f29559;">IKIGAI Travel Gear</h2>
        <p>Your admin login OTP is:</p>
        <h1 style="background: #f29559; color: white; padding: 15px; text-align: center; border-radius: 8px;">
          ${otp}
        </h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWarrantyConfirmation(
  email: string,
  name: string,
  externalId: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Warranty Registration Successful - IKIGAI Travel Gear",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #f29559;">Thank You for Registering!</h2>
        <p>Dear ${name},</p>
        <p>Your warranty has been successfully registered with IKIGAI Travel Gear.</p>
        <p><strong>Warranty ID:</strong> ${externalId}</p>
        <p>You can track your warranty status using this ID.</p>
        <br/>
        <p>Best regards,<br/>IKIGAI Travel Gear Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
