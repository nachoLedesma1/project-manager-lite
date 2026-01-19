import * as React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Board from "./components/Board";
import Login from "./components/Login";
import { HeroUIProvider } from "@heroui/react";
import RegisterUser from "./components/RegisterUser";
import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
      <HeroUIProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterUser />} />
          {/* CORRECCIÓN 1: La raíz debe ser Home */}
          <Route path="/" element={<Home />} />
          
          {/* CORRECCIÓN 2: Ruta dinámica para el tablero */}
          {/* Board debe ser capaz de leer el ID de la URL */}
          <Route path="/board/:boardId" element={<Board />} />
        </Routes>
      </HeroUIProvider>
    </BrowserRouter>
  );
}

export default App;
