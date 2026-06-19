FROM node:20-bullseye-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

ENV NODE_ENV=development

RUN npm install -g npm@10.9.2

RUN npm install --legacy-peer-deps --include=dev --no-audit --no-fund

RUN npm install -D @angular/cli @angular-devkit/build-angular --legacy-peer-deps --no-audit --no-fund

COPY . ./

RUN ./node_modules/.bin/ng build --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/etude-reussie-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80