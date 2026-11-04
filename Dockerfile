# ===================
# Stage 1: Build deps
# ===================
FROM node:20-slim as build

WORKDIR /app

# Build toolchain for native deps (e.g. `canvas`, pulled in transitively) that
# don't have a prebuilt binary available for every target platform/arch -
# without this, npm falls back to node-gyp from source and fails on arches
# like arm64 where no prebuild is fetched.
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  pkg-config \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  libpixman-1-dev \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci

# ======================
# Stage 2: Final image
# ======================
FROM node:20-slim

RUN apt-get update && apt-get install -y \
  libcairo2 \
  libjpeg-dev \
  libpango-1.0-0 \
  libgif-dev \
  libpixman-1-0 \
  libfreetype6 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY ecosystem.config.json ./
COPY ./dist .

RUN npm install -g pm2

EXPOSE 5000
EXPOSE 443
EXPOSE 80

CMD ["pm2-runtime", "start", "ecosystem.config.json"]
