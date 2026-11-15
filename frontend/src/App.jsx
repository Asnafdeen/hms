import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";

// "/" opens the patient home page (after the intro animation, first visit only)
function Root() {
  useEffect(() => {
    const delay = sessionStorage.getItem("splashShown") ? 0 : 2900;
    const t = setTimeout(() => window.location.replace("/home.html"), delay);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
