FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY src ./src
COPY tsconfig.json bunfig.toml ./
ENV NODE_ENV=production
EXPOSE 4000
CMD ["bun", "src/index.ts"]
