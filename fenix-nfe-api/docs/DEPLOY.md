# Fenix NFe API - Documentação de Deploy

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Ambientes](#ambientes)
- [Deploy Local](#deploy-local)
- [Deploy em Kubernetes](#deploy-em-kubernetes)
- [Deploy em Produção](#deploy-em-produção)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)
- [Rollback](#rollback)
- [Manutenção](#manutenção)

## 🔍 Visão Geral

Este documento descreve como fazer deploy da **Fenix NFe API** em diferentes ambientes, desde desenvolvimento local até produção em Kubernetes.

### Estratégias de Deploy

- **Local**: Docker Compose para desenvolvimento
- **Staging**: Kubernetes com recursos limitados
- **Produção**: Kubernetes com alta disponibilidade
- **CI/CD**: Deploy automático via GitHub Actions

## 📋 Pré-requisitos

### Ferramentas Necessárias

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **kubectl**: 1.24+
- **Helm**: 3.8+
- **Git**: 2.30+

### Recursos Mínimos

#### Desenvolvimento Local
- **CPU**: 4 cores
- **RAM**: 8GB
- **Disco**: 50GB

#### Staging
- **CPU**: 8 cores
- **RAM**: 16GB
- **Disco**: 100GB

#### Produção
- **CPU**: 16 cores
- **RAM**: 32GB
- **Disco**: 500GB

### Certificados Digitais

- **Certificado A1**: Arquivo .pfx
- **Senha do certificado**: Configurada em secrets
- **Validade**: Verificar antes do deploy

## 🌍 Ambientes

### Desenvolvimento (Local)

- **URL**: http://localhost:8080
- **Banco**: PostgreSQL local
- **Cache**: Redis local
- **Filas**: RabbitMQ local
- **Monitoramento**: Básico

### Staging

- **URL**: https://staging-api.fenix.com.br
- **Banco**: PostgreSQL cluster
- **Cache**: Redis cluster
- **Filas**: RabbitMQ cluster
- **Monitoramento**: Completo

### Produção

- **URL**: https://api.fenix.com.br
- **Banco**: PostgreSQL HA
- **Cache**: Redis HA
- **Filas**: RabbitMQ HA
- **Monitoramento**: Completo + Alertas

## 🚀 Deploy Local

### 1. Clone do Repositório

```bash
git clone https://github.com/fenix/nfe-api.git
cd nfe-api
```

### 2. Configuração do Ambiente

```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar configurações
nano .env
```

**Arquivo .env:**
```bash
# Database
POSTGRES_DB=fenix_nfe
POSTGRES_USER=fenix_user
POSTGRES_PASSWORD=fenix_password

# Redis
REDIS_PASSWORD=redis_password

# RabbitMQ
RABBITMQ_USER=fenix_user
RABBITMQ_PASSWORD=rabbitmq_password

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=86400000

# SEFAZ
SEFAZ_AMBIENTE=HOMOLOGACAO
SEFAZ_UF=PR
```

### 3. Deploy com Docker Compose

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f nfe-api
```

### 4. Verificação do Deploy

```bash
# Health check
curl http://localhost:8080/health

# API docs
open http://localhost:8080/swagger-ui.html

# Grafana
open http://localhost:3000
```

### 5. Parar os Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## ☸️ Deploy em Kubernetes

### 1. Preparação do Cluster

```bash
# Verificar conexão
kubectl cluster-info

# Criar namespace
kubectl create namespace fenix-nfe

# Configurar context
kubectl config set-context --current --namespace=fenix-nfe
```

### 2. Configuração de Secrets

```bash
# Criar secret do banco
kubectl create secret generic postgres-secret \
  --from-literal=username=fenix_user \
  --from-literal=password=fenix_password

# Criar secret do Redis
kubectl create secret generic redis-secret \
  --from-literal=password=redis_password

# Criar secret do RabbitMQ
kubectl create secret generic rabbitmq-secret \
  --from-literal=username=fenix_user \
  --from-literal=password=rabbitmq_password

# Criar secret do JWT
kubectl create secret generic jwt-secret \
  --from-literal=secret=your_jwt_secret_here

# Criar secret do certificado
kubectl create secret generic certificate-secret \
  --from-file=certificate.pfx=/path/to/certificate.pfx \
  --from-literal=password=certificate_password
```

### 3. Deploy com kubectl

```bash
# Aplicar configurações
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/rbac.yaml

# Deploy da aplicação
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verificar status
kubectl get pods
kubectl get services
kubectl get ingress
```

### 4. Deploy com Helm

```bash
# Adicionar repositório
helm repo add fenix https://fenix.github.io/helm-charts
helm repo update

# Instalar chart
helm install fenix-nfe-api fenix/fenix-nfe-api \
  --namespace fenix-nfe \
  --values helm/values.yaml \
  --set image.tag=latest

# Verificar status
helm status fenix-nfe-api
```

### 5. Verificação do Deploy

```bash
# Verificar pods
kubectl get pods -l app=nfe-api

# Verificar logs
kubectl logs -l app=nfe-api -f

# Verificar serviços
kubectl get services

# Verificar ingress
kubectl get ingress

# Testar aplicação
curl https://api.fenix.com.br/health
```

## 🏭 Deploy em Produção

### 1. Preparação do Ambiente

```bash
# Configurar variáveis de ambiente
export ENVIRONMENT=production
export NAMESPACE=fenix-nfe
export REGISTRY=ghcr.io/fenix
export IMAGE_TAG=latest

# Verificar cluster
kubectl cluster-info
kubectl get nodes
```

### 2. Configuração de Secrets

```bash
# Criar secrets de produção
kubectl create secret generic postgres-secret \
  --from-literal=username=fenix_user \
  --from-literal=password=$(openssl rand -base64 32)

kubectl create secret generic redis-secret \
  --from-literal=password=$(openssl rand -base64 32)

kubectl create secret generic rabbitmq-secret \
  --from-literal=username=fenix_user \
  --from-literal=password=$(openssl rand -base64 32)

kubectl create secret generic jwt-secret \
  --from-literal=secret=$(openssl rand -base64 64)

kubectl create secret generic certificate-secret \
  --from-file=certificate.pfx=/path/to/production-certificate.pfx \
  --from-literal=password=production_certificate_password
```

### 3. Deploy da Aplicação

```bash
# Deploy com script
./scripts/k8s-deploy.sh deploy

# Ou deploy manual
kubectl apply -f k8s/
```

### 4. Configuração de Monitoramento

```bash
# Deploy do Prometheus
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --values monitoring/prometheus/values.yaml

# Deploy do Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --values monitoring/grafana/values.yaml

# Deploy do AlertManager
helm install alertmanager prometheus-community/alertmanager \
  --namespace monitoring \
  --values monitoring/alertmanager/values.yaml
```

### 5. Configuração de Backup

```bash
# Configurar backup do banco
kubectl apply -f backup/postgres-backup.yaml

# Configurar backup de volumes
kubectl apply -f backup/volume-backup.yaml

# Configurar backup de configurações
kubectl apply -f backup/config-backup.yaml
```

## 📊 Monitoramento

### 1. Métricas da Aplicação

```bash
# Verificar métricas
kubectl port-forward service/prometheus 9090:80
open http://localhost:9090

# Verificar dashboards
kubectl port-forward service/grafana 3000:80
open http://localhost:3000
```

### 2. Logs da Aplicação

```bash
# Ver logs em tempo real
kubectl logs -l app=nfe-api -f

# Ver logs de um pod específico
kubectl logs <pod-name> -f

# Ver logs anteriores
kubectl logs <pod-name> --previous
```

### 3. Status dos Recursos

```bash
# Verificar pods
kubectl get pods -o wide

# Verificar serviços
kubectl get services

# Verificar ingress
kubectl get ingress

# Verificar HPA
kubectl get hpa

# Verificar eventos
kubectl get events --sort-by='.lastTimestamp'
```

### 4. Alertas

```bash
# Verificar alertas
kubectl port-forward service/alertmanager 9093:80
open http://localhost:9093

# Verificar regras de alerta
kubectl get prometheusrules
```

## 🔧 Troubleshooting

### 1. Pods não iniciam

```bash
# Verificar status do pod
kubectl describe pod <pod-name>

# Verificar logs
kubectl logs <pod-name>

# Verificar eventos
kubectl get events --field-selector involvedObject.name=<pod-name>
```

### 2. Aplicação não responde

```bash
# Verificar health check
kubectl exec <pod-name> -- curl http://localhost:8080/health

# Verificar conectividade
kubectl exec <pod-name> -- nslookup postgres-service

# Verificar recursos
kubectl top pod <pod-name>
```

### 3. Banco de dados não conecta

```bash
# Verificar secret
kubectl get secret postgres-secret -o yaml

# Verificar serviço
kubectl get service postgres-service

# Testar conexão
kubectl exec <pod-name> -- psql -h postgres-service -U fenix_user -d fenix_nfe
```

### 4. Filas não processam

```bash
# Verificar RabbitMQ
kubectl exec <pod-name> -- rabbitmqctl status

# Verificar filas
kubectl exec <pod-name> -- rabbitmqctl list_queues

# Verificar workers
kubectl logs -l app=nfe-worker -f
```

### 5. Certificado inválido

```bash
# Verificar secret do certificado
kubectl get secret certificate-secret -o yaml

# Verificar validade
kubectl exec <pod-name> -- openssl pkcs12 -in /app/certificates/certificate.pfx -noout -info

# Verificar CNPJ
kubectl exec <pod-name> -- openssl pkcs12 -in /app/certificates/certificate.pfx -noout -info | grep Subject
```

## 🔄 Rollback

### 1. Rollback com kubectl

```bash
# Verificar histórico de deployments
kubectl rollout history deployment/nfe-api

# Rollback para versão anterior
kubectl rollout undo deployment/nfe-api

# Rollback para versão específica
kubectl rollout undo deployment/nfe-api --to-revision=2

# Verificar status
kubectl rollout status deployment/nfe-api
```

### 2. Rollback com Helm

```bash
# Verificar histórico
helm history fenix-nfe-api

# Rollback para versão anterior
helm rollback fenix-nfe-api

# Rollback para versão específica
helm rollback fenix-nfe-api 2

# Verificar status
helm status fenix-nfe-api
```

### 3. Rollback com Script

```bash
# Rollback automático
./scripts/k8s-deploy.sh rollback

# Rollback para versão específica
./scripts/k8s-deploy.sh rollback --revision=2
```

## 🔧 Manutenção

### 1. Atualização da Aplicação

```bash
# Atualizar imagem
kubectl set image deployment/nfe-api nfe-api=ghcr.io/fenix/nfe-api:new-tag

# Verificar rollout
kubectl rollout status deployment/nfe-api

# Verificar pods
kubectl get pods -l app=nfe-api
```

### 2. Escalamento

```bash
# Escalar horizontalmente
kubectl scale deployment/nfe-api --replicas=5

# Escalar com HPA
kubectl autoscale deployment/nfe-api --min=3 --max=10 --cpu-percent=70

# Verificar HPA
kubectl get hpa
```

### 3. Backup

```bash
# Backup do banco
./scripts/backup.sh backup

# Backup de configurações
kubectl get all -o yaml > backup/k8s-resources.yaml

# Backup de secrets
kubectl get secrets -o yaml > backup/secrets.yaml
```

### 4. Limpeza

```bash
# Limpar pods finalizados
kubectl delete pods --field-selector=status.phase=Succeeded

# Limpar pods falhados
kubectl delete pods --field-selector=status.phase=Failed

# Limpar recursos não utilizados
kubectl delete all --all
```

### 5. Monitoramento

```bash
# Verificar saúde
./scripts/maintenance.sh health

# Verificar recursos
./scripts/maintenance.sh resources

# Otimizar performance
./scripts/maintenance.sh optimize
```

## 📋 Checklist de Deploy

### Pré-Deploy

- [ ] Verificar pré-requisitos
- [ ] Configurar secrets
- [ ] Validar certificados
- [ ] Testar em ambiente de staging
- [ ] Verificar backup

### Deploy

- [ ] Aplicar configurações
- [ ] Deploy da aplicação
- [ ] Verificar health checks
- [ ] Testar endpoints
- [ ] Configurar monitoramento

### Pós-Deploy

- [ ] Verificar logs
- [ ] Verificar métricas
- [ ] Testar funcionalidades
- [ ] Configurar alertas
- [ ] Documentar mudanças

## 🚨 Emergência

### Contatos

- **DevOps**: devops@fenix.com.br
- **Arquitetura**: arquitetura@fenix.com.br
- **Suporte**: suporte@fenix.com.br

### Procedimentos

1. **Identificar problema**
2. **Avaliar impacto**
3. **Executar rollback se necessário**
4. **Notificar equipe**
5. **Documentar incidente**

---

## 📞 Suporte

- **Documentação**: https://docs.fenix.com.br
- **Status**: https://status.fenix.com.br
- **GitHub**: https://github.com/fenix/nfe-api

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
