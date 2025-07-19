"use client";
import { useState } from "react";
import { registerUser } from "../api/auth";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const register = async (data: any) => {
    try {
      setLoading(true);
      const res = await registerUser(data);
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
};
