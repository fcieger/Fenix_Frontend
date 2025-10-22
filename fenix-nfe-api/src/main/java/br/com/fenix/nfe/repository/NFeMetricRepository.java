package br.com.fenix.nfe.repository;

import br.com.fenix.nfe.model.entity.NFeMetric;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repositório para operações de NFeMetric
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Repository
public interface NFeMetricRepository extends JpaRepository<NFeMetric, UUID> {

    /**
     * Busca métricas por empresa
     */
    Page<NFeMetric> findByEmpresaIdOrderByCreatedAtDesc(String empresaId, Pageable pageable);

    /**
     * Busca métricas por empresa e operação
     */
    Page<NFeMetric> findByEmpresaIdAndOperacaoOrderByCreatedAtDesc(
            String empresaId, NFeOperacaoEnum operacao, Pageable pageable);

    /**
     * Busca métricas por empresa e nome da métrica
     */
    Page<NFeMetric> findByEmpresaIdAndNomeMetricaOrderByCreatedAtDesc(
            String empresaId, String nomeMetrica, Pageable pageable);

    /**
     * Busca métricas por operação
     */
    Page<NFeMetric> findByOperacaoOrderByCreatedAtDesc(NFeOperacaoEnum operacao, Pageable pageable);

    /**
     * Busca métricas por nome da métrica
     */
    Page<NFeMetric> findByNomeMetricaOrderByCreatedAtDesc(String nomeMetrica, Pageable pageable);

    /**
     * Busca métricas por período
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.createdAt DESC")
    Page<NFeMetric> findByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca métricas por empresa e período
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "AND m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.createdAt DESC")
    Page<NFeMetric> findByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca métricas por operação e período
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.operacao = :operacao " +
           "AND m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.createdAt DESC")
    Page<NFeMetric> findByOperacaoAndPeriodo(
            @Param("operacao") NFeOperacaoEnum operacao,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca métricas por nome e período
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.nomeMetrica = :nomeMetrica " +
           "AND m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.createdAt DESC")
    Page<NFeMetric> findByNomeMetricaAndPeriodo(
            @Param("nomeMetrica") String nomeMetrica,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca métricas por valor maior que
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.valor > :valorMinimo " +
           "ORDER BY m.valor DESC")
    List<NFeMetric> findByValorGreaterThan(@Param("valorMinimo") Double valorMinimo);

    /**
     * Busca métricas por valor menor que
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.valor < :valorMaximo " +
           "ORDER BY m.valor ASC")
    List<NFeMetric> findByValorLessThan(@Param("valorMaximo") Double valorMaximo);

    /**
     * Busca métricas por valor entre
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.valor BETWEEN :valorMinimo AND :valorMaximo " +
           "ORDER BY m.valor DESC")
    List<NFeMetric> findByValorBetween(
            @Param("valorMinimo") Double valorMinimo,
            @Param("valorMaximo") Double valorMaximo);

    /**
     * Busca métricas por empresa e valor maior que
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "AND m.valor > :valorMinimo " +
           "ORDER BY m.valor DESC")
    List<NFeMetric> findByEmpresaIdAndValorGreaterThan(
            @Param("empresaId") String empresaId,
            @Param("valorMinimo") Double valorMinimo);

    /**
     * Busca métricas por unidade
     */
    List<NFeMetric> findByUnidadeOrderByCreatedAtDesc(String unidade);

    /**
     * Busca métricas por empresa e unidade
     */
    List<NFeMetric> findByEmpresaIdAndUnidadeOrderByCreatedAtDesc(String empresaId, String unidade);

    /**
     * Busca métricas por tags (busca parcial)
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.tags LIKE CONCAT('%', :tag, '%') " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findByTagsContaining(@Param("tag") String tag);

    /**
     * Busca métricas por empresa e tags
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "AND m.tags LIKE CONCAT('%', :tag, '%') " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findByEmpresaIdAndTagsContaining(
            @Param("empresaId") String empresaId,
            @Param("tag") String tag);

    /**
     * Conta métricas por empresa
     */
    long countByEmpresaId(String empresaId);

