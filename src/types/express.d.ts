import { JwtPayload } from "../app/interfaces/jwt.interface";

declare global {
    namespace Express {
        interface User extends JwtPayload { }
    }
}