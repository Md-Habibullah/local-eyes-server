import axios from 'axios';
import qs from 'qs'; // npm install qs
import config from '../config';
import ApiError from '../app/errors/apiError';
import httpStatus from 'http-status';

export const initSSLCommerzPayment = async (payload: any) => {
    const sslConfig = config.sslcommerz;

    if (
        !sslConfig ||
        !sslConfig.payment_url ||
        !sslConfig.store_id ||
        !sslConfig.store_password
    ) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'SSLCommerz configuration is missing'
        );
    }

    const response = await axios.post(
        sslConfig.payment_url,
        qs.stringify(payload), // << stringify here
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    return response.data;
};
