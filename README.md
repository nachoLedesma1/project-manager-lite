# 🚀 Project Manager Lite



**Project Manager Lite** es una aplicación web de gestión de proyectos diseñada para organizar flujos de trabajo de manera visual y ágil. Inspirada en la metodología Kanban, permite a los equipos y usuarios crear tareas, asignarlas y moverlas a través de diferentes estados de progreso, ofreciendo una visión clara del estado del proyecto en tiempo real.



## 🛠️ Tecnologías Utilizadas



El proyecto está construido con una arquitectura moderna de microservicios, separando claramente el frontend del backend:



### Backend ☕

- **Java (Spring Boot):** API REST robusta y escalable.

- **Base de Datos:** PostgreSQL.

- **Flyway:** Gestión y versionado de migraciones de base de datos para asegurar la integridad del esquema.



### Frontend ⚛️

- **React (TypeScript):** Interfaz de usuario dinámica, tipada y reactiva.

- **Estilos:** Diseño limpio y responsivo.



### DevOps & Infraestructura 🐳

- **Docker & Docker Compose:** Orquestación de contenedores para un despliegue rápido y consistente en cualquier entorno.



---



## 📋 Prerrequisitos



Para ejecutar este proyecto localmente, necesitas tener instalado:

- [Docker](https://www.docker.com/) y **Docker Compose**.

- [Git](https://git-scm.com/).



*(Opcional para ejecución manual sin contenedores)*:

- Java JDK 17+.

- Node.js 18+.



---



## 🚀 Instalación y Ejecución (Recomendado)



La forma más rápida de levantar la aplicación es utilizando Docker, que configurará automáticamente la base de datos y los servicios.



1. **Clonar el repositorio**

```bash

git clone https://github.com/nachoLedesma1/project-manager-lite.git

cd project-manager-lite



```







## 2 Levantar los servicios



```bash



docker-compose up --build



```







## 3 Acceder a la aplicación



- **Frontend**: Abre tu navegador en http://localhost:5173.



- **Backend API:** Disponible enhttp://localhost:8080.







---







## 🔧 Ejecución Manual (Entorno de Desarrollo)







Si deseas ejecutar los servicios individualmente para desarrollo:







### Backend



```bash



cd backend



# Ejecutar con Maven Wrapper



./mvnw spring-boot:run



```







### Frontend



```bash



cd frontend



# Instalar dependencias y correr



npm install



npm run dev



```







---







## 📂 Estructura del Proyecto







```text



project-manager-lite/



├── backend/            # Lógica de negocio y API (Spring Boot + Flyway)



├── frontend/           # Cliente web (React + TypeScript)



├── docker-compose.yml  # Configuración de servicios Docker



└── .gitignore          # Archivos excluidos



```







## 🤝 Contribuciones







¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la gestión de estados, agregar nuevas funcionalidades o mejorar la interfaz, no dudes en abrir un **Pull Request** o reportar un **Issue**.







## 👤 Autor







**Ignacio Agustín Ledesma**



- **GitHub:** [@nachoLedesma1](https://github.com/nachoLedesma1)



- **LinkedIn:** [Ignacio Ledesma](https://www.linkedin.com/in/ignacio-ledesma2)







---



*Hecho con código y café.*





