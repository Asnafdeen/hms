import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api.js";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "receptionist" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ok, body } = await signupUser(form);
      setLoading(false);

      if (!ok) {
        setError(body.message || "Signup failed");
        return;
      }
      navigate("/login");
    } catch (err) {
      setLoading(false);
      setError("Cannot reach the server. Is the backend running?");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="receptionist">Receptionist</option>
          <option value="doctor">Doctor</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Sign Up"}</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
