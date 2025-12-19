FROM node:22-alpine

WORKDIR /usr/src/app

# Copiar package.json para instalar dependências na build
COPY package*.json ./

RUN npm install

# Em desenvolvimento, o código será montado via volume
CMD ["npm", "run", "start"]