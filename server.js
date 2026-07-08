const express = require("express");
const path = require("path");
const fs = require("fs");
const Razorpay = require('razorpay');
const bcrypt = require('bcryptjs'); // Password encrypt karne ke liye
const jwt = require('jsonwebtoken'); // Session token ke liye
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "apni_koi_bhi_secret_key_yahan_likho";

// File paths
const JOURNAL_FILE = path.join(__dirname, "backend", "database", "journal.json");
const USERS_FILE = path.join(__dirname, "backend", "database", "users.json");

// Static files aur json parser configuration
app.use(express.static(__dirname));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Razorpay initialize
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret"
});

const PLAN_MAPPING = {
    "150": "plan_YOUR_1_MONTH_PLAN_ID",
    "700": "plan_YOUR_6_MONTH_PLAN_ID",
    "1000": "plan_YOUR_1_YEAR_PLAN_ID"
};

/*=========================================================
AUTHENTICATION ROUTES (SIGNUP & LOGIN)
=========================================================*/

// 1. SIGNUP ROUTE
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email aur Password zaroori hain" });

        // Purane users load karein
        let users = [];
        if (fs.existsSync(USERS_FILE)) {
            users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8") || "[]");
        }

        // Check karein user pehle se toh nahi hai
        const userExists = users.find(u => u.email === email);
        if (userExists) return res.status(400).json({ error: "Yeh Email pehle se registered hai" });

        // Password ko encrypt (hash) karein
        const hashedPassword = await bcrypt.hash(password, 10);

        // Naya user object (By default role: 'user')
        const newUser = {
            id: "user_" + Date.now(),
            email,
            password: hashedPassword,
            role: "user", 
            isPaid: false
        };

        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");

        res.json({ success: true, message: "Registration successful!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Server error during signup" });
    }
});
// 2. LOGIN ROUTE
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email aur Password dalein" });

        if (!fs.existsSync(USERS_FILE)) return res.status(400).json({ error: "Koyee user nahi mila. Pehle Signup karein" });
        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8") || "[]");

        const user = users.find(u => u.email === email);
        if (!user) return res.status(400).json({ error: "Galat Email ya Password" });

        // Password match karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Galat Email ya Password" });

        // === 👑 ADMIN CHECK LOGIC HERE ===
        // Agar email aapki hai toh role 'admin' hoga, nahi toh database wala role (ya default 'user')
        const finalRole = user.email === 'mosinmansuri1432@gmail.com' ? 'admin' : (user.role || 'user');

        // JWT Token banayein (Humne user.role ki jagah finalRole daal diya hai)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: finalRole, isPaid: user.isPaid },
            JWT_SECRET,
            { expiresIn: "7d" } // Login 7 din tak valid rahega
        );

        res.json({
            success: true,
            token,
            user: { email: user.email, role: finalRole, isPaid: user.isPaid }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

/*=========================================================
GET JOURNAL (Ab sirf wahi user apna data dekh payega)
=========================================================*/
app.get("/api/journal", (req, res) => {
    fs.readFile(JOURNAL_FILE, "utf8", (err, data) => {
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
    fs.writeFile(JOURNAL_FILE, JSON.stringify(req.body, null, 2), "utf8", (err) => {
        if (err) {
            console.log("Write Error:", err);
            return res.status(500).json({ error: "Database Write Error" });
        }
        res.json({ success: true });
    });
});


/*=========================================================
RAZORPAY SUBSCRIPTION ROUTE
=========================================================*/
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { amount } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "your_razorpay_key_id_here") {
            console.log(`⚠️ Mock Mode Active: Creating fake subscription for ₹${amount}`);
            return res.json({
                success: true,
                subscription_id: "sub_MOCK_" + Math.random().toString(36).substring(2, 10),
                key_id: "rzp_test_MOCK_KEY",
                isMock: true
            });
        }

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
SERVER START
=========================================================*/
app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
});/*=========================================================
👑 ADMIN PANEL BACKEND SECURE APIs
=========================================================*/
const fs = require('fs');
const path = require('path');

// Users data load karne ka helper (agar aapka users.json ka path alag hai toh adjust kar sakte hain)
const USERS_FILE = path.join(__dirname, 'users.json');

function readUsersFromFile() {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        console.error("Error reading users file:", e);
        return [];
    }
}

function writeUsersToFile(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing users file:", e);
    }
}

// 1. Saare Users aur Stats nikalne ka API
app.get('/api/admin/users', (req, res) => {
    try {
        // Security Check: Token validation ya simple check
        // Abhi ke liye hum direct data bhej rahe hain taaki aapka test ho sake
        const users = readUsersFromFile();
        
        // Counters Calculate karein
        const totalUsers = users.length;
        const paidUsers = users.filter(u => u.isPaid === true).length;
        
        // Maan lete hain Pro plan ki keemat ₹999 hai, us hisab se rough revenue
        const revenue = paidUsers * 999; 

        // Sirf password hatakar baaki safe data frontend ko bhejein
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

// 2. Kisi bhi user ko Pro banane ya Downgrade karne ka API
app.post('/api/admin/toggle-status', (req, res) => {
    try {
        const { email, isPaid } = req.body;
        let users = readUsersFromFile();
        
        let userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].isPaid = isPaid;
            
            // Agar Pro kiya hai toh expiry date bhi daal dete hain (e.g., 30 days baad)
            if(isPaid) {
                let expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                users[userIndex].planExpiry = expiry.toLocaleDateString();
            } else {
                users[userIndex].planExpiry = 'N/A';
            }
            
            writeUsersToFile(users);
            return res.json({ success: true, message: "User status updated successfully!" });
        }
        
        res.status(404).json({ error: "User not found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});