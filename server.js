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
SERVER START
=========================================================*/
app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
});