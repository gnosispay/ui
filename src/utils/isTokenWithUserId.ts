import { jwtDecode } from "jwt-decode";

// This is the way we know whether a user has ever signed up or not.
export const isTokenWithUserId = (token: string | null): boolean => {
  if (!token) return false;

  const decodedToken = jwtDecode<{ userId?: string; exp: number }>(token);

  return !!decodedToken.userId;
};
