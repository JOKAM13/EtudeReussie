FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . ./

RUN npx ng build --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/etude-reussie-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80