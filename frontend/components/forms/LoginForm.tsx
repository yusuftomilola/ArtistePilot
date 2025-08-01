"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState } from "react";

export default function LoginForm() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      console.log("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1>Login</h1>
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="w-full p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
