const API_BASE = "http://localhost:5000/api";

function getToken() { return localStorage.getItem("token"); }

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

// Stops user text from being run as HTML
function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Today as 2026-10-25 (local time)
function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function requireAuth() {
  if (!getToken() || !getUser()) {
    window.location.href = "/login";
    return null;
  }
  return getUser();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      logout();
      return null;
    }

    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: { message: "Cannot reach the server. Is the backend running?" } };
  }
}

// Shows an error (or clears it) in the #errorBox element
function showError(msg) {
  const box = document.getElementById("errorBox");
  if (box) box.innerHTML = msg ? `<div class="error-msg">${esc(msg)}</div>` : "";
}

function showSuccess(msg) {
  const box = document.getElementById("errorBox");
  if (box) box.innerHTML = msg ? `<div class="success-msg">${esc(msg)}</div>` : "";
}

const NAV_LINKS = [
  { href: "/dashboard.html", label: "Dashboard", icon: "🏠", roles: ["admin", "doctor", "receptionist"] },
  { href: "/patients.html", label: "Patients", icon: "🧍", roles: ["admin", "receptionist", "doctor"] },
  { href: "/doctors.html", label: "Doctors", icon: "🩺", roles: ["admin", "receptionist", "doctor"] },
  { href: "/appointments.html", label: "Appointments", icon: "📅", roles: ["admin", "receptionist", "doctor"] },
  { href: "/admissions.html", label: "Admission & Discharge", icon: "📋", roles: ["admin", "receptionist", "doctor"] },
  { href: "/beds.html", label: "Smart Beds", icon: "🛏️", roles: ["admin", "receptionist", "doctor"] },
  { href: "/rooms.html", label: "Rooms & Beds", icon: "🚪", roles: ["admin", "receptionist", "doctor"] },
  { href: "/billing.html", label: "Billing & Payment", icon: "💳", roles: ["admin", "receptionist"] },
  { href: "/expenses.html", label: "Hospital Expenses", icon: "🧾", roles: ["admin"] },
  { href: "/reports.html", label: "Reports", icon: "📊", roles: ["admin"] },
];

function renderNavbar(activePage) {
  const user = getUser();
  const nav = document.getElementById("navbar");
  if (!user || !nav) return;

  const linksHtml = NAV_LINKS.filter((l) => l.roles.includes(user.role))
    .map((l) => `<a href="${l.href}" class="${l.href === activePage ? "active" : ""}"><span class="icon">${l.icon}</span>${l.label}</a>`)
    .join("");

  nav.innerHTML = `
    <div class="brand">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" stroke="white" stroke-opacity="0.9" stroke-width="1.5"/>
        <path d="M4 12h3l1.5-4 3 8 2-5.5 1.2 3.5H20" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Captain Medicare
    </div>
    <nav>${linksHtml}</nav>
    <div class="user-box">
      <div class="name">${esc(user.name)}</div>
      <span class="role">${esc(user.role)}</span>
      <a class="site-link" href="/home.html">🌐 View Website</a>
      <button onclick="logout()">Logout</button>
    </div>
  `;
}
