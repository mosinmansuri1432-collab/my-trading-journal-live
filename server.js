const express = require("express");
const path = require("path");
const fs = require("fs");
const Razorpay = require('razorpay');
require('dotenv').config(); // .env variables load karne ke liye

const app = express();
const PORT = process.env.PORT || 5000;

// Static files aur json parser configuration
app.use(express.static(__dirname));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Razorpay initialize karein (Keys .env file se aayengi)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 3 Plans ki Mapping (Apni Razorpay dashboard wali IDs yahan dalein)
const PLAN_MAPPING = {
    "150": "plan_YOUR_1_MONTH_PLAN_ID",  // 1 Month Plan ID
    "700": "plan_YOUR_6_MONTH_PLAN_ID",  // 6 Months Plan ID
    "1000": "plan_YOUR_1_YEAR_PLAN_ID"   // 1 Year Plan ID
};

/*=========================================================
GET JOURNAL
=========================================================*/
app.get("/api/journal", (req, res) => {
    const filePath = path.join(__dirname, "backend", "database", "journal.json");
    
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log("Read Error:", err);
            return res.status(500).json(err);
        }
        res.json(JSON.parse(data));
    });
});

/*=========================================================
SAVE JOURNAL
=========================================================*/
app.post("/api/journal", (req, res) => {
    const filePath = path.join(__dirname, "backend", "database", "journal.json");

    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf8", (err) => {
        if (err) {
            console.log("Write Error:", err);
            return res.status(500).json({ error: "Database Write Error" });
        }
        res.json({ success: true });
    });
});


/*=========================================================
RAZORPAY SUBSCRIPTION ROUTE (WITH MOCK/TESTING MODE)
=========================================================*/
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { amount } = req.body;

        // Agar .env me real keys nahi hain, toh test karne ke liye ye Fake data bhejega
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "your_razorpay_key_id_here") {
            console.log(`⚠️ Mock Mode Active: Creating fake subscription for ₹${amount}`);
            return res.json({
                success: true,
                subscription_id: "sub_MOCK_" + Math.random().toString(36).substring(2, 10),
                key_id: "rzp_test_MOCK_KEY",
                isMock: true // Frontend ko batane ke liye ki ye mock mode hai
            });
        }

        // REAL RAZORPAY CODE (Jab aap account login karenge tab ye chalega)
        const planId = PLAN_MAPPING[amount];
        const options = {
            plan_id: planId,
            total_count: amount === "150" ? 12 : (amount === "700" ? 2 : 1),
            quantity: 1,
            customer_notify: 1
        };

        const subscription = await razorpay.subscriptions.create(options);
        res.json({
            success: true,
            subscription_id: subscription.id,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ success: false, message: "Subscription create nahi ho paya" });
    }
});

/*=========================================================
HOME PAGE ROUTE
=========================================================*/
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/*=========================================================
👑 ADMIN PANEL BACKEND SECURE APIs & OTP PASSWORD RESET
=========================================================*/
const nodemailer = require('nodemailer');
let otpStore = {}; // Temporary memory OTP save karne ke liye

// Users data load karne ka path (Jo aapke database folder me users.json h)
const ADMIN_USERS_FILE = path.join(__dirname, 'backend', 'database', 'users.json');

function adminReadUsers() {
    try {
        if (!fs.existsSync(ADMIN_USERS_FILE)) return [];
        const data = fs.readFileSync(ADMIN_USERS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        console.error("Error reading users file:", e);
        return [];
    }
}

function adminWriteUsers(users) {
    try {
        fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing users file:", e);
    }
}

// Apne Gmail SMTP se connect karne ke liye config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mosinmansuri1432@gmail.com', // Aapka email
        pass: 'xxxx xxxx xxxx xxxx' // ⚠️ YAHAN AAPKA GMAIL APP PASSWORD AAYEGA (Bina spaces ke)
    }
});

// 1. Saare Users aur Stats nikalne ka Admin API
app.get('/api/admin/users', (req, res) => {
    try {
        const users = adminReadUsers();
        const totalUsers = users.length;
        const paidUsers = users.filter(u => u.isPaid === true).length;
        const revenue = paidUsers * 999; 

        const safeUsersList = users.map(u => ({
            email: u.email,
            role: u.email === 'mosinmansuri1432@gmail.com' ? 'admin' : (u.role || 'user'),
            isPaid: u.isPaid || false,
            planExpiry: u.planExpiry || 'N/A'
        }));

        res.json({
            success: true,
            totalUsers,
            paidUsers,
            revenue,
            users: safeUsersList
        });
    } catch (error) {
        console.error("Admin API Error:", error);
        res.status(500).json({ error: "Server Internal Error" });
    }
});

// 2. User ko Pro banane ya Downgrade karne ka Admin API
app.post('/api/admin/toggle-status', (req, res) => {
    try {
        const { email, isPaid } = req.body;
        let users = adminReadUsers();
        
        let userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].isPaid = isPaid;
            
            if(isPaid) {
                let expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                users[userIndex].planExpiry = expiry.toLocaleDateString();
            } else {
                users[userIndex].planExpiry = 'N/A';
            }
            
            adminWriteUsers(users);
            return res.json({ success: true, message: "User status updated successfully!" });
        }
        res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// 3. Forgot Password - User ko OTP bhejne ka API
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const users = adminReadUsers();
        const userExists = users.find(u => u.email === email);

        if (!userExists) {
            return res.status(404).json({ error: "Yeh email registered nahi hai!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; 

        const mailOptions = {
            from: '"Discipline Advanced Trader" <mosinmansuri1432@gmail.com>',
            to: email,
            subject: '🔒 Password Reset OTP Code',
            html: `<h3>Discipline Advanced Trader - Security Verification</h3>
                   <p>Aapne password reset ke liye request kiya hai. Aapka 6-digit verification code hai:</p>
                   <h1 style="color:#d4af37; letter-spacing: 4px;">${otp}</h1>
                   <p>Yeh code agle 10 minute tak valid hai. Agar aapne yeh request nahi kiya toh ise ignore karein.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP aapke email par bhej diya gaya hai!" });
    } catch (err) {
        console.error("Email send error:", err);
        res.status(500).json({ error: "Email bhejne mein dikkat aayi. SMTP config check karein." });
    }
});

// 4. Reset Password - OTP aur Naya Password Verify karne ka API
app.post('/api/auth/reset-password', (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if (!otpStore[email] || otpStore[email].otp !== otp || otpStore[email].expires < Date.now()) {
            return res.status(400).json({ error: "Invalid ya Expired OTP code!" });
        }

        let users = adminReadUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            users[userIndex].password = newPassword; 
            adminWriteUsers(users);
            delete otpStore[email]; 
            return res.json({ success: true, message: "Password kamyabi se badal gaya hai!" });
        }
        res.status(404).json({ error: "User nahi mila." });
    } catch (error) {
        res.status(500).json({ error: "Failed to reset password" });
    }
});

/*=========================================================
SERVER START
=========================================================*/
app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
});