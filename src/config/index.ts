import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,

    database_url: process.env.DATABASE_URL,

    salt_round: process.env.SALT_ROUND,

    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_secret: process.env.RESET_PASS_TOKEN,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },

    reset_pass_link: process.env.RESET_PASS_LINK,

    emailSender: {
        email: process.env.EMAIL,
        app_pass: process.env.APP_PASS,
    },

    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },

    frontend_url: process.env.FRONTEND_URL,

    sslcommerz: {
        store_id: process.env.SSLC_STORE_ID,
        store_password: process.env.SSLC_STORE_PASSWORD,
        payment_url: process.env.SSLC_PAYMENT_URL,
        success_url: process.env.SSLC_SUCCESS_URL,
        fail_url: process.env.SSLC_FAIL_URL,
        cancel_url: process.env.SSLC_CANCEL_URL,
    },
};
