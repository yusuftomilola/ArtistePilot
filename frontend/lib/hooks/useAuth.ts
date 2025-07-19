"use client";
import { useState } from "react";
import { registerUser, loginUser } from "../api/auth";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async (data: any) => {
    try {
      setLoading(true);
      const res = await registerUser(data);
      router.push("/login");
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: any) => {
    try {
      setLoading(true);
      const res = await loginUser(data);
      localStorage.setItem("accessToken", res.data.accessToken);
      router.push("/");
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, login };
};
