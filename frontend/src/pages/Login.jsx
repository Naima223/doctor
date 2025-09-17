// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode"); // "login" | "signup" | null

  const { login, register } = useAuth();

  // default: Sign Up (tomar previous logic follow kora)
  const [state, setState] = useState("Sign Up"); // "Login" | "Sign Up"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // URL mode onujayi toggle
  useEffect(() => {
    if (mode === "login") setState("Login");
    else if (mode === "signup") setState("Sign Up");
  }, [mode]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (state === "Login") {
        await login(email, password); // AuthProvider handles token+user
        toast.success("Login successful!");
      } else {
        await register({ name, email, password }); // AuthProvider handles token+user
        toast.success("Account created!");
      }
      // redirect (you can change to "/" if you want)
      navigate("/my-profile");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">{state}</h2>

        {state === "Sign Up" && (
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-3 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60"
        >
          {submitting ? "Please wait..." : state}
        </button>

        <p className="text-center mt-4">
          {state === "Login" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/login?mode=signup")}
                className="text-primary cursor-pointer font-medium"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login?mode=login")}
                className="text-primary cursor-pointer font-medium"
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
