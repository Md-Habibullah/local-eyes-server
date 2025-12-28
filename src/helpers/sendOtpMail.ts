// src/helpers/sendOtpMail.ts
import nodemailer from 'nodemailer';
import config from '../config';

export const sendOtpMail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.emailSender.email,
            pass: config.emailSender.app_pass,
        },
    });

    await transporter.sendMail({
        from: config.emailSender.email,
        to: email,
        subject: 'Guide Verification OTP',
        html: `<h3>Your OTP: <b>${otp}</b></h3><p>Valid for 5 minutes</p>`,
    });
};
