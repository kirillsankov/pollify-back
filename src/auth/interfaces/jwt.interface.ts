export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
export interface IToken {
  access_token: string;
  refreshToken: string;
}
