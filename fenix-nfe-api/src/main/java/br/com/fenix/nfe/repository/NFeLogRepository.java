package br.com.fenix.nfe.repository;

import br.com.fenix.nfe.model.entity.NFeLog;
import br.com.fenix.nfe.model.enums.NFeOperacaoEnum;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
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
 * Repositório para operações de NFeLog
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Repository
public interface NFeLogRepository extends JpaRepository<NFeLog, UUID> {

    /**
     * Busca logs por NFe Status ID
     */
    List<NFeLog> findByNfeStatusIdOrderByCreatedAtDesc(UUID nfeStatusId);

    /**
     * Busca logs por empresa
     */
    Page<NFeLog> findByEmpresaIdOrderByCreatedAtDesc(String empresaId, Pageable pageable);

    /**
     * Busca logs por empresa e operação
     */
    Page<NFeLog> findByEmpresaIdAndOperacaoOrderByCreatedAtDesc(
            String empresaId, NFeOperacaoEnum operacao, Pageable pageable);

    /**
     * Busca logs por empresa e status
     */
    Page<NFeLog> findByEmpresaIdAndStatusOrderByCreatedAtDesc(
            String empresaId, NFeStatusEnum status, Pageable pageable);

    /**
     * Busca logs por empresa e período
     */
    @Query("SELECT l FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY l.createdAt DESC")
    Page<NFeLog> findByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca logs por operação
     */
    Page<NFeLog> findByOperacaoOrderByCreatedAtDesc(NFeOperacaoEnum operacao, Pageable pageable);

    /**
     * Busca logs por status
     */
    Page<NFeLog> findByStatusOrderByCreatedAtDesc(NFeStatusEnum status, Pageable pageable);

