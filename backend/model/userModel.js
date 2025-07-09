const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const passwordHistoryLimit = 5;

const passwordHistorySchema = new mongoose.Schema({
  hash: String,
  changedAt: Date,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  image: { type: String, default: null },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  tokens: [{ token: { type: String, required: true } }],
  passwordHistory: [passwordHistorySchema],
  passwordLastChanged: Date,
  otp: { type: String },
  otpExpiry: { type: Number },
});

// Password strength validator
function isStrongPassword(password) {
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return strongRegex.test(password);
}

// Pre-save hook to hash password and check password history
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!isStrongPassword(this.password)) {
    return next(
      new Error(
        "Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character."
      )
    );
  }

  // Check previous passwords for reuse
  for (const entry of this.passwordHistory) {
    const match = await bcrypt.compare(this.password, entry.hash);
    if (match) {
      return next(
        new Error("Cannot reuse recent passwords. Choose a new password.")
      );
    }
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);

    // Add to password history, slice to limit length
    this.passwordHistory.unshift({ hash, changedAt: new Date() });
    this.passwordHistory = this.passwordHistory.slice(0, passwordHistoryLimit);

    this.password = hash;
    this.passwordLastChanged = new Date();

    next();
  } catch (error) {
    return next(error);
  }
  if (this.isModified("phone") && this.phone) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.phone = await bcrypt.hash(this.phone, salt);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate Auth Token
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id, role: this.role, username: this.username },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );
    this.tokens.push({ token });
    await this.save();
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

userSchema.methods.isPasswordExpired = function () {
  const expiryPeriod = 90 * 24 * 60 * 60 * 1000;
  if (!this.passwordLastChanged) return true;
  return Date.now() - this.passwordLastChanged.getTime() > expiryPeriod;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
