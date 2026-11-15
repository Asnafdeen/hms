import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ok, body } = await loginUser(form);
      setLoading(false);

      if (!ok) {
        setError(body.message || "Login failed");
        return;
      }

      localStorage.setItem("token", body.token);
      localStorage.setItem("user", JSON.stringify(body.user));
      window.location.href = "/dashboard.html";
    } catch (err) {
      setLoading(false);
      setError("Cannot reach the server. Is the backend running?");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Staff Login</h2>
        {error && <p className="error">{error}</p>}
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        <p><a href="/home.html">← Back to Home</a></p>
      </form>
    </div>
  );
}
