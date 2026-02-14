FROM node:20

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier tout le code
COPY . .

EXPOSE 5000

# Lancer le serveur
CMD ["npm", "start"]