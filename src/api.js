import axios, {
    AxiosResponse,
    InternalAxiosRequestConfig,
    AxiosError,
    Method,
  } from "axios";
  import { getToken, storeToken, removeToken } from "./utilFunctions";
  import { JWT_REFRESH } from "./endpoints/auth_endpoints";
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const ACCESS_TOKEN_KEY = "auth_access_token";
  const REFRESH_TOKEN_KEY = "auth_refresh_token";
  
  // Axios instance with credentials
  const apiInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    // withCredentials: true,
  });
  
  // Public instance without credentials
  const publicApiInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
  });
  
  let isRefreshing = false;
  let refreshSubscribers: ((token: string) => void)[] = [];
  
  function onRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
  }
  
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.set('Authorization', Bearer ${token});
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = getToken(REFRESH_TOKEN_KEY);
          try {
            const response = await publicApiInstance.post(JWT_REFRESH, {
              refresh: refreshToken,
            });
  
            const { access, refresh } = response.data;
            storeToken(ACCESS_TOKEN_KEY, access, 604800);
            storeToken(REFRESH_TOKEN_KEY, refresh, 604800);
            isRefreshing = false;
            onRefreshed(access);
  
            originalRequest._retry = true;
            originalRequest.headers["Authorization"] = Bearer ${access};
            return apiInstance(originalRequest);
          } catch (refreshError: unknown) {
            isRefreshing = false;
            removeToken(ACCESS_TOKEN_KEY);
            removeToken(REFRESH_TOKEN_KEY);
            window.location.href = "/";
            return Promise.reject(refreshError);
          }
        }
  
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken: string) => {
            originalRequest.headers["Authorization"] = Bearer ${newToken};
            resolve(apiInstance(originalRequest));
          });
        });
      }
  
      return Promise.reject(error);
    }
  );
  
  type HeaderType = "json" | "formData";
  
  const request = async (
    method: Method,
    path: string,
    options: { data?: any; params?: any } = {},
    headerType: HeaderType = "json"
  ) => {
    const { data, params } = options;
    return apiInstance.request({
      method,
      url: path,
      data,
      params,
      headers: {
        "Content-Type":
          headerType === "formData" ? "multipart/form-data" : "application/json",
      },
    });
  };
  
  const Api = {
    get: (path: string, params?: any) => request("GET", path, { params }),
    post: (path: string, data?: any, headerType?: HeaderType) =>
      request("POST", path, { data }, headerType),
    put: (path: string, data?: any, headerType?: HeaderType) =>
      request("PUT", path, { data }, headerType),
    patch: (path: string, data?: any, headerType?: HeaderType) =>
      request("PATCH", path, { data }, headerType),
    delete: (path: string) => request("DELETE", path),
  };
  
  export default Api;