import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/login.jpg";
import "../styles/login.css";

export default function Login() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (localStorage.getItem("loggedIn")) {
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "billdesk") {
        navigate("/billdesk");
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    if (username === "admin@admin" && password === "admin9876") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", "admin");
      navigate("/admin", { replace: true });
      return;
    }
    

    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) throw new Error("Network response was not ok");

      const users = await response.json();
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user && username.includes("@billdesk")) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", "billdesk");
        navigate("/billdesk");
      } else {
        alert("Invalid credentials or unauthorized access.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-page-container">
      <div className="image-section">
        <img src={loginImage} alt="Login" />
      </div>

      <div className="form-section">
        <div className="login-box">
          <h2 className="gradient-heading">WELCOME TO KPS SILKS!</h2>
          <p className="subtitle">
            Please log in to continue managing your inventory with Inventrack.
          </p>

          <input
            type="text"
            placeholder="Enter your username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
