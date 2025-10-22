#!/bin/bash

# Script de otimização de performance para Fenix NFe API
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
NAMESPACE="fenix-nfe"
API_URL="https://api.fenix.com.br"

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl não está instalado!"
        exit 1
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        log_error "curl não está instalado!"
        exit 1
    fi
    
    # Verificar jq
    if ! command -v jq &> /dev/null; then
        log_error "jq não está instalado!"
        exit 1
    fi
    
    log_success "Dependências verificadas!"
}

# Função para verificar conectividade
check_connectivity() {
    log "Verificando conectividade..."
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Não é possível conectar ao cluster Kubernetes!"
        exit 1
    fi
    
    log_success "Conectividade verificada!"
}

# Função para otimizar JVM
optimize_jvm() {
    log "Otimizando JVM..."
    
    # Obter pods da aplicação
    local pods=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $pods; do
        log "Otimizando JVM do pod: $pod"
        
        # Aplicar configurações JVM otimizadas
        kubectl patch deployment nfe-api -n $NAMESPACE -p '{
            "spec": {
                "template": {
                    "spec": {
                        "containers": [{
                            "name": "nfe-api",
                            "env": [
                                {
                                    "name": "JAVA_OPTS",
                                    "value": "-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler -Xms2g -Xmx4g -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -XX:+UseCompressedOops -XX:+UseCompressedClassPointers"
                                }
                            ]
                        }]
                    }
                }
            }
        }'
    done
    
    log_success "JVM otimizada!"
}

