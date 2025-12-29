export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
};

// src/constants/otp.ts
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_RESEND_LIMIT = 3;
export const OTP_RESEND_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
