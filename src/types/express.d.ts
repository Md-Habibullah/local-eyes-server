import { UserRole } from '@prisma/client'

declare global {
    namespace Express {
        interface User {
            email: string
            role: UserRole
        }
    }
}