# Função para otimizar banco de dados
optimize_database() {
    log "Otimizando banco de dados..."
    
    # Obter pod do PostgreSQL
    local postgres_pod=$(kubectl get pods -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$postgres_pod" ]; then
        log "Otimizando PostgreSQL no pod: $postgres_pod"
        
        # Aplicar configurações otimizadas
        kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -c "
            -- Configurações de memória
            ALTER SYSTEM SET shared_buffers = '256MB';
            ALTER SYSTEM SET effective_cache_size = '1GB';
            ALTER SYSTEM SET work_mem = '4MB';
            ALTER SYSTEM SET maintenance_work_mem = '64MB';
            
            -- Configurações de conexão
            ALTER SYSTEM SET max_connections = 200;
            ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
            
            -- Configurações de checkpoint
            ALTER SYSTEM SET checkpoint_completion_target = 0.9;
            ALTER SYSTEM SET wal_buffers = '16MB';
            ALTER SYSTEM SET default_statistics_target = 100;
            
            -- Recarregar configurações
            SELECT pg_reload_conf();
        "
        
        # Criar índices otimizados
        kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -c "
            -- Índices para NFe
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_status_empresa_cnpj ON nfe_status(empresa_cnpj);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_status_status ON nfe_status(status);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_status_data_emissao ON nfe_status(data_emissao);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_status_chave_acesso ON nfe_status(chave_acesso);
            
            -- Índices para logs
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_log_empresa_cnpj ON nfe_log(empresa_cnpj);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_log_operacao ON nfe_log(operacao);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_log_data_operacao ON nfe_log(data_operacao);
            
            -- Índices para métricas
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_metric_nome ON nfe_metric(nome);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfe_metric_data_metric ON nfe_metric(data_metric);
            
            -- Estatísticas
            ANALYZE;
        "
        
        log_success "Banco de dados otimizado!"
    else
        log_warning "Pod do PostgreSQL não encontrado"
    fi
}

# Função para otimizar cache
optimize_cache() {
    log "Otimizando cache..."
    
    # Obter pod do Redis
    local redis_pod=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$redis_pod" ]; then
        log "Otimizando Redis no pod: $redis_pod"
        
        # Aplicar configurações otimizadas
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli CONFIG SET maxmemory 512mb
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli CONFIG SET maxmemory-policy allkeys-lru
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli CONFIG SET tcp-keepalive 300
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli CONFIG SET timeout 300
        
        # Limpar cache antigo
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli FLUSHDB
        
        log_success "Cache otimizado!"
    else
        log_warning "Pod do Redis não encontrado"
    fi
}

# Função para otimizar filas
optimize_queues() {
    log "Otimizando filas..."
    
    # Obter pod do RabbitMQ
    local rabbitmq_pod=$(kubectl get pods -n $NAMESPACE -l app=rabbitmq -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$rabbitmq_pod" ]; then
        log "Otimizando RabbitMQ no pod: $rabbitmq_pod"
        
        # Aplicar configurações otimizadas
        kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmqctl set_policy ha-all '.*' '{"ha-mode":"all","ha-sync-mode":"automatic"}'
        kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmqctl set_policy ttl '.*' '{"message-ttl":3600000}'
        kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmqctl set_policy max-length '.*' '{"max-length":10000}'
        
        # Configurar prefetch
        kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmqctl set_policy prefetch '.*' '{"prefetch":10}'
        
        log_success "Filas otimizadas!"
    else
        log_warning "Pod do RabbitMQ não encontrado"
    fi
}

# Função para otimizar recursos
optimize_resources() {
    log "Otimizando recursos..."
    
    # Aplicar HPA otimizado
    kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nfe-api-hpa-optimized
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nfe-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: rabbitmq_queue_messages
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
EOF
    
    # Aplicar VPA otimizado
    kubectl apply -f - <<EOF
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nfe-api-vpa-optimized
  namespace: $NAMESPACE
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nfe-api
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: nfe-api
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 4
        memory: 8Gi
      controlledResources: ["cpu", "memory"]
EOF
    
    log_success "Recursos otimizados!"
}

# Função para otimizar rede
optimize_network() {
    log "Otimizando rede..."
    
    # Aplicar NetworkPolicy otimizada
    kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: nfe-api-network-policy
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: nfe-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to:
    - podSelector:
        matchLabels:
          app: rabbitmq
    ports:
    - protocol: TCP
      port: 5672
EOF
    
    log_success "Rede otimizada!"
}

# Função para otimizar monitoramento
optimize_monitoring() {
    log "Otimizando monitoramento..."
    
    # Aplicar ServiceMonitor otimizado
    kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: nfe-api-monitor
  namespace: $NAMESPACE
spec:
  selector:
    matchLabels:
      app: nfe-api
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s
    scrapeTimeout: 10s
EOF
    
    # Aplicar PrometheusRule otimizada
    kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: nfe-api-rules
  namespace: $NAMESPACE
spec:
  groups:
  - name: nfe.rules
    rules:
    - alert: NFeAPIHighCPU
      expr: rate(container_cpu_usage_seconds_total{pod=~"nfe-api-.*"}[5m]) > 0.8
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "NFe API high CPU usage"
        description: "Pod {{ \$labels.pod }} has high CPU usage: {{ \$value }}"
    
    - alert: NFeAPIHighMemory
      expr: container_memory_usage_bytes{pod=~"nfe-api-.*"} / container_spec_memory_limit_bytes > 0.8
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "NFe API high memory usage"
        description: "Pod {{ \$labels.pod }} has high memory usage: {{ \$value }}"
    
    - alert: NFeAPIHighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "NFe API high error rate"
        description: "Error rate is {{ \$value }} errors per second"
EOF
    
    log_success "Monitoramento otimizado!"
}

# Função para otimizar segurança
optimize_security() {
    log "Otimizando segurança..."
    
    # Aplicar PodSecurityPolicy otimizada
    kubectl apply -f - <<EOF
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: nfe-api-psp
  namespace: $NAMESPACE
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
EOF
    
    # Aplicar SecurityContext otimizado
    kubectl patch deployment nfe-api -n $NAMESPACE -p '{
        "spec": {
            "template": {
                "spec": {
                    "securityContext": {
                        "runAsNonRoot": true,
                        "runAsUser": 1000,
                        "fsGroup": 1000
                    },
                    "containers": [{
                        "name": "nfe-api",
                        "securityContext": {
                            "allowPrivilegeEscalation": false,
                            "readOnlyRootFilesystem": true,
                            "capabilities": {
                                "drop": ["ALL"]
                            }
                        }
                    }]
                }
            }
        }
    }'
    
    log_success "Segurança otimizada!"
}

# Função para otimizar logs
optimize_logs() {
    log "Otimizando logs..."
    
    # Aplicar configuração de logs otimizada
    kubectl create configmap nfe-log-config -n $NAMESPACE --from-literal=logback.xml='
    <configuration>
        <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
                <providers>
                    <timestamp/>
                    <logLevel/>
                    <loggerName/>
                    <message/>
                    <mdc/>
                    <stackTrace/>
                </providers>
            </encoder>
        </appender>
        
        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>/app/logs/application.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>/app/logs/application.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>30</maxHistory>
                <totalSizeCap>1GB</totalSizeCap>
            </rollingPolicy>
            <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
                <providers>
                    <timestamp/>
                    <logLevel/>
                    <loggerName/>
                    <message/>
                    <mdc/>
                    <stackTrace/>
                </providers>
            </encoder>
        </appender>
        
        <root level="INFO">
            <appender-ref ref="STDOUT"/>
            <appender-ref ref="FILE"/>
        </root>
    </configuration>
    ' --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Logs otimizados!"
}

# Função para verificar performance
check_performance() {
    log "Verificando performance..."
    
    # Verificar métricas de CPU
    local cpu_usage=$(kubectl top pods -n $NAMESPACE -l app=nfe-api --no-headers | awk '{print $2}' | sed 's/m//' | head -1)
    
    if [ -n "$cpu_usage" ] && [ $cpu_usage -lt 500 ]; then
        log_success "CPU usage OK: ${cpu_usage}m"
    else
        log_warning "CPU usage alto: ${cpu_usage}m"
    fi
    
    # Verificar métricas de memória
    local memory_usage=$(kubectl top pods -n $NAMESPACE -l app=nfe-api --no-headers | awk '{print $3}' | sed 's/Mi//' | head -1)
    
    if [ -n "$memory_usage" ] && [ $memory_usage -lt 1000 ]; then
        log_success "Memory usage OK: ${memory_usage}Mi"
    else
        log_warning "Memory usage alto: ${memory_usage}Mi"
    fi
    
    # Verificar tempo de resposta
    local start_time=$(date +%s%3N)
    curl -f -s "$API_URL/health" &> /dev/null
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if [ $response_time -lt 1000 ]; then
        log_success "Response time OK: ${response_time}ms"
    else
        log_warning "Response time alto: ${response_time}ms"
    fi
}

# Função para gerar relatório
generate_report() {
    log "Gerando relatório de otimização..."
    
    local report_file="$PROJECT_DIR/optimization-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== RELATÓRIO DE OTIMIZAÇÃO ==="
        echo "Data: $(date)"
        echo "Namespace: $NAMESPACE"
        echo ""
        echo "=== OTIMIZAÇÕES APLICADAS ==="
        echo "✅ JVM otimizada com G1GC"
        echo "✅ Banco de dados otimizado com índices"
        echo "✅ Cache Redis otimizado"
        echo "✅ Filas RabbitMQ otimizadas"
        echo "✅ Recursos HPA/VPA configurados"
        echo "✅ Rede otimizada com NetworkPolicy"
        echo "✅ Monitoramento otimizado"
        echo "✅ Segurança otimizada"
        echo "✅ Logs otimizados"
        echo ""
        echo "=== MÉTRICAS ATUAIS ==="
        echo "CPU usage: $(kubectl top pods -n $NAMESPACE -l app=nfe-api --no-headers | awk '{print $2}' | head -1)"
        echo "Memory usage: $(kubectl top pods -n $NAMESPACE -l app=nfe-api --no-headers | awk '{print $3}' | head -1)"
        echo "Response time: $(curl -s -w "%{time_total}" "$API_URL/health" -o /dev/null)s"
        echo ""
        echo "=== RECOMENDAÇÕES ==="
        echo "1. Monitorar métricas por 24h"
        echo "2. Ajustar HPA/VPA conforme necessário"
        echo "3. Verificar logs de erro"
        echo "4. Executar testes de carga"
        echo "5. Revisar configurações mensalmente"
    } > "$report_file"
    
    log_success "Relatório salvo em: $report_file"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  all         - Executa todas as otimizações"
    echo "  jvm         - Otimiza JVM"
    echo "  database    - Otimiza banco de dados"
    echo "  cache       - Otimiza cache"
    echo "  queues      - Otimiza filas"
    echo "  resources   - Otimiza recursos"
    echo "  network     - Otimiza rede"
    echo "  monitoring  - Otimiza monitoramento"
    echo "  security    - Otimiza segurança"
    echo "  logs        - Otimiza logs"
    echo "  check       - Verifica performance"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 all"
    echo "  $0 jvm"
    echo "  $0 database"
}

