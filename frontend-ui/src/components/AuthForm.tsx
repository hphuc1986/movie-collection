import React, { useState } from "react";
import { loginUser, registerUser, registerGuestUser } from "../services/api";

interface AuthFormProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // Run the login sequence against your Cloudflare Hono Worker
        const data = await loginUser(email, password);
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage({
          text: `Welcome back, ${data.user.fullName}!`,
          isError: false,
        });
        onAuthSuccess(data.user, data.accessToken);
      } else {
        // Run the user profile registration tracking sequences
        await registerUser(email, password, fullName);
        setMessage({
          text: "Account registered successfully! Check your email for confirmation.",
          isError: false,
        });
        setIsLogin(true); // Automatically slide back over to login mode
      }
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.error ||
        "An unexpected authentication error occurred.";
      setMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        padding: "2rem",
        borderRadius: "8px",
        border: "1px solid #2d2d2d",
        maxWidth: "400px",
        margin: "0 auto 2rem",
        boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#E50914",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        {isLogin ? "🔒 Customer Sign In" : "📝 Create Store Account"}
      </h2>

      {message && (
        <div
          style={{
            backgroundColor: message.isError ? "#3a0d11" : "#0d3a1a",
            border: `1px solid ${message.isError ? "#e50914" : "#00bc8c"}`,
            padding: "0.75rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "#fff",
          }}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {!isLogin && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.85rem",
                color: "#aaa",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              style={{
                width: "100%",
                padding: "0.65rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#2d2d2d",
                color: "#fff",
                boxSizing: "border-box",
              }}
              required
            />
          </div>
        )}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.4rem",
              fontSize: "0.85rem",
              color: "#aaa",
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "0.65rem",
              borderRadius: "4px",
              border: "1px solid #444",
              backgroundColor: "#2d2d2d",
              color: "#fff",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.4rem",
              fontSize: "0.85rem",
              color: "#aaa",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "0.65rem",
              borderRadius: "4px",
              border: "1px solid #444",
              backgroundColor: "#2d2d2d",
              color: "#fff",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            backgroundColor: "#E50914",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "0.5rem",
            transition: "background-color 0.2s",
          }}
        >
          {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              setLoading(true);
              const guestName = fullName.trim() || "Guest Customer";
              await registerGuestUser(guestName);
              setMessage({
                text: `Guest account initialized successfully! You can sign in using an email layout now.`,
                isError: false,
              });
            } catch (err: any) {
              setMessage({
                text: "Guest allocation limit check error.",
                isError: true,
              });
            } finally {
              setLoading(false);
            }
          }}
          style={{
            padding: "0.75rem",
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          🛒 Fast Guest Checkout (Bypass Email Limits)
        </button>
      </form>

      <div
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.85rem",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#00bc8c",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isLogin
            ? "Don't have an account? Sign up here"
            : "Already have an account? Sign in here"}
        </button>
      </div>
    </div>
  );
}
