import React from "react";
import StickerForm from "./components/StickerForm";
import SalesPage from "./components/SalesPage";
import TransactionsPage from "./components/TransactionsPage";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div id="main-wrapper" style={{ padding: "20px" }}>
        <h1>Komstickr</h1>

        {/* Navigation Buttons */}
        <div style={{ marginBottom: "20px" }}>
          <Link to="/">
            <button style={{ marginRight: "10px" }}>Sales Page</button>
          </Link>
          <Link to="/form">
            <button style={{ marginRight: "10px" }}>Add Sticker</button>
          </Link>
          <Link to="/transactions">
            <button>Transactions</button>
          </Link>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SalesPage />} />
          <Route path="/form" element={<StickerForm />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;