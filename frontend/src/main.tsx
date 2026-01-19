
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Board from "./components/Board";
import Login from "./components/Login";
// 1. import `HeroUIProvider` component
import { HeroUIProvider } from "@heroui/react";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import RegisterUser from "./components/RegisterUser.tsx";
import Home from "./components/Home.tsx";
import MainLayout from "./components/MainLayout.tsx";
import WorkspaceView from "./components/WorkspaceView.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <HeroUIProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />

        {/* Rutas privadas */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Rutas dentro del layout protegido */}
          <Route path="/home" element={<Home />} />
          <Route path="/workspace/:workspaceId" element={<WorkspaceView />} />
          <Route path="/board/:proyectoId" element={<Board />} />
        </Route>
      </Routes>
    </HeroUIProvider>
  </BrowserRouter>
);
