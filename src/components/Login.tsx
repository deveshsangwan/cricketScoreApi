'use client';

import { useState } from "react";
import { useToken } from "@/hooks/useToken";
import { useRouter } from 'next/navigation';

export default function Login() {
  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: ""
  });
  const { generateToken } = useToken();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateToken(credentials.clientId, credentials.clientSecret);
      router.push('/matches');
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  return (
    <section className="max-w-md mx-auto bg-card p-8 rounded-xl shadow-lg border border-border">
      <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Welcome Back</h2>
      <p className="text-center text-secondary mb-8">Enter your credentials to access your account.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-foreground mb-2">
            Username
          </label>
          <input
            type="text"
            id="clientId"
            value={credentials.clientId}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 rounded-lg border-border bg-background text-foreground focus:border-primary focus:ring-primary transition-shadow shadow-sm"
            required
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            type="password"
            id="clientSecret"
            value={credentials.clientSecret}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 rounded-lg border-border bg-background text-foreground focus:border-primary focus:ring-primary transition-shadow shadow-sm"
            required
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Login
        </button>
      </form>
    </section>
  );
}
