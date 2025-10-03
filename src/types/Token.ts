export type DecodedToken = {
  given_name?: string;
  family_name?: string;
  unique_name?: string;
  nbf?: string;
  exp: string;
  iat?: string;
  iss: string;
  aud: string;
  accessToken?: string;
};

export type DecodedTokenFromAPi = {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  exp: string;
  iss: string;
  aud: string;
  accessToken?: string;
};

export interface UserToken {
  userId?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}
