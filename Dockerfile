FROM node:20-bullseye-slim AS build

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development

RUN npm install -g npm@10.9.2

RUN npm install --legacy-peer-deps --include=dev --no-audit --no-fund

COPY . ./

RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/etude-reussie-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80