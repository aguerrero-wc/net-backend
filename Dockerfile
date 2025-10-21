# ============================================
# Stage 1: Base - Imagen base con Node.js
# ============================================
FROM node:lts-jod AS base
WORKDIR /usr/src/app
# Instalar dependencias del sistema necesarias para módulos nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 2: Dependencies - Instala dependencias
# ============================================
FROM base AS deps
# Copiar archivos de configuración de dependencias
COPY package.json yarn.lock ./
# Instalar todas las dependencias (dev + prod)
RUN yarn install --frozen-lockfile --prefer-offline

# ============================================
# Stage 3: Builder - Construye la aplicación
# ============================================
FROM deps AS builder
COPY . .
RUN yarn build

# ============================================
# Stage 4: Production - Imagen optimizada
# ============================================
FROM node:lts-jod AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copiar archivos de dependencias
COPY --chown=node:node package.json yarn.lock ./
# Copiar el código compilado
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
# Copiar node_modules del stage deps
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
# Cambiar a usuario no-root
USER node
EXPOSE 3000

# Healthcheck
#EALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]

# ============================================
# Stage 5: Development - Entorno de desarrollo
# ============================================
FROM deps AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000