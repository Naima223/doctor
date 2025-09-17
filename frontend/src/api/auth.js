import client from "./client";

export const register = (payload) => client.post("/user/register", payload);
export const login    = (payload) => client.post("/user/login", payload);
export const me       = () => client.get("/user/profile");
export const updateMe = (data) => client.put("/user/profile", data);

export const getDoctors = () => client.get("/doctors");
