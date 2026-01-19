FROM node:22-bullseye

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero (para cacheo)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
#COPY . .
# No copiamos el resto del código aquí,
# porque va a entrar por volumen en docker-compose


# Exponer el puerto de Vite (5173 por defecto)
EXPOSE 5173

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host"]
