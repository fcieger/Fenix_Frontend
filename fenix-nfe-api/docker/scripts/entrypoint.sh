#!/bin/sh

# Script de inicialização otimizado para produção
set -e

# Função para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Função para aguardar dependências
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local timeout=${4:-30}
    
    log "Aguardando $service em $host:$port..."
    
    for i in $(seq 1 $timeout); do
        if nc -z $host $port 2>/dev/null; then
            log "$service está disponível!"
            return 0
        fi
        sleep 1
    done
    
    log "ERRO: $service não está disponível após ${timeout}s"
    return 1
}

# Função para verificar certificados
check_certificates() {
    log "Verificando certificados..."
    
    if [ ! -d "/app/certificates" ]; then
        log "Criando diretório de certificados..."
        mkdir -p /app/certificates
    fi
    
    # Verificar se há certificados válidos
    local cert_count=$(find /app/certificates -name "*.pfx" -o -name "*.p12" | wc -l)
    if [ $cert_count -eq 0 ]; then
        log "AVISO: Nenhum certificado encontrado em /app/certificates"
    else
        log "Encontrados $cert_count certificado(s)"
    fi
}

# Função para configurar JVM
configure_jvm() {
    log "Configurando JVM..."
    
    # Detectar memória disponível
    local total_mem=$(cat /proc/meminfo | grep MemTotal | awk '{print $2}')
    local mem_kb=$((total_mem * 1024))
    
    # Configurar heap baseado na memória disponível
    if [ $mem_kb -lt 2097152 ]; then
        # Menos de 2GB
        export JAVA_OPTS="$JAVA_OPTS -Xms256m -Xmx1024m"
    elif [ $mem_kb -lt 4194304 ]; then
        # Menos de 4GB
        export JAVA_OPTS="$JAVA_OPTS -Xms512m -Xmx2048m"
    else
        # 4GB ou mais
        export JAVA_OPTS="$JAVA_OPTS -Xms1024m -Xmx4096m"
    fi
    
    # Configurações de GC otimizadas
    export JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
    export JAVA_OPTS="$JAVA_OPTS -XX:+UseContainerSupport"
    export JAVA_OPTS="$JAVA_OPTS -XX:MaxRAMPercentage=75.0"
    export JAVA_OPTS="$JAVA_OPTS -XX:+UseStringDeduplication"
    export JAVA_OPTS="$JAVA_OPTS -XX:+OptimizeStringConcat"
    
    # Configurações de logging
    export JAVA_OPTS="$JAVA_OPTS -Dlogging.level.org.springframework=INFO"
    export JAVA_OPTS="$JAVA_OPTS -Dlogging.level.br.com.fenix.nfe=DEBUG"
    
    # Configurações de segurança
    export JAVA_OPTS="$JAVA_OPTS -Djava.security.egd=file:/dev/./urandom"
    export JAVA_OPTS="$JAVA_OPTS -Djava.awt.headless=true"
    
    log "JAVA_OPTS configurado: $JAVA_OPTS"
}

# Função para configurar Spring
configure_spring() {
    log "Configurando Spring..."
    
    # Configurar perfil ativo
    if [ -z "$SPRING_PROFILES_ACTIVE" ]; then
        export SPRING_PROFILES_ACTIVE=production
    fi
    
    # Configurar porta
    if [ -z "$SERVER_PORT" ]; then
        export SERVER_PORT=8080
    fi
    
    # Configurar porta de management
    if [ -z "$MANAGEMENT_SERVER_PORT" ]; then
        export MANAGEMENT_SERVER_PORT=8081
    fi
    
    log "Spring configurado - Profile: $SPRING_PROFILES_ACTIVE, Port: $SERVER_PORT"
}

# Função para aguardar dependências
wait_for_dependencies() {
    log "Aguardando dependências..."
    
    # Aguardar PostgreSQL
    if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
        wait_for_service $DB_HOST $DB_PORT "PostgreSQL"
    fi
    
    # Aguardar RabbitMQ
    if [ -n "$RABBITMQ_HOST" ] && [ -n "$RABBITMQ_PORT" ]; then
        wait_for_service $RABBITMQ_HOST $RABBITMQ_PORT "RabbitMQ"
    fi
    
    # Aguardar Redis
    if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
        wait_for_service $REDIS_HOST $REDIS_PORT "Redis"
    fi
}

# Função para verificar saúde da aplicação
check_health() {
    log "Verificando saúde da aplicação..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8081/actuator/health >/dev/null 2>&1; then
            log "Aplicação está saudável!"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Aplicação ainda não está pronta..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "ERRO: Aplicação não ficou saudável após $max_attempts tentativas"
    return 1
}

# Função principal
main() {
    log "Iniciando Fenix NFe API..."
    
    # Verificar certificados
    check_certificates
    
    # Configurar JVM
    configure_jvm
    
    # Configurar Spring
    configure_spring
    
    # Aguardar dependências
    wait_for_dependencies
    
    # Iniciar aplicação
    log "Iniciando aplicação Java..."
    exec java $JAVA_OPTS -jar app.jar "$@"
}

# Capturar sinais para shutdown graceful
trap 'log "Recebido sinal de parada, encerrando aplicação..."; exit 0' TERM INT

# Executar função principal
main "$@"
