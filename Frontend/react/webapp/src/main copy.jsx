import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Auth from "./Auth";
import Map from "./Map";
import Dashboard from "./Dashboard";
import Manager from "./Manager";

import Navbar from "./Navbar";
import { ProfileProvider } from "./ProfileContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProfileProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/map" element={<Map />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager" element={<Manager />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  </React.StrictMode>
);
