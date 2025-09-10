import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const decodedToken = jwtDecode(token);

  if (!decodedToken.exp) {
    return true;
  }

  const currentDate = new Date();

  // JWT exp is in seconds
  if (decodedToken.exp * 1000 < currentDate.getTime()) {
    return true;
  }

  return false;
};
