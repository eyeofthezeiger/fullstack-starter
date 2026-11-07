# Build from the repo root: docker build -f server/Dockerfile .
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/
COPY config/package.json config/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --ignore-scripts
COPY shared shared
COPY config config
COPY server server
RUN npm run build -w @app/shared -w @app/config -w @app/server

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY config/package.json config/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --omit=dev --ignore-scripts -w @app/server && npm cache clean --force
COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/config/dist config/dist
COPY --from=build /app/server/dist server/dist
COPY server/migrations server/migrations
WORKDIR /app/server
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
