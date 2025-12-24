FROM node:20.19-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json packages/server/package.json
COPY packages/client/package.json packages/client/package.json

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev --workspaces --include-workspace-root

FROM node:20.19-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
