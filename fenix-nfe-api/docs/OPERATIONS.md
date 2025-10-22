# Fenix NFe API - Documentação de Operações

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Monitoramento](#monitoramento)
- [Alertas](#alertas)
- [Backup e Restore](#backup-e-restore)
- [Manutenção](#manutenção)
- [Troubleshooting](#troubleshooting)
- [Escalabilidade](#escalabilidade)
- [Segurança](#segurança)
- [Disaster Recovery](#disaster-recovery)

## 🔍 Visão Geral

Este documento descreve as operações de produção da **Fenix NFe API**, incluindo monitoramento, alertas, backup, manutenção e troubleshooting.

### Responsabilidades da Equipe de Operações

- **Monitoramento**: 24/7 da infraestrutura e aplicação
- **Alertas**: Resposta rápida a incidentes
- **Backup**: Garantia de disponibilidade dos dados
- **Manutenção**: Atualizações e otimizações
- **Troubleshooting**: Resolução de problemas
- **Escalabilidade**: Ajuste de recursos conforme demanda

## 📊 Monitoramento

### 1. Métricas da Aplicação

#### Health Checks
```bash
# Health check básico
curl https://api.fenix.com.br/health

# Health check detalhado
curl https://api.fenix.com.br/actuator/health

# Health check por componente
curl https://api.fenix.com.br/actuator/health/db
curl https://api.fenix.com.br/actuator/health/redis
curl https://api.fenix.com.br/actuator/health/rabbitmq
```

#### Métricas Customizadas
```bash
# Métricas de NFe
curl https://api.fenix.com.br/actuator/metrics/nfe.emitted.total
curl https://api.fenix.com.br/actuator/metrics/nfe.processing.time
curl https://api.fenix.com.br/actuator/metrics/nfe.queue.depth

# Métricas de sistema
curl https://api.fenix.com.br/actuator/metrics/jvm.memory.used
curl https://api.fenix.com.br/actuator/metrics/http.server.requests
curl https://api.fenix.com.br/actuator/metrics/process.cpu.usage
```

### 2. Dashboards Grafana

#### NFe Overview
- **URL**: https://grafana.fenix.com.br/d/nfe-overview
- **Métricas**: KPIs gerais, status da aplicação, throughput
- **Alertas**: Status crítico, alta latência, erros

#### NFe Queue Metrics
- **URL**: https://grafana.fenix.com.br/d/nfe-queue-metrics
- **Métricas**: Tamanho das filas, taxa de processamento, workers
- **Alertas**: Fila cheia, worker inativo, mensagens perdidas

#### NFe Business Metrics
- **URL**: https://grafana.fenix.com.br/d/nfe-business-metrics
- **Métricas**: NFe autorizadas, rejeitadas, tempo de processamento
- **Alertas**: Alta taxa de rejeição, tempo de processamento alto

#### NFe Errors
- **URL**: https://grafana.fenix.com.br/d/nfe-errors
- **Métricas**: Taxa de erro, tipos de erro, tendências
- **Alertas**: Pico de erros, erro crítico, SEFAZ indisponível

### 3. Logs Estruturados

#### Elasticsearch
```bash
# Buscar logs por empresa
curl -X GET "https://elasticsearch.fenix.com.br/logs-*/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "term": {
        "empresa_cnpj": "11543862000187"
      }
    }
  }'

# Buscar logs de erro
curl -X GET "https://elasticsearch.fenix.com.br/logs-*/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "term": {
        "level": "ERROR"
      }
    }
  }'
```

#### Kibana
- **URL**: https://kibana.fenix.com.br
- **Índices**: logs-*, metrics-*, traces-*
- **Filtros**: Por empresa, nível de log, timestamp

### 4. Tracing Distribuído

#### Jaeger
- **URL**: https://jaeger.fenix.com.br
- **Traces**: Rastreamento de requisições
- **Spans**: Detalhamento de operações
- **Correlation**: Correlação entre serviços

## 🚨 Alertas

### 1. Alertas Críticos

#### Aplicação Indisponível
- **Condição**: Health check falha por 2 minutos
- **Severidade**: P1 (Crítico)
- **Ação**: Escalar para equipe de plantão
- **Tempo de Resposta**: 5 minutos

#### Banco de Dados Indisponível
- **Condição**: Conexão com PostgreSQL falha
- **Severidade**: P1 (Crítico)
- **Ação**: Verificar cluster e failover
- **Tempo de Resposta**: 5 minutos

#### Fila de Processamento Cheia
- **Condição**: Mais de 1000 mensagens na fila
- **Severidade**: P2 (Alto)
- **Ação**: Escalar workers ou investigar gargalo
- **Tempo de Resposta**: 15 minutos

### 2. Alertas de Performance

#### Alta Latência
- **Condição**: P95 > 5 segundos
- **Severidade**: P2 (Alto)
- **Ação**: Investigar gargalos
- **Tempo de Resposta**: 30 minutos

#### Alta Taxa de Erro
- **Condição**: Taxa de erro > 5%
- **Severidade**: P2 (Alto)
- **Ação**: Investigar causa raiz
- **Tempo de Resposta**: 30 minutos

#### Uso Alto de CPU
- **Condição**: CPU > 80% por 10 minutos
- **Severidade**: P3 (Médio)
- **Ação**: Escalar horizontalmente
- **Tempo de Resposta**: 1 hora

### 3. Alertas de Negócio

#### NFe Rejeitada pela SEFAZ
- **Condição**: Taxa de rejeição > 10%
- **Severidade**: P2 (Alto)
- **Ação**: Investigar validações
- **Tempo de Resposta**: 30 minutos

#### Certificado Expirando
- **Condição**: Certificado expira em 30 dias
- **Severidade**: P3 (Médio)
- **Ação**: Renovar certificado
- **Tempo de Resposta**: 1 semana

### 4. Configuração de Alertas

#### Prometheus Rules
```yaml
groups:
  - name: nfe.rules
    rules:
      - alert: NFeAPIDown
        expr: up{job="nfe-api"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "NFe API is down"
          description: "NFe API has been down for more than 2 minutes"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "High error rate"
          description: "Error rate is {{ $value }} errors per second"
```

#### AlertManager
```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'https://hooks.slack.com/services/...'
        send_resolved: true
```

## 💾 Backup e Restore

### 1. Estratégia de Backup

#### Banco de Dados
- **Frequência**: Diário às 02:00
- **Retenção**: 30 dias
- **Compressão**: Gzip
- **Criptografia**: AES-256

#### Volumes Persistentes
- **Frequência**: Diário às 03:00
- **Retenção**: 7 dias
- **Compressão**: Tar + Gzip
- **Criptografia**: AES-256

#### Configurações
- **Frequência**: A cada mudança
- **Retenção**: 90 dias
- **Versionamento**: Git
- **Criptografia**: GPG

### 2. Execução de Backup

#### Backup Automático
```bash
# Executar backup completo
./scripts/backup.sh backup

# Backup apenas do banco
./scripts/backup.sh backup --database-only

# Backup apenas de volumes
./scripts/backup.sh backup --volumes-only
```

#### Backup Manual
```bash
# Backup do banco
kubectl exec postgres-pod -- pg_dump -U fenix_user fenix_nfe > backup.sql

# Backup de volumes
kubectl exec nfe-api-pod -- tar czf - /app/data > volumes.tar.gz

# Backup de configurações
kubectl get all -o yaml > k8s-resources.yaml
```

### 3. Restore

#### Restore do Banco
```bash
# Restore completo
kubectl exec -i postgres-pod -- psql -U fenix_user fenix_nfe < backup.sql

# Restore de tabela específica
kubectl exec -i postgres-pod -- psql -U fenix_user fenix_nfe -c "COPY nfe_status FROM STDIN" < nfe_status.csv
```

#### Restore de Volumes
```bash
# Restore de volumes
kubectl exec -i nfe-api-pod -- tar xzf - < volumes.tar.gz

# Restore de configurações
kubectl apply -f k8s-resources.yaml
```

### 4. Validação de Backup

```bash
# Verificar integridade
./scripts/backup.sh verify backup-20240115.tar.gz

# Testar restore
./scripts/backup.sh restore backup-20240115.tar.gz --test

# Listar backups
./scripts/backup.sh status
```

## 🔧 Manutenção

### 1. Manutenção Preventiva

#### Diária
- [ ] Verificar logs de erro
- [ ] Verificar métricas de performance
- [ ] Verificar status dos serviços
- [ ] Verificar espaço em disco
- [ ] Verificar backup

#### Semanal
- [ ] Atualizar dependências
- [ ] Verificar certificados
- [ ] Limpar logs antigos
- [ ] Verificar segurança
- [ ] Testar restore

#### Mensal
- [ ] Atualizar sistema operacional
- [ ] Verificar configurações
- [ ] Otimizar performance
- [ ] Revisar alertas
- [ ] Documentar mudanças

### 2. Manutenção Corretiva

#### Reiniciar Serviços
```bash
# Reiniciar aplicação
kubectl rollout restart deployment/nfe-api

# Reiniciar banco
kubectl rollout restart deployment/postgres

# Reiniciar cache
kubectl rollout restart deployment/redis
```

#### Limpar Recursos
```bash
# Limpar pods finalizados
kubectl delete pods --field-selector=status.phase=Succeeded

# Limpar pods falhados
kubectl delete pods --field-selector=status.phase=Failed

# Limpar recursos não utilizados
kubectl delete all --all
```

#### Otimizar Performance
```bash
# Escalar horizontalmente
kubectl scale deployment/nfe-api --replicas=5

# Escalar verticalmente
kubectl patch deployment nfe-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"nfe-api","resources":{"limits":{"cpu":"2","memory":"4Gi"}}}]}}}}'
```

### 3. Atualizações

#### Atualizar Aplicação
```bash
# Atualizar imagem
kubectl set image deployment/nfe-api nfe-api=ghcr.io/fenix/nfe-api:v1.1.0

# Verificar rollout
kubectl rollout status deployment/nfe-api

# Rollback se necessário
kubectl rollout undo deployment/nfe-api
```

#### Atualizar Dependências
```bash
# Atualizar Maven
mvn versions:use-latest-releases

# Atualizar Docker
docker pull postgres:15
docker pull redis:7
docker pull rabbitmq:3.12-management
```

## 🔍 Troubleshooting

### 1. Problemas Comuns

#### Aplicação não inicia
```bash
# Verificar logs
kubectl logs deployment/nfe-api

# Verificar configurações
kubectl describe deployment/nfe-api

# Verificar recursos
kubectl top pods -l app=nfe-api
```

#### Banco não conecta
```bash
# Verificar status
kubectl get pods -l app=postgres

# Verificar logs
kubectl logs -l app=postgres

# Testar conexão
kubectl exec -it postgres-pod -- psql -U fenix_user -d fenix_nfe
```

#### Fila não processa
```bash
# Verificar RabbitMQ
kubectl exec -it rabbitmq-pod -- rabbitmqctl status

# Verificar filas
kubectl exec -it rabbitmq-pod -- rabbitmqctl list_queues

# Verificar workers
kubectl logs -l app=nfe-worker
```

### 2. Debugging Avançado

#### Profiling da Aplicação
```bash
# Ativar profiling
kubectl exec -it nfe-api-pod -- curl -X POST http://localhost:8080/actuator/httptrace

# Verificar threads
kubectl exec -it nfe-api-pod -- jstack 1

# Verificar memória
kubectl exec -it nfe-api-pod -- jmap -histo 1
```

#### Análise de Performance
```bash
# Verificar métricas
kubectl exec -it nfe-api-pod -- curl http://localhost:8080/actuator/metrics

# Verificar health
kubectl exec -it nfe-api-pod -- curl http://localhost:8080/actuator/health

# Verificar configurações
kubectl exec -it nfe-api-pod -- curl http://localhost:8080/actuator/configprops
```

### 3. Logs de Debug

#### Aplicação
```bash
# Logs em tempo real
kubectl logs -f deployment/nfe-api

# Logs com filtro
kubectl logs -f deployment/nfe-api | grep ERROR

# Logs de pod específico
kubectl logs -f pod/nfe-api-1234567890-abcde
```

#### Sistema
```bash
# Logs do sistema
kubectl logs -f deployment/postgres
kubectl logs -f deployment/redis
kubectl logs -f deployment/rabbitmq
```

## 📈 Escalabilidade

### 1. Escalamento Horizontal

#### Auto-scaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nfe-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nfe-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Escalamento Manual
```bash
# Escalar para 5 réplicas
kubectl scale deployment/nfe-api --replicas=5

# Escalar com HPA
kubectl autoscale deployment/nfe-api --min=3 --max=10 --cpu-percent=70
```

### 2. Escalamento Vertical

#### Aumentar Recursos
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: nfe-api
    resources:
      requests:
        cpu: "1"
        memory: "2Gi"
      limits:
        cpu: "2"
        memory: "4Gi"
```

#### VPA (Vertical Pod Autoscaler)
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nfe-api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nfe-api
  updatePolicy:
    updateMode: "Auto"
```

### 3. Otimização de Performance

#### JVM Tuning
```bash
# Parâmetros JVM
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:+UnlockExperimentalVMOptions
-XX:+UseJVMCICompiler
-Xms2g
-Xmx4g
```

#### Database Tuning
```sql
-- Configurações PostgreSQL
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

## 🔒 Segurança

### 1. Monitoramento de Segurança

#### Logs de Segurança
```bash
# Logs de autenticação
kubectl logs -f deployment/nfe-api | grep AUTH

# Logs de autorização
kubectl logs -f deployment/nfe-api | grep AUTHZ

# Logs de acesso
kubectl logs -f deployment/nfe-api | grep ACCESS
```

#### Métricas de Segurança
```bash
# Tentativas de login
curl https://api.fenix.com.br/actuator/metrics/security.login.attempts

# Tokens expirados
curl https://api.fenix.com.br/actuator/metrics/security.token.expired

# Acessos negados
curl https://api.fenix.com.br/actuator/metrics/security.access.denied
```

### 2. Atualizações de Segurança

#### Dependências
```bash
# Verificar vulnerabilidades
mvn org.owasp:dependency-check-maven:check

# Atualizar dependências
mvn versions:use-latest-releases
```

#### Imagens Docker
```bash
# Verificar vulnerabilidades
trivy image ghcr.io/fenix/nfe-api:latest

# Atualizar base image
docker pull openjdk:17-jre-slim
```

### 3. Compliance

#### Auditoria
```bash
# Logs de auditoria
kubectl logs -f deployment/nfe-api | grep AUDIT

# Métricas de compliance
curl https://api.fenix.com.br/actuator/metrics/compliance
```

## 🚨 Disaster Recovery

### 1. Plano de Recuperação

#### RTO (Recovery Time Objective)
- **Crítico**: 1 hora
- **Alto**: 4 horas
- **Médio**: 8 horas
- **Baixo**: 24 horas

#### RPO (Recovery Point Objective)
- **Crítico**: 15 minutos
- **Alto**: 1 hora
- **Médio**: 4 horas
- **Baixo**: 24 horas

### 2. Procedimentos de Recuperação

#### Falha de Aplicação
1. **Identificar falha**
2. **Escalar horizontalmente**
3. **Reiniciar serviços**
4. **Verificar health checks**
5. **Monitorar métricas**

#### Falha de Banco
1. **Identificar falha**
2. **Ativar standby**
3. **Verificar consistência**
4. **Atualizar DNS**
5. **Monitorar replicação**

#### Falha de Região
1. **Identificar falha**
2. **Ativar DR site**
3. **Restaurar backup**
4. **Atualizar DNS**
5. **Monitorar serviços**

### 3. Testes de DR

#### Teste Mensal
- [ ] Simular falha de aplicação
- [ ] Simular falha de banco
- [ ] Simular falha de região
- [ ] Verificar RTO/RPO
- [ ] Documentar resultados

#### Teste Trimestral
- [ ] Teste completo de DR
- [ ] Verificar procedimentos
- [ ] Atualizar documentação
- [ ] Treinar equipe
- [ ] Revisar planos

---

## 📞 Contatos

- **Plantão**: +55 11 99999-9999
- **Email**: operacoes@fenix.com.br
- **Slack**: #operacoes
- **PagerDuty**: https://fenix.pagerduty.com

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
