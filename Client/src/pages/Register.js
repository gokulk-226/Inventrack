import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    imageUrl: "",
  });

  const navigate = useNavigate();

  // Handling Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({ ...prevState, [name]: value }));
  };

  // Register User
  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert("Successfully Registered, Now Login with your details");
        navigate("/login");
      } else {
        alert("Registration Failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
      <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Register your account
        </h2>
        <form className="space-y-6" onSubmit={registerUser}>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                name="firstName"
                type="text"
                required
                className="w-full border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-indigo-600"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleInputChange}
              />
              <input
                name="lastName"
                type="text"
                required
                className="w-full border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-indigo-600"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleInputChange}
              />
            </div>
            <input
              name="email"
              type="email"
              required
              className="w-full border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-indigo-600"
              placeholder="Email Address"
              value={form.email}
              onChange={handleInputChange}
            />
            <input
              name="password"
              type="password"
              required
              className="w-full border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-indigo-600"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
            />
            <input
              name="phoneNumber"
              type="number"
              required
              className="w-full border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:ring-indigo-600"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-900">
              <input type="checkbox" required className="mr-2" />
              I Agree to Terms & Conditions
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-500"
          >
            Sign up
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Sign in now
            </Link>
          </p>
        </form>
      </div>
      <div className="flex justify-center order-first sm:order-last">
        <img src={require("../assets/Login.jpg")} alt="Register" />
      </div>
    </div>
  );
}

export default Register;
