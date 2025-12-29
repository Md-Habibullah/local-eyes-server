import { IAuthUser } from "../app/interfaces/IAuthUser";


declare global {
    namespace Express {
        interface User extends IAuthUser { }
    }
}