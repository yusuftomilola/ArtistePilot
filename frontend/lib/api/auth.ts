import api from "./axios";

const auth = "api/v1/auth";
export const registerUser = (data: any) => api.post(`${auth}/register`, data);
