import Cookies from "js-cookie";

export const CookiesKeys = {
  token: "access_token",
  refreshToken: "refresh_token",
};

const CookiesService = {
  GetAccessToken: () => GetAccessToken(),
  SetAccessToken: (token: string) => SetAccessToken(token),
  SetRefreshToken: (token: string) => SetRefreshToken(token),
  GetRefreshToken: () => GetRefreshToken(),
  ClearAuthTokens: () => ClearAuthTokens(),
  remove: () => RemoveToken(),
};

const GetAccessToken = (): string | undefined => {
  return Cookies.get(CookiesKeys.token);
};

const GetRefreshToken = (): string | undefined => {
  return Cookies.get(CookiesKeys.refreshToken);
};

const SetAccessToken = (token: string) => {
  Cookies.set(CookiesKeys.token, token, { expires: 1 });
};

const SetRefreshToken = (token: string) => {
  Cookies.set(CookiesKeys.refreshToken, token, { expires: 7 });
};

const RemoveToken = () => {
  Cookies.remove(CookiesKeys.token);
  Cookies.remove(CookiesKeys.refreshToken);
};

const ClearAuthTokens = () => {
  Cookies.remove(CookiesKeys.token);
  Cookies.remove(CookiesKeys.refreshToken);
};

export default CookiesService;
