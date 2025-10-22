# Fenix NFe API - Documentação de Desenvolvimento

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Convenções de Código](#convenções-de-código)
- [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
- [Testes](#testes)
- [Debugging](#debugging)
- [Contribuição](#contribuição)
- [Troubleshooting](#troubleshooting)

## 🔍 Visão Geral

Este documento descreve como configurar e desenvolver na **Fenix NFe API**, incluindo configuração do ambiente, convenções de código, padrões de desenvolvimento e processos de contribuição.

### Tecnologias Utilizadas

- **Java**: 17
- **Spring Boot**: 3.2+
- **Spring Security**: 6.0+
- **Spring Data JPA**: 3.2+
- **Spring AMQP**: 3.2+
- **PostgreSQL**: 15+
- **Redis**: 7+
- **RabbitMQ**: 3.12+
- **Maven**: 3.8+
- **Docker**: 20.10+
- **Kubernetes**: 1.24+

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos

#### Java 17
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# Verificar instalação
java -version
javac -version
```

#### Maven 3.8+
```bash
# Ubuntu/Debian
sudo apt install maven

# Verificar instalação
mvn -version
```

#### Docker e Docker Compose
```bash
# Ubuntu/Debian
sudo apt install docker.io docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

#### Git
```bash
# Ubuntu/Debian
sudo apt install git

# Verificar instalação
git --version
```

### 2. Clone do Repositório

```bash
# Clone do repositório
git clone https://github.com/fenix/nfe-api.git
cd nfe-api

# Configurar branch de desenvolvimento
git checkout develop
git pull origin develop
```

### 3. Configuração do IDE

#### IntelliJ IDEA

1. **Instalar plugins**:
   - Lombok
   - Spring Boot
   - Docker
   - Kubernetes

2. **Configurar Java**:
   - Project SDK: Java 17
   - Project Language Level: 17

3. **Configurar Maven**:
   - Maven home directory: `/usr/share/maven`
   - User settings file: `~/.m2/settings.xml`

#### Eclipse

1. **Instalar plugins**:
   - Spring Tools 4
   - Lombok
   - Docker Tools

2. **Configurar Java**:
   - JRE: Java 17
   - Compiler compliance: 17

3. **Configurar Maven**:
   - Maven installation: Embedded
   - User settings: `~/.m2/settings.xml`

#### VS Code

1. **Instalar extensões**:
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - Docker
   - Kubernetes

2. **Configurar Java**:
   - Java Home: `/usr/lib/jvm/java-17-openjdk`
   - Maven Home: `/usr/share/maven`

### 4. Configuração do Maven

**Arquivo `~/.m2/settings.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          http://maven.apache.org/xsd/settings-1.0.0.xsd">
  
  <profiles>
    <profile>
      <id>fenix-nfe</id>
      <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <maven.compiler.release>17</maven.compiler.release>
      </properties>
    </profile>
  </profiles>
  
  <activeProfiles>
    <activeProfile>fenix-nfe</activeProfile>
  </activeProfiles>
</settings>
```

### 5. Configuração do Banco de Dados

```bash
# Subir PostgreSQL com Docker
docker run -d \
  --name postgres-dev \
  -e POSTGRES_DB=fenix_nfe \
  -e POSTGRES_USER=fenix_user \
  -e POSTGRES_PASSWORD=fenix_password \
  -p 5432:5432 \
  postgres:15

# Verificar conexão
psql -h localhost -U fenix_user -d fenix_nfe
```

### 6. Configuração do Redis

```bash
# Subir Redis com Docker
docker run -d \
  --name redis-dev \
  -p 6379:6379 \
  redis:7

# Verificar conexão
redis-cli ping
```

### 7. Configuração do RabbitMQ

```bash
# Subir RabbitMQ com Docker
docker run -d \
  --name rabbitmq-dev \
  -e RABBITMQ_DEFAULT_USER=fenix_user \
  -e RABBITMQ_DEFAULT_PASS=rabbitmq_password \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3.12-management

# Verificar conexão
curl http://localhost:15672
```

## 📁 Estrutura do Projeto

```
fenix-nfe-api/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── br/com/fenix/nfe/
│   │   │       ├── api/                    # Controllers e DTOs
│   │   │       │   ├── controller/
│   │   │       │   ├── dto/
│   │   │       │   ├── config/
│   │   │       │   ├── security/
│   │   │       │   └── interceptor/
│   │   │       ├── service/                # Lógica de negócio
│   │   │       │   ├── impl/
│   │   │       │   └── interface/
│   │   │       ├── repository/             # Acesso a dados
│   │   │       ├── model/                  # Entidades e enums
│   │   │       │   ├── entity/
│   │   │       │   ├── enums/
│   │   │       │   └── queue/
│   │   │       ├── worker/                 # Processadores de fila
│   │   │       ├── util/                   # Utilitários
│   │   │       ├── exception/              # Exceções customizadas
│   │   │       └── config/                 # Configurações
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── logback-spring.xml
│   │       └── db/migration/
│   ├── test/
│   │   ├── java/
│   │   │   └── br/com/fenix/nfe/
│   │   │       ├── api/
│   │   │       ├── service/
│   │   │       ├── util/
│   │   │       └── integration/
│   │   └── resources/
│   │       └── application-test.yml
│   └── docker/
│       ├── Dockerfile
│       ├── Dockerfile.optimized
│       └── docker-compose.yml
├── k8s/                                    # Manifests Kubernetes
├── helm/                                   # Charts Helm
├── monitoring/                             # Configurações de monitoramento
├── scripts/                                # Scripts de automação
├── docs/                                   # Documentação
├── pom.xml                                 # Maven POM
└── README.md
```

## 🎨 Convenções de Código

### 1. Nomenclatura

#### Classes
```java
// PascalCase
public class NFeService {}
public class NFeController {}
public class NFeRequest {}
```

#### Métodos
```java
// camelCase
public String emitirNFe(NFeRequest request) {}
public void processarNFe(String nfeId) {}
public boolean validarDados(NFeRequest request) {}
```

#### Variáveis
```java
// camelCase
String nfeId = "nfe-123456789";
int numeroNfe = 1;
boolean isValido = true;
```

#### Constantes
```java
// UPPER_SNAKE_CASE
public static final String NFE_PREFIX = "nfe-";
public static final int MAX_RETRY_ATTEMPTS = 3;
public static final String DEFAULT_ENVIRONMENT = "HOMOLOGACAO";
```

#### Pacotes
```java
// lowercase
br.com.fenix.nfe.api.controller
br.com.fenix.nfe.service.impl
br.com.fenix.nfe.model.entity
```

### 2. Estrutura de Classes

#### Controller
```java
@RestController
@RequestMapping("/api/nfe")
@Validated
@Slf4j
public class NFeController {
    
    private final NFeService nFeService;
    
    @PostMapping("/emitir")
    public ResponseEntity<NFeResponse> emitirNFe(
            @Valid @RequestBody NFeRequest request,
            @RequestHeader("X-Company-CNPJ") String cnpj) {
        
        log.info("Recebida requisição de emissão de NFe para empresa: {}", cnpj);
        
        try {
            NFeResponse response = nFeService.emitirNFe(request, cnpj);
            return ResponseEntity.ok(response);
        } catch (NFeException e) {
            log.error("Erro ao emitir NFe: {}", e.getMessage(), e);
            throw e;
        }
    }
}
```

#### Service
```java
@Service
@Transactional
@Slf4j
public class NFeServiceImpl implements NFeService {
    
    private final NFeStatusRepository nFeStatusRepository;
    private final NFeQueueService nFeQueueService;
    private final NFeValidationService nFeValidationService;
    
    @Override
    public NFeResponse emitirNFe(NFeRequest request, String cnpj) {
        log.info("Iniciando emissão de NFe para empresa: {}", cnpj);
        
        // Validar dados
        nFeValidationService.validarNFe(request);
        
        // Criar NFe
        NFeStatus nFeStatus = criarNFeStatus(request, cnpj);
        nFeStatusRepository.save(nFeStatus);
        
        // Enviar para fila
        nFeQueueService.enviarParaFilaEmitir(nFeStatus);
        
        return NFeResponse.builder()
            .nfeId(nFeStatus.getId())
            .status(nFeStatus.getStatus())
            .chaveAcesso(nFeStatus.getChaveAcesso())
            .build();
    }
}
```

#### Entity
```java
@Entity
@Table(name = "nfe_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NFeStatus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "empresa_cnpj", nullable = false)
    private String empresaCnpj;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private NFeStatusEnum status;
    
    @Column(name = "chave_acesso")
    private String chaveAcesso;
    
    @Column(name = "numero_protocolo")
    private String numeroProtocolo;
    
    @Column(name = "data_emissao")
    private LocalDateTime dataEmissao;
    
    @Column(name = "data_processamento")
    private LocalDateTime dataProcessamento;
    
    @Column(name = "xml_original", columnDefinition = "TEXT")
    private String xmlOriginal;
    
    @Column(name = "xml_assinado", columnDefinition = "TEXT")
    private String xmlAssinado;
    
    @Column(name = "xml_autorizado", columnDefinition = "TEXT")
    private String xmlAutorizado;
    
    @Column(name = "erro", columnDefinition = "TEXT")
    private String erro;
    
    @Column(name = "tentativas")
    private Integer tentativas;
    
    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### 3. Anotações

#### Validação
```java
@Valid
@NotNull
@NotBlank
@Size(min = 1, max = 100)
@Pattern(regexp = "^[0-9]{14}$")
@Email
```

#### Spring
```java
@RestController
@Service
@Repository
@Component
@Configuration
@Bean
@Autowired
@Transactional
@Cacheable
@Async
```

#### Lombok
```java
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@EqualsAndHashCode
@ToString
```

## 🏗️ Padrões de Desenvolvimento

### 1. Repository Pattern

```java
@Repository
public interface NFeStatusRepository extends JpaRepository<NFeStatus, String> {
    
    List<NFeStatus> findByEmpresaCnpjAndStatus(String cnpj, NFeStatusEnum status);
    
    @Query("SELECT n FROM NFeStatus n WHERE n.empresaCnpj = :cnpj AND n.dataEmissao BETWEEN :inicio AND :fim")
    List<NFeStatus> findByEmpresaCnpjAndDataEmissaoBetween(
        @Param("cnpj") String cnpj,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
    
    @Modifying
    @Query("UPDATE NFeStatus n SET n.status = :status WHERE n.id = :id")
    void atualizarStatus(@Param("id") String id, @Param("status") NFeStatusEnum status);
}
```

### 2. Service Layer

```java
@Service
@Transactional
public class NFeServiceImpl implements NFeService {
    
    private final NFeStatusRepository nFeStatusRepository;
    private final NFeQueueService nFeQueueService;
    private final NFeValidationService nFeValidationService;
    
    @Override
    @Transactional(readOnly = true)
    public NFeResponse consultarNFe(String nfeId, String cnpj) {
        NFeStatus nFeStatus = nFeStatusRepository.findById(nfeId)
            .orElseThrow(() -> new NFeNotFoundException("NFe não encontrada"));
        
        if (!nFeStatus.getEmpresaCnpj().equals(cnpj)) {
            throw new NFeAccessDeniedException("Acesso negado à NFe");
        }
        
        return NFeResponse.builder()
            .nfeId(nFeStatus.getId())
            .status(nFeStatus.getStatus())
            .chaveAcesso(nFeStatus.getChaveAcesso())
            .build();
    }
}
```

### 3. DTO Pattern

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NFeRequest {
    
    @NotNull(message = "Série é obrigatória")
    @Min(value = 1, message = "Série deve ser maior que 0")
    private Integer serie;
    
    @NotNull(message = "Número é obrigatório")
    @Min(value = 1, message = "Número deve ser maior que 0")
    private Integer numero;
    
    @NotNull(message = "Ambiente é obrigatório")
    @Enumerated(EnumType.STRING)
    private NFeAmbienteEnum ambiente;
    
    @Valid
    @NotNull(message = "Emitente é obrigatório")
    private EmitenteRequest emitente;
    
    @Valid
    @NotNull(message = "Destinatário é obrigatório")
    private DestinatarioRequest destinatario;
    
    @Valid
    @NotEmpty(message = "Itens são obrigatórios")
    private List<ItemRequest> itens;
    
    @Valid
    private ImpostoRequest imposto;
    
    @Valid
    private ResponsavelTecnicoRequest responsavelTecnico;
}
```

### 4. Exception Handling

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(NFeValidationException.class)
    public ResponseEntity<NFeErrorResponse> handleValidation(NFeValidationException ex) {
        log.warn("Erro de validação: {}", ex.getMessage());
        
        return ResponseEntity.badRequest()
            .body(NFeErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message(ex.getMessage())
                .category("CLIENT_ERROR")
                .details(ex.getValidationErrors())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(NFeNotFoundException.class)
    public ResponseEntity<NFeErrorResponse> handleNotFound(NFeNotFoundException ex) {
        log.warn("NFe não encontrada: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(NFeErrorResponse.builder()
                .code("NOT_FOUND")
                .message(ex.getMessage())
                .category("CLIENT_ERROR")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
```

### 5. Caching

```java
@Service
@Slf4j
public class NFeConfigurationServiceImpl implements NFeConfigurationService {
    
    @Cacheable(value = "empresa-config", key = "#cnpj")
    public EmpresaNFeConfig obterConfiguracao(String cnpj) {
        log.debug("Buscando configuração para empresa: {}", cnpj);
        
        return empresaNFeConfigRepository.findByCnpj(cnpj)
            .orElseThrow(() -> new NFeConfigurationException("Configuração não encontrada"));
    }
    
    @CacheEvict(value = "empresa-config", key = "#cnpj")
    public void invalidarCache(String cnpj) {
        log.debug("Invalidando cache para empresa: {}", cnpj);
    }
}
```

## 🧪 Testes

### 1. Testes Unitários

```java
@ExtendWith(MockitoExtension.class)
class NFeServiceImplTest {
    
    @Mock
    private NFeStatusRepository nFeStatusRepository;
    
    @Mock
    private NFeQueueService nFeQueueService;
    
    @Mock
    private NFeValidationService nFeValidationService;
    
    @InjectMocks
    private NFeServiceImpl nFeService;
    
    @Test
    void emitirNFe_DeveEmitirNFeComSucesso() {
        // Given
        NFeRequest request = criarNFeRequest();
        String cnpj = "11543862000187";
        
        when(nFeValidationService.validarNFe(request)).thenReturn(true);
        when(nFeStatusRepository.save(any(NFeStatus.class))).thenReturn(criarNFeStatus());
        
        // When
        NFeResponse response = nFeService.emitirNFe(request, cnpj);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.getNfeId()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(NFeStatusEnum.PENDENTE);
        
        verify(nFeValidationService).validarNFe(request);
        verify(nFeStatusRepository).save(any(NFeStatus.class));
        verify(nFeQueueService).enviarParaFilaEmitir(any(NFeStatus.class));
    }
}
```

### 2. Testes de Integração

```java
@SpringBootTest
@Testcontainers
@Transactional
class NFeControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7")
            .withExposedPorts(6379);
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void emitirNFe_DeveEmitirNFeComSucesso() throws Exception {
        // Given
        NFeRequest request = criarNFeRequest();
        String token = obterToken();
        
        // When
        mockMvc.perform(post("/api/nfe/emitir")
                .header("Authorization", "Bearer " + token)
                .header("X-Company-CNPJ", "11543862000187")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nfeId").exists())
                .andExpect(jsonPath("$.data.status").value("PENDENTE"));
    }
}
```

### 3. Testes de Performance

```java
@SpringBootTest
@Testcontainers
class NFePerformanceTest {
    
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void emitirNFe_DeveEmitirNFeEmMenosDe5Segundos() {
        // Given
        NFeRequest request = criarNFeRequest();
        
        // When
        long startTime = System.currentTimeMillis();
        NFeResponse response = nFeService.emitirNFe(request, "11543862000187");
        long endTime = System.currentTimeMillis();
        
        // Then
        assertThat(response).isNotNull();
        assertThat(endTime - startTime).isLessThan(5000);
    }
}
```

### 4. Executar Testes

```bash
# Todos os testes
mvn test

# Testes unitários
mvn test -Dtest=*Test

# Testes de integração
mvn test -Dtest=*IntegrationTest

# Testes de performance
mvn test -Dtest=*PerformanceTest

# Com cobertura
mvn test jacoco:report
```

## 🐛 Debugging

### 1. Logs

```java
@Slf4j
@Service
public class NFeServiceImpl implements NFeService {
    
    public String emitirNFe(NFeRequest request, String cnpj) {
        log.info("Iniciando emissão de NFe para empresa: {}", cnpj);
        log.debug("Dados da NFe: {}", request);
        
        try {
            // Lógica de negócio
            log.info("NFe emitida com sucesso: {}", nfeId);
            return nfeId;
        } catch (Exception e) {
            log.error("Erro ao emitir NFe para empresa: {}", cnpj, e);
            throw new NFeException("Erro interno", e);
        }
    }
}
```

### 2. Breakpoints

#### IntelliJ IDEA
1. Clique na margem esquerda para adicionar breakpoint
2. Execute em modo debug
3. Use F8 para step over, F7 para step into

#### Eclipse
1. Clique na margem esquerda para adicionar breakpoint
2. Execute em modo debug
3. Use F6 para step over, F5 para step into

### 3. Profiling

```bash
# Com JProfiler
java -agentpath:/path/to/jprofiler/bin/linux-x64/libjprofilerti.so=port=8849,nowait -jar target/fenix-nfe-api.jar

# Com VisualVM
jvisualvm

# Com JConsole
jconsole
```

### 4. Debugging Remoto

```bash
# Aplicação
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar target/fenix-nfe-api.jar

# Conectar do IDE
# Host: localhost
# Port: 5005
```

## 🤝 Contribuição

### 1. Fork e Clone

```bash
# Fork no GitHub
# Clone do seu fork
git clone https://github.com/seu-usuario/nfe-api.git
cd nfe-api

# Adicionar upstream
git remote add upstream https://github.com/fenix/nfe-api.git
```

### 2. Branch de Desenvolvimento

```bash
# Criar branch
git checkout -b feature/nova-funcionalidade

# Fazer alterações
# Commitar
git add .
git commit -m "feat: adicionar nova funcionalidade"

# Push
git push origin feature/nova-funcionalidade
```

### 3. Pull Request

1. **Criar PR** no GitHub
2. **Descrever mudanças** no template
3. **Aguardar review** da equipe
4. **Corrigir feedback** se necessário
5. **Merge** após aprovação

### 4. Convenções de Commit

```
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatação de código
refactor: refatoração
test: adicionar testes
chore: tarefas de manutenção
```

### 5. Code Review

#### Checklist
- [ ] Código segue convenções
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Performance adequada
- [ ] Segurança verificada

## 🔧 Troubleshooting

### 1. Problemas Comuns

#### Maven não encontra dependências
```bash
# Limpar cache
mvn clean

# Atualizar dependências
mvn dependency:resolve

# Reinstalar
mvn clean install
```

#### Banco não conecta
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs
docker logs postgres-dev

# Testar conexão
psql -h localhost -U fenix_user -d fenix_nfe
```

#### Redis não conecta
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Verificar logs
docker logs redis-dev

# Testar conexão
redis-cli ping
```

#### RabbitMQ não conecta
```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Verificar logs
docker logs rabbitmq-dev

# Testar conexão
curl http://localhost:15672
```

### 2. Logs de Debug

```bash
# Aplicação
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"

# Docker
docker-compose logs -f nfe-api

# Kubernetes
kubectl logs -l app=nfe-api -f
```

### 3. Performance

```bash
# CPU
top -p $(pgrep java)

# Memória
jstat -gc $(pgrep java) 1s

# Threads
jstack $(pgrep java)
```

### 4. Limpeza

```bash
# Maven
mvn clean

# Docker
docker system prune -f

# Kubernetes
kubectl delete pods --all
```

---

## 📞 Suporte

- **Documentação**: https://docs.fenix.com.br
- **GitHub**: https://github.com/fenix/nfe-api
- **Issues**: https://github.com/fenix/nfe-api/issues

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
