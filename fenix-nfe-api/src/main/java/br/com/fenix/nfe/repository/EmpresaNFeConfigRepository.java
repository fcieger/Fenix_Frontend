package br.com.fenix.nfe.repository;

import br.com.fenix.nfe.model.entity.EmpresaNFeConfig;
import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de EmpresaNFeConfig
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Repository
public interface EmpresaNFeConfigRepository extends JpaRepository<EmpresaNFeConfig, UUID> {

    /**
     * Busca configuração por ID da empresa
     */
    Optional<EmpresaNFeConfig> findByEmpresaId(String empresaId);

    /**
     * Busca configuração por CNPJ
     */
    Optional<EmpresaNFeConfig> findByCnpj(String cnpj);

    /**
     * Verifica se existe configuração para a empresa
     */
    boolean existsByEmpresaId(String empresaId);

    /**
     * Verifica se existe configuração para o CNPJ
     */
    boolean existsByCnpj(String cnpj);

    /**
     * Busca configurações ativas
     */
    List<EmpresaNFeConfig> findByAtivaTrue();

    /**
     * Busca configurações ativas por estado
     */
    List<EmpresaNFeConfig> findByAtivaTrueAndEstado(NFeEstadoEnum estado);

    /**
     * Busca configurações ativas por ambiente
     */
    List<EmpresaNFeConfig> findByAtivaTrueAndAmbiente(NFeAmbienteEnum ambiente);

    /**
     * Busca configurações ativas por estado e ambiente
     */
    List<EmpresaNFeConfig> findByAtivaTrueAndEstadoAndAmbiente(
            NFeEstadoEnum estado, NFeAmbienteEnum ambiente);

    /**
     * Busca configurações por estado
     */
    Page<EmpresaNFeConfig> findByEstado(NFeEstadoEnum estado, Pageable pageable);

    /**
     * Busca configurações por ambiente
     */
    Page<EmpresaNFeConfig> findByAmbiente(NFeAmbienteEnum ambiente, Pageable pageable);

    /**
     * Busca configurações por estado e ambiente
     */
    Page<EmpresaNFeConfig> findByEstadoAndAmbiente(
            NFeEstadoEnum estado, NFeAmbienteEnum ambiente, Pageable pageable);

    /**
     * Busca configurações por razão social (busca parcial)
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE LOWER(e.razaoSocial) LIKE LOWER(CONCAT('%', :razaoSocial, '%'))")
    Page<EmpresaNFeConfig> findByRazaoSocialContainingIgnoreCase(
            @Param("razaoSocial") String razaoSocial, Pageable pageable);

    /**
     * Busca configurações ativas por razão social
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "AND LOWER(e.razaoSocial) LIKE LOWER(CONCAT('%', :razaoSocial, '%'))")
    List<EmpresaNFeConfig> findAtivasByRazaoSocialContainingIgnoreCase(
            @Param("razaoSocial") String razaoSocial);

    /**
     * Busca configurações por CNPJ (busca parcial)
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.cnpj LIKE CONCAT('%', :cnpj, '%')")
    Page<EmpresaNFeConfig> findByCnpjContaining(@Param("cnpj") String cnpj, Pageable pageable);

    /**
     * Busca configurações ativas por CNPJ
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "AND e.cnpj LIKE CONCAT('%', :cnpj, '%')")
    List<EmpresaNFeConfig> findAtivasByCnpjContaining(@Param("cnpj") String cnpj);

    /**
     * Busca configurações por série padrão
     */
    List<EmpresaNFeConfig> findBySeriePadrao(Integer seriePadrao);

    /**
     * Busca configurações ativas por série padrão
     */
    List<EmpresaNFeConfig> findByAtivaTrueAndSeriePadrao(Integer seriePadrao);

