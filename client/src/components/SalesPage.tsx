import { useState, useEffect } from "react";
import { db } from "../config/firebase"; 
import '../App.css'
import { 
    collection, 
    getDocs, 
    query,
    orderBy,
    doc, 
    writeBatch, 
    increment, 
    serverTimestamp 
} from "firebase/firestore";

interface Sticker {
  id: string;
  name: string;
  price: number;
  stock: number;
  sold?: number;
}

interface CartItem extends Sticker {
  quantity: number;
}

function SalesPage() {
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("Cash");

    useEffect(() => {
        const fetchStickers = async () => {
            try {
                const stickersRef = collection(db, "stickers");

                const q = query(stickersRef, orderBy("name", "asc"));

                const querySnapshot = await getDocs(q); 
                
                const data: Sticker[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Sticker, "id">)
                }));
                
                setStickers(data);
            } catch (error) {
                console.error("Error fetching stickers:", error);
            }
        };

        fetchStickers();
    }, []);

    const addToCart = (sticker: Sticker) => {
        const existing = cart.find(item => item.id === sticker.id);

    if (existing) {
        setCart(cart.map(item =>
            item.id === sticker.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        } else {
            setCart([...cart, { ...sticker, quantity: 1 }]);
        }
    };

    const removeFromCart = (stickerId: String) => {
        const existing = cart.find(item => item.id === stickerId);

        if (!existing) return;
        
        if (existing.quantity > 1) {
            // If more than 1, just reduce the quantity
            setCart(cart.map(item =>
                item.id === stickerId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ));
        } else {
            // If only 1 remains, remove the item entirely
            setCart(cart.filter(item => item.id !== stickerId));
        }
    };

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleSale = async () => {
        if (cart.length === 0) return alert("Cart is empty!");

        try {
            const batch = writeBatch(db);
            const salesRef = collection(db, "sales");
            const newSaleRef = doc(salesRef);

            const itemsToSave = cart.map(item =>({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }));

            batch.set(newSaleRef, {
                items: itemsToSave,
                total: totalPrice,
                paymentMethod,
                saleTime: serverTimestamp()
            });

            cart.forEach((item) => {
                const stickerDocRef = doc(db, "stickers", item.id);
                // Use increment(-quantity) to reduce the stock count in Firestore
                batch.update(stickerDocRef, {
                    stock: increment(-item.quantity),
                    sold: increment(item.quantity)  
                });
            });

            await batch.commit();

            setCart([]);
            alert("Sale successful! Inventory updated.");
        } catch (error) {
            console.error("Error processing sale: ", error);
            alert("Transaction failed. Please try again.");
        }
    }        

    return (
        <div id="component-wrapper">

            <h3>Available Stickers</h3>
            <div style={{
                display:"flex",
                flexDirection: "row"
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(125px, 1fr))",
                    gap: "5px",
                    width: "80%",
                }}>
                    
                    {stickers.map(sticker => (
                        <button
                            key={sticker.id}
                            onClick={() => addToCart(sticker)}
                            disabled={sticker.stock <= 0}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "15px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: sticker.stock > 0 ? "#fff" : "#f0f0f0",
                                cursor: sticker.stock > 0 ? "pointer" : "not-allowed",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "transform 0.1s, background-color 0.2s",
                            }}
                            // Adding a small hover effect via inline styles is tricky, 
                            // but we can use onMouseEnter/Leave if needed.
                        >
                            <span style={{ fontWeight: "bold", textAlign: "center", marginBottom: "5px" }}>
                                {sticker.name}
                            </span>
                            <span style={{ color: "#2e7d32", fontSize: "1.1rem" }}>
                                ₱{sticker.price}
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>
                                Stock: {sticker.stock}
                            </span>
                        </button>
                    ))}
                </div>
                <div style={{ 
                    width: "20%",
                    marginLeft: "15px",
                    position: "fixed",
                    right: "0"
                }}>
                    <h3>Cart</h3>
                    {cart.map(item => (
                        <div key={item.id}>
                            {item.name} x {item.quantity}
                            <button 
                                onClick={() => removeFromCart(item.id)} 
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <h3>Total: ₱{totalPrice}</h3>

                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option>Cash</option>
                        <option>GCash</option>
                        <option>Maya</option>
                    </select>

                    <button onClick={handleSale}>Complete Sale</button>
                </div>
            </div>
        </div>
    );
}

export default SalesPage;
