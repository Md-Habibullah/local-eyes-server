import { IAuthUser } from "../app/interfaces/common";


declare global {
    namespace Express {
        interface User extends IAuthUser { }
    }
}