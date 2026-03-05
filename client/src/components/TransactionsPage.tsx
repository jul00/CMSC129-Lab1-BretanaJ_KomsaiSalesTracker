import { useState, useEffect, ChangeEvent } from "react";
import { db } from "../config/firebase";
import '../App.css'
import { 
  collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, writeBatch, increment, DocumentData, Timestamp 
} from "firebase/firestore";

// Types
interface SoldItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: string;
  total: number;
  paymentMethod: string;
  saleTime?: Timestamp;
  items: SoldItem[];
}

function TransactionsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>("");

  // Fetch all sales
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesRef = collection(db, "sales");
        const q = query(salesRef, orderBy("saleTime", "desc"));
        const querySnapshot = await getDocs(q);

        const data: Sale[] = querySnapshot.docs.map((doc) => {
          const saleData = doc.data() as DocumentData;
          return {
            id: doc.id,
            total: saleData.total,
            paymentMethod: saleData.paymentMethod,
            saleTime: saleData.saleTime,
            items: saleData.items || [],
          };
        });

        setSales(data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchSales();
  }, []);

  // Filter sales based on selected date range
  const filteredSales = sales.filter((sale) => {
    if (!sale.saleTime) return false;
    const saleDate = sale.saleTime.toDate();

    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // start of day
    }
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // end of day
    }

    if (start && saleDate < start) return false;
    if (end && saleDate > end) return false;
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  // Revenue breakdown by payment method
  const revenueByMethod = filteredSales.reduce<Record<string, number>>((acc, sale) => {
    if (!acc[sale.paymentMethod]) acc[sale.paymentMethod] = 0;
    acc[sale.paymentMethod] += sale.total;
    return acc;
  }, {});

  // Edit transaction (payment method only)
  const handleEdit = async (saleId: string, newPaymentMethod: string) => {
    try {
      await updateDoc(doc(db, "sales", saleId), { paymentMethod: newPaymentMethod });
      setSales(prev =>
        prev.map(s => (s.id === saleId ? { ...s, paymentMethod: newPaymentMethod } : s))
      );
      alert("Transaction updated.");
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction.");
    }
  };

  // Delete transaction and restore inventory
  const handleDelete = async (saleId: string, items: SoldItem[]) => {
    // if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const batch = writeBatch(db);

      // Restore stock and reduce sold count
      items.forEach(item => {
        const stickerRef = doc(db, "stickers", item.id);
        batch.update(stickerRef, {
          stock: increment(item.quantity),
          sold: increment(-item.quantity)
        });
      });

      // Delete the sale
      batch.delete(doc(db, "sales", saleId));

      await batch.commit();

      setSales(prev => prev.filter(s => s.id !== saleId));

      alert("Transaction deleted and inventory restored.");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
    }
  };

  return (
    <div id="component-wrapper">
      <h3>Transaction History</h3>

      {sales.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <>
          {/* Date range selector */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              Start Date:{" "}
              <input
                type="date"
                value={startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </label>
            <label style={{ marginLeft: "10px" }}>
              End Date:{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          {/* Total revenue */}
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Revenue from selected date range: ₱{totalRevenue}
          </div>

          {/* Revenue by payment method */}
          <div style={{ marginBottom: "20px" }}>
            {Object.entries(revenueByMethod).map(([method, amount]) => (
              <div key={method}>
                {method}: ₱{amount}
              </div>
            ))}
          </div>

          {/* Transaction table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "8px", width: "12rem" }}>Time</th>
                <th style={{ border: "1px solid black", padding: "8px", width: "7rem" }}>Payment Method</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Total</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Stickers Sold</th>
                <th style={{ border: "1px solid black", padding: "8px", width: "4rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => {
                // Sort stickers alphabetically
                const sortedItems = [...sale.items].sort((a, b) => a.name.localeCompare(b.name));

                return (
                  <tr key={sale.id}>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      {sale.saleTime?.toDate().toLocaleString() || "-"}
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px", width: "5rem" }}>
                      <input
                        type="text"
                        value={sale.paymentMethod}
                        onChange={(e) => handleEdit(sale.id, e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>₱{sale.total}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <ul style={{ margin: 0, paddingLeft: "20px" }}>
                        {sortedItems.map((item) => (
                          <li key={item.id}>
                            {item.name} x{item.quantity} (₱{item.price})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <button onClick={() => handleDelete(sale.id, sale.items)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default TransactionsPage;