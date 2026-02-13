
FROM node:22-alpine AS base

WORKDIR /usr/src/app

FROM base AS dependencies

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM base AS development

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "30000"]

FROM nginx:alpine AS production

COPY --from=build /usr/src/app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]