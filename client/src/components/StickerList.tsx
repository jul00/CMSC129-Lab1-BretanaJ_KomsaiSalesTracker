import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  increment,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";

// Define a TypeScript interface for a Sticker
interface Sticker {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
}

const StickerList: React.FC = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stickers"));
        console.log("Total docs found:", querySnapshot.size);

        // Map Firestore docs to Sticker objects
        const data: Sticker[] = querySnapshot.docs.map((doc) => {
          const stickerData = doc.data() as DocumentData;
          return {
            id: doc.id,
            code: stickerData.code,
            name: stickerData.name,
            price: stickerData.price,
            stock: stickerData.stock,
            sold: stickerData.sold,
          };
        });

        console.log("Mapped Data:", data);
        setStickers(data);
      } catch (error) {
        console.error("Error fetching stickers:", error);
      }
    };

    fetchStickers();
  }, []);

  return (
    <div>
      <h2>Sticker Inventory</h2>
      {stickers.map((sticker) => (
        <div key={sticker.id}>
          <strong>{sticker.code}</strong> - {sticker.name} | ₱{sticker.price} | Stock:{" "}
          {sticker.stock} | Sold: {sticker.sold}
        </div>
      ))}
    </div>
  );
};

export default StickerList;