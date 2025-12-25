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
      <div style="margin:0; padding:0; background-color:#f5f5f5;">
  <!-- Web font (Mulish) -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700&display=swap');
  </style>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5; padding:24px 0; font-family:'Mulish', Arial, sans-serif;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08); font-family:'Mulish', Arial, sans-serif;">

          <!-- Header with logo -->
          <tr>
            <td style="padding:24px; border-bottom: 1px solid #e5e5e5;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left">
                    <img 
                      src="https://ik.imagekit.io/devanpatel/logo/ikigai-logo.png" 
                      alt="Ikigai Travel Gear" 
                      style="height:25px; display:block;"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px 16px 24px; font-family:'Mulish', Arial, sans-serif;">
              <h1 style="margin:0 0 12px 0; font-size:22px; color:#000000; font-weight:600; line-height:1.4; font-family:'Mulish', Arial, sans-serif;">
                Admin login verification code
              </h1>
              <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Use the one-time password (OTP) below to complete your admin login to <strong>Ikigai Travel Gear</strong>.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td style="padding:0 24px 24px 24px; font-family:'Mulish', Arial, sans-serif;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%; margin-top:8px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block; min-width:260px; background-color:#f29559; color:#ffffff; padding:16px 24px; border-radius:8px; text-align:center;">
                      <span style="display:block; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; opacity:0.9; margin-bottom:6px; font-family:'Mulish', Arial, sans-serif;">
                        Your OTP
                      </span>
                      <span style="display:block; font-size:28px; font-weight:700; letter-spacing:0.25em; font-family:'Mulish', Arial, sans-serif;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 0 0; font-size:14px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                This OTP is valid for <strong>10 minutes</strong> and can be used only once.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <div style="height:1px; background-color:#e5e5e5;"></div>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:16px 24px 24px 24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0 0 6px 0; font-size:13px; line-height:1.5; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                If you did not request this code, you can safely ignore this email. Your account will remain secure.
              </p>
              <p style="margin:8px 0 0 0; font-size:12px; line-height:1.5; color:#666666; font-family:'Mulish', Arial, sans-serif;">
                For security reasons, never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:16px 24px 20px 24px; background-color:#f5f5f5; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0; font-size:11px; line-height:1.5; color:#666666; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                This email was sent for admin login verification on Ikigai Travel Gear.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
     <div style="margin:0; padding:0; background-color:#f5f5f5;">
  <!-- Web font (supported by many, but not all, clients) -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700&display=swap');
  </style>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5; padding:24px 0; font-family:'Mulish', Arial, sans-serif;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08); font-family:'Mulish', Arial, sans-serif;">
          
          <!-- Header with logo -->
          <tr>
            <td style="padding:24px; border-bottom: 1px solid #e5e5e5;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left">
                    <img 
                      src="https://ik.imagekit.io/devanpatel/logo/ikigai-logo.png" 
                      alt="Ikigai Travel Gear" 
                      style="height:25px; display:block;"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px 16px 24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Dear ${name},
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px 24px 24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Your warranty has been successfully registered with Ikigai Travel Gear. We're committed to providing you with excellent service and support.
              </p>

              <!-- Warranty ID Box -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px; background-color:#ffffff; border-radius:6px; border:2px solid #f29559; width:100%; font-family:'Mulish', Arial, sans-serif;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom:8px;">
                          <span style="font-size:13px; color:#000000; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            Warranty ID
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size:20px; color:#f29559; font-weight:700; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            ${externalId}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0; font-size:13px; line-height:1.5; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Please save this warranty ID for your records. You may need it for future service requests.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <div style="height:1px; background-color:#e5e5e5;"></div>
            </td>
          </tr>

          <!-- Footer / Signature -->
          <tr>
            <td style="padding:24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0 0 4px 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Best regards,
              </p>
              <p style="margin:0; font-size:15px; line-height:1.6; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                Ikigai Travel Gear Team
              </p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:20px 24px; background-color:#f5f5f5; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#666666; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                This email was sent regarding your warranty registration with Ikigai Travel Gear.<br/>
                If you did not perform this action, please contact our support team immediately.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>

    `,
  };

  await transporter.sendMail(mailOptions);
}
