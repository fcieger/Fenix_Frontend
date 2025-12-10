# Dockerfile para Frontend Next.js
FROM node:20-alpine AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat git openssh-client
WORKDIR /app

# Argumento para token do GitHub (opcional)
ARG GITHUB_TOKEN

# Configurar git para usar HTTPS em vez de SSH para GitHub
RUN git config --global url."https://github.com/".insteadOf "git@github.com:" && \
    git config --global url."https://".insteadOf "ssh://"

# Se o token estiver disponível, configurar para usar na autenticação
# Nota: O token precisa ser um Personal Access Token válido do GitHub
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"; \
      git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"; \
      echo "https://${GITHUB_TOKEN}@github.com" > /root/.git-credentials && \
      chmod 600 /root/.git-credentials && \
      git config --global credential.helper store; \
    fi

# Configurar variáveis de ambiente para git
ENV GIT_TERMINAL_PROMPT=0
ENV GIT_ASKPASS=echo

# Nota: O pnpm pode tentar usar SSH diretamente. A configuração do git acima
# deve converter automaticamente git@github.com para https://github.com
# Se você tiver um repositório privado, certifique-se de passar GITHUB_TOKEN
# como build arg: docker build --build-arg GITHUB_TOKEN=seu_token .

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Se o token estiver disponível, modificar temporariamente o package.json e pnpm-lock.yaml
# para usar HTTPS com token em vez de SSH
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      echo "Modificando package.json e pnpm-lock.yaml para usar HTTPS com token..." && \
      ESCAPED_TOKEN=$(echo "$GITHUB_TOKEN" | sed 's/\\/\\\\/g; s/&/\\&/g; s|/|\\/|g; s/|/\\|/g') && \
      sed -i "s|github:imLeonam/fenix-api-sdk|https://${ESCAPED_TOKEN}@github.com/imLeonam/fenix-api-sdk.git|g" package.json; \
      sed -i "s|specifier: github:imLeonam/fenix-api-sdk|specifier: https://${ESCAPED_TOKEN}@github.com/imLeonam/fenix-api-sdk.git|g" pnpm-lock.yaml; \
      sed -i "s|git@github.com:imLeonam/fenix-api-sdk|https://${ESCAPED_TOKEN}@github.com/imLeonam/fenix-api-sdk|g" pnpm-lock.yaml; \
      sed -i "s|git+https://git@github.com:imLeonam/fenix-api-sdk|git+https://${ESCAPED_TOKEN}@github.com/imLeonam/fenix-api-sdk|g" pnpm-lock.yaml; \
      sed -i "s|@fenix/api-sdk@git+https://git@github.com|@fenix/api-sdk@git+https://${ESCAPED_TOKEN}@github.com|g" pnpm-lock.yaml; \
      echo "Verificando token do GitHub..." && \
      git ls-remote "https://${GITHUB_TOKEN}@github.com/imLeonam/fenix-api-sdk.git" HEAD > /dev/null 2>&1 || \
      (echo "ERRO: Token do GitHub inválido ou sem permissão para acessar o repositório" && exit 1); \
    fi

# Instalar dependências usando pnpm
# Usar --no-frozen-lockfile se o lockfile foi modificado para permitir atualização
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      pnpm install --no-frozen-lockfile; \
    else \
      pnpm install --frozen-lockfile; \
    fi

# Rebuild do código fonte apenas quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configurar variáveis de ambiente
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build da aplicação
RUN pnpm run build

# Imagem de produção, copiar todos os arquivos e executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos
COPY --from=builder /app/public ./public

# Copiar arquivos de build (standalone output)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
