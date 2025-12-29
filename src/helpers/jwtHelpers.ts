import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../app/interfaces/jwt.interface';

const generateToken = (payload: JwtPayload, secret: Secret, expiresIn: string) => {
    const token = jwt.sign(
        payload,
        secret,
        {
            algorithm: 'HS256',
            expiresIn
        } as SignOptions
    );

    return token;
};

const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
}

export const jwtHelpers = {
    generateToken,
    verifyToken
}