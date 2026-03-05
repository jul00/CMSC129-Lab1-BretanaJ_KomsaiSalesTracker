const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseKey.json");
require("dotenv").config();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const collection = db.collection("stickers");

const app = express();
const PORT  = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// app.use("/api/tasks", tasksRoute);


// routes
// GET all items
app.get("/api/stickers", async (req, res) => {
    try {
        const snapshot = await collection.get();
        const stickers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json(stickers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET single item
app.get("/api/stickers/:id", async (req, res) => {
    try {
        const doc = await collection.doc(req.params.id).get();

    if (!doc.exists) {
        return res.status(404).json({ error: "Sticker not found" });
    }

    res.json({ id: doc.id, ...doc.data() });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// CREATE item
app.post("/api/stickers", async (req, res) => {
    try {
        const { code, name, price, stock } = req.body;

        // Validate code (3–4 letters only)
        const codeRegex = /^[A-Z]{2,4}$/;
        if (!codeRegex.test(code)) {
            return res.status(400).json({
                error: "Code must be 2–4 uppercase letters"
            });
        }

        // Check if code already exists
        const existing = await collection.where("code", "==", code).get();
        if (!existing.empty) {
            return res.status(400).json({ error: "Code already exists" });
        }

        const newSticker = {
            code,
            name,
            price,
            stock,
            sold: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await collection.add(newSticker);

        res.status(201).json({ id: docRef.id, ...newSticker });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE item
app.put("/api/stickers/:id", async (req, res) => {
    try {
        await collection.doc(req.params.id).update(req.body);
        res.json({ message: "Sticker updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE item
app.delete("/api/stickers/:id", async (req, res) => {
    try {
        await collection.doc(req.params.id).delete();
        res.json({ message: "Sticker deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.patch("/api/stickers/:id/sell", async (req, res) => {
    try {
        const docRef = collection.doc(req.params.id);
        const doc = await docRef.get();

        const data = doc.data();

        if (data.stock <= 0) {
            return res.status(400).json({ error: "Out of stock" });
        }

        await docRef.update({
            stock: data.stock - 1,
            sold: data.sold + 1
        });

        res.json({ message: "Sale recorded" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// sales
app.post("/sales", async (req, res) => {
    const { items, total, paymentMethod } = req.body;

    const sale = {
        items,
        total,
        paymentMethod,
        createdAt: new Date()
    };

    await db.collection("sales").add(sale);

    res.json({ message: "Sale recorded" });
});

// transaction history
app.get("/sales", async (req, res) => {
    const snapshot = await db.collection("sales").get();

    const sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json(sales);
});



// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})