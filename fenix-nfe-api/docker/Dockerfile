# Multi-stage build para otimização
FROM maven:3.9.5-openjdk-17-slim AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do Maven
COPY pom.xml .
COPY src ./src

# Baixar dependências (cache layer)
RUN mvn dependency:go-offline -B

# Compilar a aplicação
RUN mvn clean package -DskipTests

# Stage de produção
FROM openjdk:17-jre-slim

# Instalar dependências do sistema
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN groupadd -r nfe && useradd -r -g nfe nfe

# Definir diretório de trabalho
WORKDIR /app

# Copiar JAR da aplicação
COPY --from=build /app/target/fenix-nfe-api-*.jar app.jar

# Criar diretórios necessários
RUN mkdir -p /var/log/nfe-api && \
    chown -R nfe:nfe /app /var/log/nfe-api

# Mudar para usuário não-root
USER nfe

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Configurações JVM para produção
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"

# Executar aplicação
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]


