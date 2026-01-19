import React, { useState } from "react";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@heroui/react";
import axios from "axios";

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function RegisterUser() {
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "El usuario es requerido";
    } else if (form.username.length < 3) {
      newErrors.username = "El usuario debe tener al menos 3 caracteres";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/usuarios",
        {
          username: form.username,
          email: form.email,
          password: form.password,
          rol: "USER", // agregamos un rol por defecto la modificación es dentro del programa
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess(true);
      setForm({ username: "", email: "", password: "" });
      console.log("Registro exitoso:", res.data);
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 409) {
          const backendMessage = error.response.data; // por ejemplo: "Usuario ya existe" o "Email ya registrado"

          // Colocamos el mensaje en el input correspondiente
          const newErrors: FormErrors = {};
          if (backendMessage.toLowerCase().includes("usuario")) {
            newErrors.username = backendMessage;
          } else if (backendMessage.toLowerCase().includes("email")) {
            newErrors.email = backendMessage;
          } else {
            newErrors.general = backendMessage; // fallback
          }

          setErrors(newErrors);
        }
      } else if (error.request) {
        setErrors({ general: "No se pudo conectar con el servidor" });
      } else {
        setErrors({ general: "Error inesperado" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h2 className="text-2xl font-bold">Registro de Usuario</h2>
          <p className="text-sm text-gray-500">Crea tu cuenta nueva</p>
        </CardHeader>

        <CardBody className="px-6 py-4">
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ¡Usuario registrado exitosamente!
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              name="username"
              label="Usuario"
              placeholder="Ingresa tu usuario"
              value={form.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
              required
            />

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              required
            />

            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              required
            />

            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="px-6 pb-6">
          <p className="text-sm text-gray-600 text-center w-full">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Inicia sesión
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
