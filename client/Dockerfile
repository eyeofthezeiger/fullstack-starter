# Build from the repo root: docker build -f client/Dockerfile .
FROM node:25-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/
COPY config/package.json config/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --ignore-scripts
COPY shared shared
COPY client client
RUN npm run build -w @app/client

FROM nginx:1.29-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
