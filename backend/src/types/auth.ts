import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}