    /**
     * Busca configurações por próximo número
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.proximoNumero >= :numeroMinimo")
    List<EmpresaNFeConfig> findByProximoNumeroGreaterThanEqual(@Param("numeroMinimo") Integer numeroMinimo);

    /**
     * Busca configurações ativas por próximo número
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "AND e.proximoNumero >= :numeroMinimo")
    List<EmpresaNFeConfig> findAtivasByProximoNumeroGreaterThanEqual(@Param("numeroMinimo") Integer numeroMinimo);

    /**
     * Conta configurações ativas
     */
    long countByAtivaTrue();

    /**
     * Conta configurações por estado
     */
    long countByEstado(NFeEstadoEnum estado);

    /**
     * Conta configurações por ambiente
     */
    long countByAmbiente(NFeAmbienteEnum ambiente);

    /**
     * Conta configurações por estado e ambiente
     */
    long countByEstadoAndAmbiente(NFeEstadoEnum estado, NFeAmbienteEnum ambiente);

    /**
     * Conta configurações ativas por estado
     */
    long countByAtivaTrueAndEstado(NFeEstadoEnum estado);

    /**
     * Conta configurações ativas por ambiente
     */
    long countByAtivaTrueAndAmbiente(NFeAmbienteEnum ambiente);

    /**
     * Conta configurações ativas por estado e ambiente
     */
    long countByAtivaTrueAndEstadoAndAmbiente(NFeEstadoEnum estado, NFeAmbienteEnum ambiente);

    /**
     * Busca configurações para relatório
     */
    @Query("SELECT e.estado, e.ambiente, COUNT(e) FROM EmpresaNFeConfig e " +
           "WHERE e.ativa = true " +
           "GROUP BY e.estado, e.ambiente " +
           "ORDER BY e.estado, e.ambiente")
    List<Object[]> findEstatisticasAtivas();

    /**
     * Busca configurações para relatório por estado
     */
    @Query("SELECT e.ambiente, COUNT(e) FROM EmpresaNFeConfig e " +
           "WHERE e.ativa = true AND e.estado = :estado " +
           "GROUP BY e.ambiente " +
           "ORDER BY e.ambiente")
    List<Object[]> findEstatisticasAtivasByEstado(@Param("estado") NFeEstadoEnum estado);

    /**
     * Busca configurações para relatório por ambiente
     */
    @Query("SELECT e.estado, COUNT(e) FROM EmpresaNFeConfig e " +
           "WHERE e.ativa = true AND e.ambiente = :ambiente " +
           "GROUP BY e.estado " +
           "ORDER BY e.estado")
    List<Object[]> findEstatisticasAtivasByAmbiente(@Param("ambiente") NFeAmbienteEnum ambiente);

    /**
     * Busca configurações com certificado próximo do vencimento
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "AND e.certificadoPath IS NOT NULL " +
           "AND e.certificadoPath != ''")
    List<EmpresaNFeConfig> findAtivasComCertificado();

    /**
     * Busca configurações sem certificado
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "AND (e.certificadoPath IS NULL OR e.certificadoPath = '')")
    List<EmpresaNFeConfig> findAtivasSemCertificado();

    /**
     * Busca configurações por certificado
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.certificadoPath = :certificadoPath")
    List<EmpresaNFeConfig> findByCertificadoPath(@Param("certificadoPath") String certificadoPath);

    /**
     * Busca configurações ativas por certificado
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "AND e.certificadoPath = :certificadoPath")
    List<EmpresaNFeConfig> findAtivasByCertificadoPath(@Param("certificadoPath") String certificadoPath);

    /**
     * Busca configurações para backup
     */
    @Query("SELECT e FROM EmpresaNFeConfig e WHERE e.ativa = true " +
           "ORDER BY e.estado, e.ambiente, e.razaoSocial")
    List<EmpresaNFeConfig> findAtivasParaBackup();

    /**
     * Busca configurações para auditoria
     */
    @Query("SELECT e FROM EmpresaNFeConfig e " +
           "WHERE e.updatedAt >= :dataInicio " +
           "ORDER BY e.updatedAt DESC")
    List<EmpresaNFeConfig> findParaAuditoria(@Param("dataInicio") java.time.LocalDateTime dataInicio);
}


