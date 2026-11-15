const API_BASE_URL = "http://localhost:5000/api/auth";

async function post(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  return { ok: res.ok, body };
}

export const signupUser = (data) => post("/signup", data);
export const loginUser = (data) => post("/login", data);
