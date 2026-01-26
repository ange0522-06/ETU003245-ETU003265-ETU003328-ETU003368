import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Auth from "./Auth";
import Map from "./Map";
import Dashboard from "./Dashboard";
import Manager from "./Manager";
import "./assets/ui.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/map" element={<Map />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;