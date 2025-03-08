# Usar una imagen oficial de Node.js
FROM node:18

# Definir el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 5000

# Comando para ejecutar la app
CMD ["node", "server.js"]
