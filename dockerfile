FROM node:23-slim

WORKDIR /usr/src/app

# Copy needed files.
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY dist ./dist

# Install PNPM and project dependencies.
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# set environment variables
ENV NODE_ENV=production
ENV PG_URI=postgresql://postgres:password@db:65432/cointracker
ENV ALCHEMY_KEY="--"
ENV PORT=7676

# Optionally copy an `env` file
# COPY .env ./

CMD ["node", "./dist/server.js"]

EXPOSE 7676