export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
export interface IToken {
  access_token: string;
  refreshToken: string;
}
