const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT  = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/tasks", tasksRoute);

const collection = db.collection("items");

// routes
// GET all items
app.get("/api/items", async (req, res) => {
    try {
        const snapshot = await collection.get();
        const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single item
app.get("/api/items/:id", async (req, res) => {
    try {
        const doc = await collection.doc(req.params.id).get();

        if (!doc.exists) {
        return res.status(404).json({ message: "Item not found" });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// CREATE item
app.post("/api/items", async (req, res) => {
    try {
        const docRef = await collection.add(req.body);
        res.status(201).json({ id: docRef.id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE item
app.put("/api/items/:id", async (req, res) => {
    try {
        await collection.doc(req.params.id).update(req.body);
        res.json({ message: "Item updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE item
app.delete("/api/items/:id", async (req, res) => {
    try {
        await collection.doc(req.params.id).delete();
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// start server
app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
})