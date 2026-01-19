import { useState } from "react";
import axios from "axios";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Snippet } from "@heroui/react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username,
          password,
        }
      );
      // Supongo que el backend devuelve { token: "xxx.yyy.zzz" }
      console.log("Respuesta del servidor:", response.data);
      const token = response.data.token;
      localStorage.setItem("token", token);

      console.log("Token guardado:", token);
      window.location.href = "/home"; // redirigir a dashboard
    } catch (err: any) {
      console.error(err);
      setError("Usuario o contraseña incorrecta");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-4 shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <h3 className="text-2xl font-semibold">Iniciar sesión</h3>
        </CardHeader>
        <CardBody>
          {error && (
            <Snippet
              hideCopyButton
              variant="bordered"
              color="danger"
              className="mb-4 w-full"
            >
              {error}
            </Snippet>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Usuario"
              variant="bordered"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isRequired
            />
            <Input
              label="Contraseña"
              type="password"
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
            />
            <Button type="submit" color="primary" fullWidth>
              Ingresar
            </Button>
            <Button variant="light" onPress={() => navigate("/register")}>
              ¿No tenés cuenta? Registrate
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
export default Login;
