export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
export interface IToken {
  token: string;
  refreshToken: string;
}
