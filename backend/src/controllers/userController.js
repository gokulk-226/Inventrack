const User = require("../models/userModel");

// Fetch all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Add a new user (Prevent duplicate usernames)
const addUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists!" });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ message: "User added", user: newUser });
    } catch (error) {
        res.status(400).json({ error: "Failed to create user" });
    }
};

// Update user (Allow updating both username & password)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        // Check if username already exists
        if (username) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({ error: "Username already exists!" });
            }
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { username, password } }, // Ensure password is updated
            { new: true, runValidators: true } // Return updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found!" });
        }

        res.json({ message: "User updated", user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: "Failed to update user" });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(400).json({ error: "Failed to delete user" });
    }
};

module.exports = { getUsers, addUser, updateUser, deleteUser };
