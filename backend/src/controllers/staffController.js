import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import DesignerPortfolio from "../models/DesignerPortfolio.js";
import { deleteUploadedRelPath } from "../utils/uploadedFile.js";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";
import { hashPassword, verifyPasswordMigrateLegacy, verifyStoredPassword } from "../utils/passwordHash.js";
import { generatePasswordResetToken, passwordResetExpiryDate } from "../utils/passwordResetToken.js";
import { validateStaffProfilePatch } from "../utils/staffProfileValidation.js";
import { isValidStaffAccountEmail, staffAccountEmailErrorMessage } from "../utils/staffEmail.js";

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
  delete o.resetToken;
  delete o.resetTokenExpiry;
  return o;
}

const STAFF_SAFE_SELECT = "-password -resetToken -resetTokenExpiry";

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
    if (!isValidStaffAccountEmail(email)) {
      return res.status(400).json({ message: staffAccountEmailErrorMessage() });
    }
    const customPwd = req.body.password?.trim();
    const plainPassword = customPwd || DEFAULT_STAFF_PASSWORD();
    if (customPwd) {
      const v = validatePasswordStrength(plainPassword);
      if (!v.ok) return res.status(400).json({ message: v.message });
    }
    const passwordHash = await hashPassword(plainPassword);
    const user = await Staff.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      role: "admin",
    });
    const accesstoken = generateToken(user);
    res.status(201).json({
      message: "First administrator created. Sign in with this account.",
      user: sanitizeStaff(user),
      accesstoken,
      temporaryPassword: plainPassword,
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
    if (!isValidStaffAccountEmail(email)) {
      return res.status(400).json({ message: staffAccountEmailErrorMessage() });
    }
    const allowed = ["admin", "productmanager", "sales", "viewer", "designer"];
    const r = allowed.includes(role) ? role : "viewer";
    const customPwd = req.body.password?.trim();
    const plainPassword = customPwd || DEFAULT_STAFF_PASSWORD();
    if (customPwd) {
      const v = validatePasswordStrength(plainPassword);
      if (!v.ok) return res.status(400).json({ message: v.message });
    }
    const passwordHash = await hashPassword(plainPassword);
    const user = await Staff.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      role: r,
    });
    res.status(201).json({
      message:
        "Staff member created. Share the temporary password with them; they should change it after signing in.",
      user: sanitizeStaff(user),
      temporaryPassword: plainPassword,
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
    const passwordOk = await verifyPasswordMigrateLegacy(user, password);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const accesstoken = generateToken(user);
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profileImage: user.profileImage || "",
      accesstoken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function listStaff(req, res) {
  try {
    const staff = await Staff.find().select(STAFF_SAFE_SELECT).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** GET /api/staff/designers — accounts with designer role (for portfolio assignment) */
export async function listDesignerStaff(req, res) {
  try {
    const designers = await Staff.find({ role: "designer" })
      .select("username email firstName lastName")
      .sort({ username: 1 })
      .lean();
    res.json(designers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getStaffMe(req, res) {
  try {
    const user = await Staff.findById(req.user.id).select(STAFF_SAFE_SELECT);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** PATCH /staff/me — update own profile (personal fields + email). */
export async function updateStaffMe(req, res) {
  try {
    const parsed = validateStaffProfilePatch(req.body);
    if (!parsed.ok) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: parsed.errors,
      });
    }
    const { values } = parsed;
    if (Object.keys(values).length === 0) {
      const user = await Staff.findById(req.user.id).select(STAFF_SAFE_SELECT);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    }

    const existing = await Staff.findById(req.user.id);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (values.email != null && values.email !== existing.email) {
      const taken = await Staff.findOne({
        email: values.email,
        _id: { $ne: existing._id },
      });
      if (taken) {
        return res.status(400).json({
          message: "That email is already in use.",
          errors: { email: "That email is already in use." },
        });
      }
    }

    const update = { ...values };
    const user = await Staff.findByIdAndUpdate(req.user.id, update, {
      new: true,
    }).select(STAFF_SAFE_SELECT);

    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or username conflict.",
        errors: { email: "That email is already in use." },
      });
    }
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
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const currentOk = await verifyStoredPassword(currentPassword, user.password);
    if (!currentOk) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const STAFF_FORGOT_PASSWORD_MESSAGE =
  "If a staff account exists for that email, password reset instructions have been sent.";

export async function forgotStaffPassword(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "A valid email is required." });
    }
    const user = await Staff.findOne({ email });
    if (user) {
      const token = generatePasswordResetToken();
      user.resetToken = token;
      user.resetTokenExpiry = passwordResetExpiryDate();
      await user.save();
      const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
      const link = `${base}/admin/reset-password?token=${encodeURIComponent(token)}`;
      console.log("[Staff password reset]", { email: user.email, resetLink: link });
    }
    res.json({ message: STAFF_FORGOT_PASSWORD_MESSAGE });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function resetStaffPasswordWithToken(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      return res.status(400).json({ message: policy.message });
    }
    const user = await Staff.findOne({ resetToken: String(token).trim() });
    if (!user?.resetTokenExpiry || new Date(user.resetTokenExpiry) <= new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset link. Request a new one." });
    }
    user.password = await hashPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    res.json({ message: "Password has been reset. You can sign in with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function updateStaff(req, res) {
  try {
    const body = { ...req.body };
    delete body.password;
    delete body.resetToken;
    delete body.resetTokenExpiry;
    if (body.email != null && String(body.email).trim() !== "" && !isValidStaffAccountEmail(body.email)) {
      return res.status(400).json({ message: staffAccountEmailErrorMessage() });
    }
    const user = await Staff.findByIdAndUpdate(req.params.id, body, { new: true }).select(STAFF_SAFE_SELECT);
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
    const targetId = req.params.id;
    const user = await Staff.findById(targetId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const portfolios = await DesignerPortfolio.find({ staff: targetId });
    for (const p of portfolios) {
      for (const img of p.images) {
        await deleteUploadedRelPath(img.relPath);
      }
    }
    await DesignerPortfolio.deleteMany({ staff: targetId });
    await Staff.findByIdAndDelete(targetId);
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
