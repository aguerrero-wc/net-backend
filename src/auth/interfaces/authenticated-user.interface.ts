export interface AuthenticatedUser {
  userId: string;
  email: string;
  tenantId: string;
  roleId: string | undefined;
  roleSlug: string | undefined;
}

export interface AuthenticatedUserWithRefreshToken extends AuthenticatedUser {
  refreshToken: string;
}