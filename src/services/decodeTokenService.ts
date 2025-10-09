import { DecodedToken, DecodedTokenFromAPi } from "@/types/Token";
import { CookiesKeys } from "@/utils/cookies/handler";
import { jwtDecode } from "jwt-decode";
import { NextRequest } from "next/server";

export class DecodeTokenService {
  readonly decodedToken: DecodedToken | null;
  constructor(readonly token?: string) {
    if (!token) {
      throw new Error("Token not provided");
    }

    try {
      const tokenFromApi = jwtDecode(token) as DecodedTokenFromAPi;
      this.decodedToken = this.convertToDecodedToken(tokenFromApi, token);
    } catch (e) {
      throw new Error("Unable to decode token");
    }
  }

  get expiresAt(): Date {
    return new Date(+this.decodedToken!.exp * 1000);
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isAuthenticated(): boolean {
    return !this.isExpired;
  }

  get userInfo(): DecodedToken {
    return this.decodedToken!;
  }

  get isWithinNextSevenDays(): boolean {
    const sevenDaysAfterExpiration = new Date(this.expiresAt);
    sevenDaysAfterExpiration.setDate(sevenDaysAfterExpiration.getDate() + 7);
    return new Date() <= sevenDaysAfterExpiration;
  }

  static fromCookies(request: NextRequest): DecodeTokenService | null {
    const token = request.cookies.get(CookiesKeys.token)?.value;
    if (!token) {
      return null;
    }

    const authToken = new DecodeTokenService(token);

    return authToken;
  }
  private convertToDecodedToken(
    tokenFromApi: DecodedTokenFromAPi,
    token?: string
  ): DecodedToken | null {
    return {
      given_name:
        tokenFromApi[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
        ],
      family_name:
        tokenFromApi[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        ],
      unique_name:
        tokenFromApi[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ],
      exp: tokenFromApi.exp,
      iss: tokenFromApi.iss,
      aud: tokenFromApi.aud,
      accessToken: token,
    };
  }
}

export const toBoolean = (value: string | undefined): boolean => {
  return value?.toLocaleLowerCase() === "true";
};
