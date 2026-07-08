const express = require("express");
const path = require("path");
const fs = require("fs");
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
require('dotenv').config(); // .env variables load karne ke liye

const app = express();
const PORT = process.env.PORT || 5000;

// OTP save karne ke liye global memory variable
let otpStore = {}; 

// Static files aur json parser configuration
app.use(express.static(__dirname));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Users data load karne ka path (Jo aapke database folder me users.json h)
const ADMIN_USERS_FILE = path.join(__dirname, 'backend', 'database', 'users.json');

/*=========================================================
📦 HELPER FUNCTIONS (Yahan sabse upar rakh diye hain)
=========================================================*/
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

// Razorpay initialize karein (Keys .env file se aayengi)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 3 Plans ki Mapping
const PLAN_MAPPING = {
    "150": "plan_YOUR_1_MONTH_PLAN_ID",
    "700": "plan_YOUR_6_MONTH_PLAN_ID",
    "1000": "plan_YOUR_1_YEAR_PLAN_ID"
};

// Apne Gmail SMTP se connect karne ke liye config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mosinmansuri1432@gmail.com', 
        pass: 'xxxx xxxx xxxx xxxx' // ⚠️ YAHAN AAPKA GMAIL APP PASSWORD AAYEGA
    }
});

/*=========================================================
🔄 USER-SPECIFIC GET JOURNAL (Fix: Har user ka apna data)
=========================================================*/
app.get("/api/journal", (req, res) => {
    const userEmail = req.query.email;
    let fileName = "journal.json"; 
    
    if (userEmail) {
        const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, "_");
        fileName = `journal_${safeEmail}.json`;
    }

    const filePath = path.join(__dirname, "backend", "database", fileName);
    
    if (!fs.existsSync(filePath)) {
        return res.json([]);
    }

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log("Read Error:", err);
            return res.status(500).json(err);
        }
        res.json(JSON.parse(data || "[]"));
    });
});

/*=========================================================
🔄 USER-SPECIFIC SAVE JOURNAL (Fix: Dusro ka data overwrite nahi hoga)
=========================================================*/
app.post("/api/journal", (req, res) => {
    const { email, journalData } = req.body;
    let fileName = "journal.json";
    let dataToSend = req.body;

    if (email) {
        const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
        fileName = `journal_${safeEmail}.json`;
        dataToSend = journalData; 
    }

    const filePath = path.join(__dirname, "backend", "database", fileName);

    fs.writeFile(filePath, JSON.stringify(dataToSend, null, 2), "utf8", (err) => {
        if (err) {
            console.log("Write Error:", err);
            return res.status(500).json({ error: "Database Write Error" });
        }
        res.json({ success: true });
    });
});

/*=========================================================
🔐 USER REGISTRATION (SIGN UP) API (Safe & Multiple Routes)
=========================================================*/
const handleRegister = (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email aur Password dono chahiye!" });
        }

        let users = adminReadUsers();

        const userExists = users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ error: "Yeh email pehle se registered hai!" });
        }

        const newUser = {
            email,
            password,
            role: email === 'mosinmansuri1432@gmail.com' ? 'admin' : 'user',
            isPaid: false,
            planExpiry: 'N/A'
        };

        users.push(newUser);
        adminWriteUsers(users);

        return res.json({ success: true, message: "Registration successful! Ab login karein." });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ error: "Registration failed!" });
    }
};

app.post('/api/auth/register', handleRegister);
app.post('/api/register', handleRegister);
app.post('/register', handleRegister);

/*=========================================================
🔑 USER LOGIN SIGN IN API (Safe & Multiple Routes)
=========================================================*/
const handleLogin = (req, res) => {
    try {
        const { email, password } = req.body;
        const users = adminReadUsers();

        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).json({ error: "Invalid email ya password!" });
        }

        return res.json({
            success: true,
            user: {
                email: user.email,
                role: user.email === 'mosinmansuri1432@gmail.com' ? 'admin' : (user.role || 'user'),
                isPaid: user.isPaid || false
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Login system error!" });
    }
};

app.post('/api/auth/login', handleLogin);
app.post('/api/login', handleLogin);
app.post('/login', handleLogin);

/*=========================================================
👑 ADMIN PANEL BACKEND SECURE APIs 
=========================================================*/
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

/*=========================================================
📩 OTP PASSWORD RESET SYSTEM
=========================================================*/
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
});