FROM node:22-alpine AS base
WORKDIR /usr/src/app

RUN npm install -g npm@11.11.0

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN npm install -g npm@11.11.0

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/db/migrations ./src/db/migrations
COPY --from=build /usr/src/app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 8080

CMD ["node", "dist/app/server.js"]