    /**
     * Conta métricas por empresa e operação
     */
    long countByEmpresaIdAndOperacao(String empresaId, NFeOperacaoEnum operacao);

    /**
     * Conta métricas por operação
     */
    long countByOperacao(NFeOperacaoEnum operacao);

    /**
     * Conta métricas por nome da métrica
     */
    long countByNomeMetrica(String nomeMetrica);

    /**
     * Conta métricas por período
     */
    @Query("SELECT COUNT(m) FROM NFeMetric m WHERE m.createdAt BETWEEN :dataInicio AND :dataFim")
    long countByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca estatísticas por empresa
     */
    @Query("SELECT m.nomeMetrica, AVG(m.valor), MIN(m.valor), MAX(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "GROUP BY m.nomeMetrica " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findEstatisticasByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca estatísticas por operação
     */
    @Query("SELECT m.nomeMetrica, AVG(m.valor), MIN(m.valor), MAX(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.operacao = :operacao " +
           "GROUP BY m.nomeMetrica " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findEstatisticasByOperacao(@Param("operacao") NFeOperacaoEnum operacao);

    /**
     * Busca estatísticas por período
     */
    @Query("SELECT m.nomeMetrica, AVG(m.valor), MIN(m.valor), MAX(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY m.nomeMetrica " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findEstatisticasByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca estatísticas por empresa e período
     */
    @Query("SELECT m.nomeMetrica, AVG(m.valor), MIN(m.valor), MAX(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "AND m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY m.nomeMetrica " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findEstatisticasByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca estatísticas por operação e período
     */
    @Query("SELECT m.nomeMetrica, AVG(m.valor), MIN(m.valor), MAX(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.operacao = :operacao " +
           "AND m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY m.nomeMetrica " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findEstatisticasByOperacaoAndPeriodo(
            @Param("operacao") NFeOperacaoEnum operacao,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca métricas para dashboard
     */
    @Query("SELECT m.nomeMetrica, m.unidade, AVG(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.createdAt >= :dataInicio " +
           "GROUP BY m.nomeMetrica, m.unidade " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findParaDashboard(@Param("dataInicio") LocalDateTime dataInicio);

    /**
     * Busca métricas para dashboard por empresa
     */
    @Query("SELECT m.nomeMetrica, m.unidade, AVG(m.valor), COUNT(m) " +
           "FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "AND m.createdAt >= :dataInicio " +
           "GROUP BY m.nomeMetrica, m.unidade " +
           "ORDER BY AVG(m.valor) DESC")
    List<Object[]> findParaDashboardByEmpresaId(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio);

    /**
     * Busca métricas antigas para limpeza
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.createdAt < :dataLimite " +
           "ORDER BY m.createdAt ASC")
    List<NFeMetric> findAntigasParaLimpeza(@Param("dataLimite") LocalDateTime dataLimite);

    /**
     * Busca métricas para relatório
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findParaRelatorio(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca métricas para relatório por empresa
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.empresaId = :empresaId " +
           "AND m.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findParaRelatorioByEmpresaId(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca métricas para auditoria
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.createdAt >= :dataInicio " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findParaAuditoria(@Param("dataInicio") LocalDateTime dataInicio);

    /**
     * Busca métricas por valor nulo
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.valor IS NULL " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findByValorIsNull();

    /**
     * Busca métricas por valor zero
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.valor = 0 " +
           "ORDER BY m.createdAt DESC")
    List<NFeMetric> findByValorZero();

    /**
     * Busca métricas por valor negativo
     */
    @Query("SELECT m FROM NFeMetric m WHERE m.valor < 0 " +
           "ORDER BY m.valor ASC")
    List<NFeMetric> findByValorNegativo();
}


