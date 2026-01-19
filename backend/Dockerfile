# Usar Temurin JDK 21 (OpenJDK 21 LTS)
FROM eclipse-temurin:21-jdk-alpine

# Crear y moverse al directorio de trabajo
WORKDIR /app

# Instalar bash y utilidades necesarias para Maven Wrapper
RUN apk add --no-cache bash curl

# Copiar todos los archivos del proyecto al contenedor
COPY . .

# Dar permisos de ejecución al Maven Wrapper
RUN chmod +x mvnw

# Construir el proyecto, saltando los tests
RUN ./mvnw clean package -DskipTests

# Exponer el puerto si tu app corre en 8080
EXPOSE 8080

# Ejecutar la app
CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
