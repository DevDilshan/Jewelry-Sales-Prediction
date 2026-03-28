import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";

const DEFAULT_STAFF_PASSWORD = () =>
  process.env.DEFAULT_STAFF_PASSWORD?.trim() || "ChangeMe@123";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), name: user.username, role: user.role },
    process.env.STAFF_ACCESS_TOKEN,
    { expiresIn: "7d" }
  );
};

function sanitizeStaff(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.password;
  return o;
}

/** Only when there are zero staff documents — creates first admin */
export async function setupFirstStaff(req, res) {
  try {
    const count = await Staff.countDocuments();
    if (count > 0) {
      return res.status(403).json({ message: "An administrator account already exists." });
    }
    const { username, email } = req.body;
    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Username and email are required." });
    }
    if (!String(email).includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const customPwd = req.body.password?.trim();
    const password = customPwd || DEFAULT_STAFF_PASSWORD();
    if (customPwd) {
      const v = validatePasswordStrength(password);
      if (!v.ok) return res.status(400).json({ message: v.message });
    }
    const user = await Staff.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "admin",
    });
    const accesstoken = generateToken(user);
    res.status(201).json({
      message: "First administrator created. Sign in with this account.",
      user: sanitizeStaff(user),
      accesstoken,
      temporaryPassword: password,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Admin only — new staff get a default password unless one is supplied */
export async function registerStaff(req, res) {
  try {
    const { username, email, role } = req.body;
    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Username and email are required." });
    }
    if (!String(email).includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const allowed = ["admin", "productmanager", "sales", "viewer"];
    const r = allowed.includes(role) ? role : "viewer";
    const customPwd = req.body.password?.trim();
    const password = customPwd || DEFAULT_STAFF_PASSWORD();
    if (customPwd) {
      const v = validatePasswordStrength(password);
      if (!v.ok) return res.status(400).json({ message: v.message });
    }
    const user = await Staff.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: r,
    });
    res.status(201).json({
      message:
        "Staff member created. Share the temporary password with them; they should change it after signing in.",
      user: sanitizeStaff(user),
      temporaryPassword: password,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or username already in use." });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function loginStaff(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await Staff.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const accesstoken = generateToken(user);
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      accesstoken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function listStaff(req, res) {
  try {
    const staff = await Staff.find().select("-password").sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getStaffMe(req, res) {
  try {
    const user = await Staff.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function changeOwnPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }
    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      return res.status(400).json({ message: policy.message });
    }
    const user = await Staff.findById(req.user.id);
    if (!user || user.password !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function updateStaff(req, res) {
  try {
    const body = { ...req.body };
    delete body.password;
    const user = await Staff.findByIdAndUpdate(req.params.id, body, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteStaff(req, res) {
  try {
    if (String(req.params.id) === String(req.user?.id)) {
      return res.status(400).json({ message: "You cannot remove your own account." });
    }
    const user = await Staff.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
