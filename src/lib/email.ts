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

// NEW: Send Email OTP for Warranty Registration
export async function sendWarrantyOTP(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Warranty Registration - Email Verification OTP",
    html: `
      <div style="margin:0; padding:0; background-color:#f5f5f5;">
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
                Warranty Registration Verification
              </h1>
              <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Use the one-time password (OTP) below to verify your email address and complete your warranty registration with <strong>Ikigai Travel Gear</strong>.
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
                If you did not request this code, you can safely ignore this email.
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
                This email was sent for warranty registration verification on Ikigai Travel Gear.
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

export async function sendAdminLoginOTP(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "IKIGAI Admin Login - OTP Verification",
    html: `
      <div style="margin:0; padding:0; background-color:#f5f5f5;">
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

export async function sendWarrantyStatusUpdate(
  email: string,
  name: string,
  externalId: string,
  statusName: string,
  statusMessage: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Warranty Status Update - ${externalId}`,
    html: `
     <div style="margin:0; padding:0; background-color:#f5f5f5;">
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
                We wanted to inform you that the status of your warranty has been updated.
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
                        <td style="padding-bottom:16px;">
                          <span style="font-size:20px; color:#f29559; font-weight:700; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            ${externalId}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px; border-top:1px solid #e5e5e5;">
                          <span style="font-size:13px; color:#000000; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            Current Status
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:6px;">
                          <span style="font-size:18px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                            ${statusName}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                ${statusMessage}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <div style="height:1px; background-color:#e5e5e5;"></div>
            </td>
          </tr>

          <!-- Contact Support -->
          <tr>
            <td style="padding:24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                If you have any questions or concerns, please don't hesitate to contact our support team.
              </p>
              <p style="margin:8px 0 0 0; font-size:15px; line-height:1.6; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                Best regards,<br/>
                Ikigai Travel Gear Team
              </p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:20px 24px; background-color:#f5f5f5; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#666666; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                This email was sent regarding your warranty status update with Ikigai Travel Gear.<br/>
                If you did not expect this email, please contact our support team immediately.
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
// Send Contact Form Email to Admin
export async function sendContactFormEmail(
  name: string,
  email: string,
  message: string
) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL environment variable is not set");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    replyTo: email, // Allow admin to reply directly to the customer
    subject: `New Contact Form Submission - ${name}`,
    html: `
      <div style="margin:0; padding:0; background-color:#f5f5f5;">
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
                      New Contact Form Submission
                    </h1>
                    <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                      You have received a new message from your website contact form.
                    </p>
                  </td>
                </tr>

                <!-- Contact Details -->
                <tr>
                  <td style="padding:0 24px 24px 24px; font-family:'Mulish', Arial, sans-serif;">
                    <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%; background-color:#f5f5f5; border-radius:6px; padding:16px;">
                      <tr>
                        <td style="padding:8px 0;">
                          <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                            <tr>
                              <td style="padding:8px 0; border-bottom:1px solid #e5e5e5;">
                                <span style="font-size:13px; color:#666666; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif; display:block; margin-bottom:4px;">
                                  Name
                                </span>
                                <span style="font-size:15px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                                  ${name}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0; border-bottom:1px solid #e5e5e5;">
                                <span style="font-size:13px; color:#666666; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif; display:block; margin-bottom:4px;">
                                  Email
                                </span>
                                <a href="mailto:${email}" style="font-size:15px; color:#f29559; font-weight:600; font-family:'Mulish', Arial, sans-serif; text-decoration:none;">
                                  ${email}
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:12px 0 0 0;">
                                <span style="font-size:13px; color:#666666; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif; display:block; margin-bottom:8px;">
                                  Message
                                </span>
                                <div style="font-size:15px; color:#000000; line-height:1.6; font-family:'Mulish', Arial, sans-serif; background-color:#ffffff; padding:12px; border-radius:4px; border:1px solid #e5e5e5;">
                                  ${message.replace(/\n/g, '<br/>')}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 24px;">
                    <div style="height:1px; background-color:#e5e5e5;"></div>
                  </td>
                </tr>

                <!-- Action Button -->
                <tr>
                  <td style="padding:24px; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                    <a href="mailto:${email}?subject=Re: Contact Form Inquiry" style="display:inline-block; background-color:#f29559; color:#ffffff; padding:12px 32px; border-radius:6px; text-decoration:none; font-size:14px; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                      Reply to ${name}
                    </a>
                  </td>
                </tr>

                <!-- Footer note -->
                <tr>
                  <td style="padding:20px 24px; background-color:#f5f5f5; font-family:'Mulish', Arial, sans-serif;">
                    <p style="margin:0; font-size:12px; line-height:1.5; color:#666666; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                      This email was sent from your website contact form on Ikigai Travel Gear.<br/>
                      Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
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

// Send Claim Status Update Email
export async function sendClaimStatusUpdate(
  email: string,
  name: string,
  claimExternalId: string,
  warrantyExternalId: string,
  statusName: string,
  statusMessage: string
) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const trackClaimUrl = `${frontendUrl}/warranty/track-claim/${claimExternalId}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Claim Status Update: ${statusName.replace(/_/g, " ").toUpperCase()} - Ikigai Travel Gear`,
    html: `
     <div style="margin:0; padding:0; background-color:#f5f5f5;">
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
                Your warranty claim status has been updated.
              </p>

              <!-- Status Update Box -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px; background-color:#f8f9fa; border-radius:6px; border:2px solid #f29559; width:100%; font-family:'Mulish', Arial, sans-serif;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 12px 0; font-size:14px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                      New Status: <span style="color:#f29559; text-transform:uppercase;">${statusName.replace(/_/g, " ")}</span>
                    </p>
                    <p style="margin:0; font-size:14px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                      ${statusMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Claim Info -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px; width:100%; font-family:'Mulish', Arial, sans-serif;">
                <tr>
                  <td style="padding:8px 0; border-bottom:1px solid #e5e5e5;">
                    <span style="font-size:13px; color:#666666; font-family:'Mulish', Arial, sans-serif;">Claim ID:</span>
                    <span style="font-size:14px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif; margin-left:8px;">${claimExternalId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="font-size:13px; color:#666666; font-family:'Mulish', Arial, sans-serif;">Warranty ID:</span>
                    <span style="font-size:14px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif; margin-left:8px;">${warrantyExternalId}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Claim Button -->
          <tr>
            <td style="padding:0 24px 24px 24px;" align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="border-radius:6px; background-color:#f29559;">
                          <a href="${trackClaimUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-family:'Mulish', Arial, sans-serif; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:6px; border:1px solid #f29559;">
                            View Full Claim Details
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <div style="height:1px; background-color:#e5e5e5;"></div>
            </td>
          </tr>

          <!-- Contact Support -->
          <tr>
            <td style="padding:24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                If you have any questions about your claim, please contact our support team.
              </p>
              <p style="margin:8px 0 0 0; font-size:15px; line-height:1.6; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                Best regards,<br/>
                Ikigai Travel Gear Team
              </p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:20px 24px; background-color:#f5f5f5; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#666666; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                This email was sent regarding your warranty claim with Ikigai Travel Gear.<br/>
                If you have any concerns, please contact our support team.
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



// Send Claim Confirmation Email
export async function sendClaimConfirmation(
  email: string,
  name: string,
  claimExternalId: string,
  warrantyExternalId: string
) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const trackClaimUrl = `${frontendUrl}/warranty/track-claim/${claimExternalId}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Claim Submitted Successfully - Ikigai Travel Gear",
    html: `
     <div style="margin:0; padding:0; background-color:#f5f5f5;">
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
                Thank you for submitting your warranty claim. We have received your request and our team will review it shortly.
              </p>

              <!-- Claim Info Box -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px; background-color:#ffffff; border-radius:6px; border:2px solid #f29559; width:100%; font-family:'Mulish', Arial, sans-serif;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom:8px;">
                          <span style="font-size:13px; color:#000000; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            Claim ID
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <span style="font-size:20px; color:#f29559; font-weight:700; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            ${claimExternalId}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:8px; border-top:1px solid #e5e5e5;">
                          <span style="font-size:13px; color:#000000; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-family:'Mulish', Arial, sans-serif;">
                            Warranty ID
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:6px;">
                          <span style="font-size:16px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                            ${warrantyExternalId}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0; font-size:15px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                Please save this claim ID for your records. You can use it to track the status of your claim.
              </p>
            </td>
          </tr>

          <!-- Track Claim Button -->
          <tr>
            <td style="padding:0 24px 24px 24px;" align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="border-radius:6px; background-color:#f29559;">
                          <a href="${trackClaimUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-family:'Mulish', Arial, sans-serif; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:6px; border:1px solid #f29559;">
                            View Claim Status
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next Section -->
          <tr>
            <td style="padding:0 24px 24px 24px; font-family:'Mulish', Arial, sans-serif;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8f9fa; border-radius:6px; width:100%; font-family:'Mulish', Arial, sans-serif;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 12px 0; font-size:14px; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                      What happens next?
                    </p>
                    <ul style="margin:0; padding-left:20px; font-size:14px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                      <li style="margin-bottom:8px;">Our team will review your claim within 24-48 hours</li>
                      <li style="margin-bottom:8px;">We may contact you if we need additional information</li>
                      <li style="margin-bottom:8px;">You will receive an email notification once your claim is reviewed</li>
                      <li>If approved, we will guide you through the next steps</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <div style="height:1px; background-color:#e5e5e5;"></div>
            </td>
          </tr>

          <!-- Contact Support -->
          <tr>
            <td style="padding:24px; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6; color:#000000; font-family:'Mulish', Arial, sans-serif;">
                If you have any questions about your claim, please don't hesitate to contact our support team. We're here to help!
              </p>
              <p style="margin:8px 0 0 0; font-size:15px; line-height:1.6; color:#000000; font-weight:600; font-family:'Mulish', Arial, sans-serif;">
                Best regards,<br/>
                Ikigai Travel Gear Team
              </p>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:20px 24px; background-color:#f5f5f5; font-family:'Mulish', Arial, sans-serif;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#666666; text-align:center; font-family:'Mulish', Arial, sans-serif;">
                This email was sent regarding your warranty claim submission with Ikigai Travel Gear.<br/>
                If you did not submit this claim, please contact our support team immediately.
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
