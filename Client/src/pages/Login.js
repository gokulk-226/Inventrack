import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const authCheck = () => {
    setTimeout(() => {
      fetch("http://localhost:4000/api/login")
        .then((response) => response.json())
        .then((data) => {
          alert("Successfully Login");
          localStorage.setItem("user", JSON.stringify(data));
          authContext.signin(data._id, () => {
            navigate("/");
          });
        })
        .catch((err) => {
          alert("Wrong credentials, Try again");
          console.log(err);
        });
    }, 3000);
  };

  const loginUser = (e) => {
    if (form.email === "" || form.password === "") {
      alert("To login user, enter details to proceed...");
    } else {
      fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(form),
      })
        .then((result) => {
          console.log("User login", result);
        })
        .catch((error) => {
          console.log("Something went wrong ", error);
        });
    }
    authCheck();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen items-center">
      {/* Left Image Section */}
      <div className="hidden md:flex justify-center items-center h-screen">
  <img
    src={require("../assets/signup.jpg")}
    alt="Login Visual"
    className="w-12/12 h-full object-cover rounded-2xl"
  />
</div>


      {/* Right Login Form */}
      <div className="w-full max-w-sm mx-auto p-6">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email address"
              value={form.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-600 text-indigo-600" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <span className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer">
              Forgot your password?
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white font-semibold"
            onClick={loginUser}
          >
            Sign in
          </button>
          <p className="mt-3 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
              Register now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