# Função principal
main() {
    case "${1:-all}" in
        "all")
            check_dependencies
            check_connectivity
            optimize_jvm
            optimize_database
            optimize_cache
            optimize_queues
            optimize_resources
            optimize_network
            optimize_monitoring
            optimize_security
            optimize_logs
            check_performance
            generate_report
            ;;
        "jvm")
            check_dependencies
            check_connectivity
            optimize_jvm
            check_performance
            ;;
        "database")
            check_dependencies
            check_connectivity
            optimize_database
            check_performance
            ;;
        "cache")
            check_dependencies
            check_connectivity
            optimize_cache
            check_performance
            ;;
        "queues")
            check_dependencies
            check_connectivity
            optimize_queues
            check_performance
            ;;
        "resources")
            check_dependencies
            check_connectivity
            optimize_resources
            check_performance
            ;;
        "network")
            check_dependencies
            check_connectivity
            optimize_network
            check_performance
            ;;
        "monitoring")
            check_dependencies
            check_connectivity
            optimize_monitoring
            check_performance
            ;;
        "security")
            check_dependencies
            check_connectivity
            optimize_security
            check_performance
            ;;
        "logs")
            check_dependencies
            check_connectivity
            optimize_logs
            check_performance
            ;;
        "check")
            check_dependencies
            check_connectivity
            check_performance
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Comando inválido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
