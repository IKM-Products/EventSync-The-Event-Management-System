const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Helper wrapper functions to make NeDB work seamlessly with async/await
const dbFindOne = (query) => new Promise((resolve, reject) => {
  global.db.findOne(query, (err, doc) => err ? reject(err) : resolve(doc));
});

const dbInsert = (doc) => new Promise((resolve, reject) => {
  global.db.insert(doc, (err, newDoc) => err ? reject(err) : resolve(newDoc));
});

const dbUpdate = (query, update, options) => new Promise((resolve, reject) => {
  global.db.update(query, update, options, (err, numReplaced) => err ? reject(err) : resolve(numReplaced));
});

// Configure the real Gmail SMTP email delivery transport engine
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
  }
});

// 1. REGISTER / SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, fullName } = req.body;
    console.log(`[SIGNUP ATTEMPT] Email: ${email}, Name: ${fullName}, Role: ${role}`);
    
    // Check if user exists using our global local database
    const existingUser = await dbFindOne({ type: 'user', email });
    if (existingUser) {
      console.log(`[SIGNUP FAILED] User already exists with email: ${email}`);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      type: 'user', 
      email, 
      password: hashedPassword, 
      role: role || 'User', // Default to User if none supplied
      fullName: fullName || email.split('@')[0] // Fallback to email prefix if not supplied
    };
    
    const savedUser = await dbInsert(newUser);
    console.log(`[SIGNUP SUCCESS] New user created with ID: ${savedUser._id}`);
    res.status(201).json({ success: true, message: 'User registered successfully', userId: savedUser._id });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(`\n--- LOGIN ATTEMPT ---`);
    console.log(`Incoming request -> Email: "${email}", Role: "${role}"`);

    // Search for user in database
    const user = await dbFindOne({ type: 'user', email });
    if (!user) {
      console.log(`[LOGIN FAILED] No account found in local database for email: "${email}"`);
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    console.log(`User found in DB -> Email: "${user.email}", Stored Role: "${user.role}"`);

    // Handle legacy accounts or missing role fields in old DB entries gracefully
    const userRole = user.role || 'User';
    if (userRole.toLowerCase() !== role.toLowerCase()) {
      console.log(`[LOGIN FAILED] Role Mismatch -> Stored: "${userRole}" vs Requested: "${role}"`);
      return res.status(400).json({ 
        success: false, 
        message: `Role mismatch. This account is registered as a ${userRole}, but you are trying to log into the ${role} portal.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN FAILED] Password does not match for: "${email}"`);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`[LOGIN SUCCESS] Successful login for: "${email}" as "${userRole}"`);
    const token = jwt.sign({ id: user._id, role: userRole }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: userRole,
        fullName: user.fullName || user.email.split('@')[0] 
      } 
    });
  } catch (err) {
    console.error("[LOGIN SYSTEM ERROR]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. FORGOT PASSWORD ROUTE
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate that the user exists in our local NeDB engine
    const user = await dbFindOne({ type: 'user', email });
    if (!user) return res.status(404).json({ success: false, message: 'Email address not found.' });

    // Generate a secure tracking token valid for 15 minutes
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '15m' });

    // Point this link directly to your Vite frontend application server (running on port 5173)
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Structure a clean HTML template layout for the inbox delivery
    const mailOptions = {
      from: process.env.GMAIL_USER || process.env.EMAIL_USER,
      to: email,
      subject: 'EventSync - Security Password Reset Request',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e3a8a;">Password Reset Request</h2>
          <p>We received a request to reset the password linked to your EventSync account.</p>
          <p>Click the button below to configure a new password. This recovery session will expire in 15 minutes.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
            If you did not request this change, please safely ignore this communication. Your password will remain completely secure.
          </p>
        </div>
      `
    };

    // Fire off the email through Gmail's SMTP channels
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: `A secure recovery link has been delivered to ${email}. Check your inbox!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. UPDATE PASSWORD ROUTE
router.post('/update-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Security token is missing." });
    }

    // Verify and decode the JWT token from the URL link
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    } catch (err) {
      return res.status(400).json({ success: false, message: "Reset link has expired or is invalid." });
    }

    // Encrypt the brand new password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the specific user document in NeDB database via async helper wrapper
    const numReplaced = await dbUpdate(
      { type: 'user', _id: decoded.id },
      { $set: { password: hashedPassword } },
      {}
    );

    if (numReplaced === 0) {
      return res.status(500).json({ success: false, message: "Could not update user record." });
    }

    res.json({ success: true, message: "Your password has been changed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;