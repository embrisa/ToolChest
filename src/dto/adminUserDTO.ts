export interface AdminUserDTO {
    id: string;
    username: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAdminUserDTO {
    username: string;
    email: string;
    password: string;
    role?: AdminRole;
    isActive?: boolean;
}

export interface UpdateAdminUserDTO {
    username?: string;
    email?: string;
    password?: string;
    role?: AdminRole;
    isActive?: boolean;
}

export interface AdminLoginDTO {
    username: string;
    password: string;
    rememberMe?: boolean;
}

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    READ_ONLY = 'READ_ONLY'
} 