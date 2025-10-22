# 🚀 Fenix NFe API

API para emissão e gestão de NFe com arquitetura de filas e monitoramento completo.

## 📋 Visão Geral

A Fenix NFe API é uma solução robusta e escalável para emissão de Notas Fiscais Eletrônicas (NFe) com as seguintes características:

- ✅ **Arquitetura de Filas**: Processamento assíncrono com RabbitMQ
- ✅ **Cache Inteligente**: Redis para otimização de performance
- ✅ **Monitoramento Completo**: Prometheus + Grafana + Jaeger
- ✅ **Escalabilidade**: Suporte a múltiplas empresas
- ✅ **Confiabilidade**: Retry automático e Dead Letter Queues
- ✅ **Segurança**: JWT Authentication e Role-based Authorization

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FENIX APPS    │───▶│   API GATEWAY   │───▶│   NFe API       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   RABBITMQ      │    │   POSTGRESQL    │
                       │   (Filas)       │    │   (Dados)       │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   WORKERS       │
                       │   (Processadores)│
                       └─────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Java 17+
- Maven 3.8+
- PostgreSQL 13+
- Redis 6+
- RabbitMQ 3.8+

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/fenix/nfe-api.git
cd nfe-api
```

2. **Configure o banco de dados**
```bash
# Crie o banco de dados
createdb nfe_dev

# Execute as migrações
mvn flyway:migrate
```

3. **Configure as variáveis de ambiente**
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/nfe_dev
export REDIS_HOST=localhost
export RABBITMQ_HOST=localhost
```

4. **Execute a aplicação**
```bash
mvn spring-boot:run
```

### Docker Compose

```bash
# Suba todos os serviços
docker-compose up -d

# Acesse a aplicação
curl http://localhost:8080/api/actuator/health
```

## 📚 Documentação da API

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/v3/api-docs

## 🔧 Configuração

### Ambientes

- **Desenvolvimento**: `application-dev.yml`
- **Produção**: `application-prod.yml`

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `DATABASE_URL` | URL do banco PostgreSQL | `jdbc:postgresql://localhost:5432/nfe_dev` |
| `REDIS_HOST` | Host do Redis | `localhost` |
| `RABBITMQ_HOST` | Host do RabbitMQ | `localhost` |
| `JWT_SECRET` | Chave secreta JWT | `dev-secret-key` |

## 📊 Monitoramento

### Métricas

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

### Dashboards

- NFe Overview
- Queue Metrics
- Performance Metrics
- Error Tracking

### Alertas

- Alta taxa de erro
- Fila com backlog
- Tempo de resposta alto
- Certificado expirando

## 🧪 Testes

```bash
# Testes unitários
mvn test

# Testes de integração
mvn verify

# Testes de performance
mvn test -Dtest=PerformanceTest
```

## 🚀 Deploy

### Kubernetes

```bash
# Aplique as configurações
kubectl apply -f k8s/

# Verifique o status
kubectl get pods -n nfe-system
```

### Docker

```bash
# Build da imagem
docker build -t fenix/nfe-api:latest .

# Execute o container
docker run -p 8080:8080 fenix/nfe-api:latest
```

## 📈 Performance

### Benchmarks

- **Throughput**: 1000+ NFe/min
- **Latência**: < 2s (95th percentile)
- **Disponibilidade**: 99.9%

### Escalabilidade

- **Workers**: 5-20 por tipo de fila
- **Cache**: Redis cluster
- **Database**: Read replicas

## 🔒 Segurança

- **Autenticação**: JWT tokens
- **Autorização**: Role-based (RBAC)
- **Rate Limiting**: Por empresa/IP
- **Auditoria**: Logs completos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: dev@fenix.com
- **Slack**: #nfe-api
- **Issues**: [GitHub Issues](https://github.com/fenix/nfe-api/issues)

## 🏆 Equipe

- **Arquiteto**: [Seu Nome]
- **DevOps**: [Seu Nome]
- **Backend**: [Seu Nome]

---

**Fenix Team** 🚀