    /**
     * Busca logs por período
     */
    @Query("SELECT l FROM NFeLog l WHERE l.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY l.createdAt DESC")
    Page<NFeLog> findByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca logs de sucesso por empresa
     */
    @Query("SELECT l FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.status = 'AUTORIZADA' " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findSucessoByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca logs de erro por empresa
     */
    @Query("SELECT l FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.status IN ('ERRO', 'REJEITADA') " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findErroByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca logs de erro por período
     */
    @Query("SELECT l FROM NFeLog l WHERE l.status IN ('ERRO', 'REJEITADA') " +
           "AND l.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findErroByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca logs por operação e status
     */
    @Query("SELECT l FROM NFeLog l WHERE l.operacao = :operacao " +
           "AND l.status = :status " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findByOperacaoAndStatus(
            @Param("operacao") NFeOperacaoEnum operacao,
            @Param("status") NFeStatusEnum status);

    /**
     * Busca logs por empresa, operação e status
     */
    @Query("SELECT l FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.operacao = :operacao " +
           "AND l.status = :status " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findByEmpresaIdAndOperacaoAndStatus(
            @Param("empresaId") String empresaId,
            @Param("operacao") NFeOperacaoEnum operacao,
            @Param("status") NFeStatusEnum status);

    /**
     * Busca logs com duração maior que X ms
     */
    @Query("SELECT l FROM NFeLog l WHERE l.duracaoMs > :duracaoMinima " +
           "ORDER BY l.duracaoMs DESC")
    List<NFeLog> findComDuracaoMaiorQue(@Param("duracaoMinima") Integer duracaoMinima);

    /**
     * Busca logs com duração maior que X ms por empresa
     */
    @Query("SELECT l FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.duracaoMs > :duracaoMinima " +
           "ORDER BY l.duracaoMs DESC")
    List<NFeLog> findComDuracaoMaiorQueByEmpresaId(
            @Param("empresaId") String empresaId,
            @Param("duracaoMinima") Integer duracaoMinima);

    /**
     * Busca logs por mensagem (busca parcial)
     */
    @Query("SELECT l FROM NFeLog l WHERE LOWER(l.mensagem) LIKE LOWER(CONCAT('%', :mensagem, '%')) " +
           "ORDER BY l.createdAt DESC")
    Page<NFeLog> findByMensagemContainingIgnoreCase(
            @Param("mensagem") String mensagem, Pageable pageable);

    /**
     * Busca logs por empresa e mensagem
     */
    @Query("SELECT l FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND LOWER(l.mensagem) LIKE LOWER(CONCAT('%', :mensagem, '%')) " +
           "ORDER BY l.createdAt DESC")
    Page<NFeLog> findByEmpresaIdAndMensagemContainingIgnoreCase(
            @Param("empresaId") String empresaId,
            @Param("mensagem") String mensagem,
            Pageable pageable);

    /**
     * Conta logs por empresa
     */
    long countByEmpresaId(String empresaId);

    /**
     * Conta logs por empresa e operação
     */
    long countByEmpresaIdAndOperacao(String empresaId, NFeOperacaoEnum operacao);

    /**
     * Conta logs por empresa e status
     */
    long countByEmpresaIdAndStatus(String empresaId, NFeStatusEnum status);

    /**
     * Conta logs por operação
     */
    long countByOperacao(NFeOperacaoEnum operacao);

    /**
     * Conta logs por status
     */
    long countByStatus(NFeStatusEnum status);

    /**
     * Conta logs por período
     */
    @Query("SELECT COUNT(l) FROM NFeLog l WHERE l.createdAt BETWEEN :dataInicio AND :dataFim")
    long countByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Conta logs de sucesso por empresa
     */
    @Query("SELECT COUNT(l) FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.status = 'AUTORIZADA'")
    long countSucessoByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Conta logs de erro por empresa
     */
    @Query("SELECT COUNT(l) FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.status IN ('ERRO', 'REJEITADA')")
    long countErroByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca estatísticas por empresa
     */
    @Query("SELECT l.operacao, l.status, COUNT(l) FROM NFeLog l " +
           "WHERE l.empresaId = :empresaId " +
           "GROUP BY l.operacao, l.status " +
           "ORDER BY l.operacao, l.status")
    List<Object[]> findEstatisticasByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca estatísticas por período
     */
    @Query("SELECT l.operacao, l.status, COUNT(l) FROM NFeLog l " +
           "WHERE l.createdAt BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY l.operacao, l.status " +
           "ORDER BY l.operacao, l.status")
    List<Object[]> findEstatisticasByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca estatísticas de performance por empresa
     */
    @Query("SELECT l.operacao, AVG(l.duracaoMs), MIN(l.duracaoMs), MAX(l.duracaoMs), COUNT(l) " +
           "FROM NFeLog l WHERE l.empresaId = :empresaId " +
           "AND l.duracaoMs IS NOT NULL " +
           "GROUP BY l.operacao " +
           "ORDER BY AVG(l.duracaoMs) DESC")
    List<Object[]> findEstatisticasPerformanceByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca logs antigos para limpeza
     */
    @Query("SELECT l FROM NFeLog l WHERE l.createdAt < :dataLimite " +
           "ORDER BY l.createdAt ASC")
    List<NFeLog> findAntigosParaLimpeza(@Param("dataLimite") LocalDateTime dataLimite);

    /**
     * Busca logs por correlação ID
     */
    @Query("SELECT l FROM NFeLog l WHERE l.detalhes LIKE CONCAT('%', :correlationId, '%') " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findByCorrelationId(@Param("correlationId") String correlationId);

    /**
     * Busca logs para auditoria
     */
    @Query("SELECT l FROM NFeLog l WHERE l.createdAt >= :dataInicio " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findParaAuditoria(@Param("dataInicio") LocalDateTime dataInicio);

    /**
     * Busca logs para relatório de erros
     */
    @Query("SELECT l FROM NFeLog l WHERE l.status IN ('ERRO', 'REJEITADA') " +
           "AND l.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY l.createdAt DESC")
    List<NFeLog> findParaRelatorioErros(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca logs para relatório de performance
     */
    @Query("SELECT l FROM NFeLog l WHERE l.duracaoMs IS NOT NULL " +
           "AND l.createdAt BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY l.duracaoMs DESC")
    List<NFeLog> findParaRelatorioPerformance(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);
}


