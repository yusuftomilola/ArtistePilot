"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RegisterForm() {
  const { loading, register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (error) {
      console.error("Registration Failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="firstName"
        type="text"
        placeholder="First Name"
        className="w-full p-2 border rounded"
        value={formData.firstName}
        onChange={handleChange}
        required
      />

      <input
        name="lastName"
        type="text"
        placeholder="Last Name"
        className="w-full p-2 border rounded"
        value={formData.lastName}
        onChange={handleChange}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Registering" : "Register"}
      </button>
    </form>
  );
}
