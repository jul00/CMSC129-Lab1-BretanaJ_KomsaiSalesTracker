import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { db } from "../config/firebase";
import '../App.css'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";

// TypeScript interfaces
interface Sticker {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
}

interface StickerFormData {
  code: string;
  name: string;
  price: string;
  stock: string;
}

const StickerManager: React.FC = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [form, setForm] = useState<StickerFormData>({
    code: "",
    name: "",
    price: "",
    stock: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Sticker>>({});

  // Fetch stickers from Firestore
  const fetchStickers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "stickers"));
      const data: Sticker[] = querySnapshot.docs.map((doc) => {
        const stickerData = doc.data() as DocumentData;
        return {
          id: doc.id,
          code: stickerData.code,
          name: stickerData.name,
          price: stickerData.price,
          stock: stickerData.stock,
          sold: stickerData.sold ?? 0,
        };
      });
      setStickers(data);
    } catch (error) {
      console.error("Error fetching stickers:", error);
    }
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  // Add new sticker
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newSticker = {
        code: form.code.toUpperCase(),
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        sold: 0,
      };
      const docRef = await addDoc(collection(db, "stickers"), newSticker);
      setStickers((prev) => [...prev, { ...newSticker, id: docRef.id }]);
      setForm({ code: "", name: "", price: "", stock: "" });
      alert("Sticker added!");
    } catch (error) {
      console.error("Error adding sticker:", error);
      alert("Failed to add sticker.");
    }
  };

  const handleChange =
    (field: keyof StickerFormData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  // Delete sticker
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sticker?")) return;
    try {
      await deleteDoc(doc(db, "stickers", id));
      setStickers((prev) => prev.filter((sticker) => sticker.id !== id));
    } catch (error) {
      console.error("Error deleting sticker:", error);
    }
  };

  // Start editing
  const startEdit = (sticker: Sticker) => {
    setEditingId(sticker.id);
    setEditData({ name: sticker.name, price: sticker.price, stock: sticker.stock });
  };

  // Save edits
  const saveEdit = async (id: string) => {
    try {
      const stickerRef = doc(db, "stickers", id);
      await updateDoc(stickerRef, {
        name: editData.name,
        price: editData.price,
        stock: editData.stock,
      });
      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...editData } as Sticker : s))
      );
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating sticker:", error);
    }
  };

  const handleEditChange =
    (field: keyof Sticker) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditData({ ...editData, [field]: e.target.value });
    };

  return (
    <div id="component-wrapper">
      <h2>Add Sticker</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px", display: "flex", gap: ".5rem" }}>
        <input
          placeholder="Code (2-4 letters)"
          value={form.code}
          onChange={handleChange("code")}
          required
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={handleChange("name")}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange("price")}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange("stock")}
          required
        />
        <button type="submit" style={{ width: "5rem", cursor: "pointer" }}>Add</button>
      </form>

      <h2>Sticker Inventory</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Code</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Stock</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Sold</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stickers.map((sticker) => (
            <tr key={sticker.id}>
              <td style={{ border: "1px solid black", padding: "8px" }}>{sticker.code}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {editingId === sticker.id ? (
                  <input
                    value={editData.name as string}
                    onChange={handleEditChange("name")}
                  />
                ) : (
                  sticker.name
                )}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {editingId === sticker.id ? (
                  <input
                    type="number"
                    value={editData.price as number}
                    onChange={handleEditChange("price")}
                  />
                ) : (
                  `₱${sticker.price}`
                )}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {editingId === sticker.id ? (
                  <input
                    type="number"
                    value={editData.stock as number}
                    onChange={handleEditChange("stock")}
                  />
                ) : (
                  sticker.stock
                )}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{sticker.sold}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {editingId === sticker.id ? (
                  <>
                    <button onClick={() => saveEdit(sticker.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(sticker)}>Edit</button>
                    <button onClick={() => handleDelete(sticker.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StickerManager;