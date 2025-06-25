import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PubLayout from "./layouts/PubLayout.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import MainLayout from "./layouts/MainLayout.jsx";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<PubLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/animes/:id" element={<Home />} />
            <Route path="/genres" element={<Home />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/my-animes" element={<Home />} />
            <Route path="/my-animes/:id" element={<Home />} />
            <Route path="/my-genres" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
