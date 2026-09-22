FROM mcr.microsoft.com/playwright:v1.54.2-noble AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev --ignore-scripts

FROM mcr.microsoft.com/playwright:v1.54.2-noble

ENV NODE_ENV=production
ENV BROWSER_HEADLESS=true

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER pwuser

ENTRYPOINT ["node", "dist/index.js"]