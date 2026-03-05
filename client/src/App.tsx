import React from "react";
import StickerForm from "./components/StickerForm";
import SalesPage from "./components/SalesPage";
import TransactionsPage from "./components/TransactionsPage";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div id="main-wrapper">
        <div id="navbar">
          <h1>Komstickr</h1>

          {/* Navigation Buttons */}
          <div id="navbuttons">
            <Link to="/">
              <button id="navbutton">Sales Page</button>
            </Link>
            <Link to="/form">
              <button id="navbutton">Sticker Inventory</button>
            </Link>
            <Link to="/transactions">
              <button id="navbutton">Transactions</button>
            </Link>
          </div>
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