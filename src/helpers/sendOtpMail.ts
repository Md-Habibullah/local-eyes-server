import { transporter } from "./mailer";
import config from "../config";

export const sendOtpMail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: config.emailSender.email,
    to: email,
    subject: "Guide Verification OTP",
    html: `
      <h3>Your OTP: <b>${otp}</b></h3>
      <p>Valid for 5 minutes</p>
      <p>If you didn’t request this, please ignore.</p>
    `,
  });
};