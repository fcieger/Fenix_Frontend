package br.com.fenix.nfe.repository;

import br.com.fenix.nfe.model.entity.NFeStatus;
import br.com.fenix.nfe.model.enums.NFeStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de NFeStatus
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Repository
public interface NFeStatusRepository extends JpaRepository<NFeStatus, UUID> {

    /**
     * Busca NFe por chave de acesso
     */
    Optional<NFeStatus> findByChaveAcesso(String chaveAcesso);

    /**
     * Busca NFe por empresa e chave de acesso
     */
    Optional<NFeStatus> findByEmpresaIdAndChaveAcesso(String empresaId, String chaveAcesso);

    /**
     * Busca NFes por empresa
     */
    Page<NFeStatus> findByEmpresaId(String empresaId, Pageable pageable);

    /**
     * Busca NFes por empresa e status
     */
    Page<NFeStatus> findByEmpresaIdAndStatus(String empresaId, NFeStatusEnum status, Pageable pageable);

    /**
     * Busca NFes por empresa e período
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "AND n.dataEmissao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY n.dataEmissao DESC")
    Page<NFeStatus> findByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim,
            Pageable pageable);

    /**
     * Busca NFes por status
     */
    Page<NFeStatus> findByStatus(NFeStatusEnum status, Pageable pageable);

    /**
     * Busca NFes processando (para retry)
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.status = 'PROCESSANDO' " +
           "AND (n.proximaTentativa IS NULL OR n.proximaTentativa <= :agora) " +
           "ORDER BY n.createdAt ASC")
    List<NFeStatus> findProcessandoParaRetry(@Param("agora") LocalDateTime agora);

    /**
     * Busca NFes com erro para retry
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.status = 'ERRO' " +
           "AND n.tentativas < :maxTentativas " +
           "AND (n.proximaTentativa IS NULL OR n.proximaTentativa <= :agora) " +
           "ORDER BY n.createdAt ASC")
    List<NFeStatus> findErroParaRetry(
            @Param("maxTentativas") Integer maxTentativas,
            @Param("agora") LocalDateTime agora);

    /**
     * Busca NFes por empresa e número
     */
    Optional<NFeStatus> findByEmpresaIdAndNumeroNfeAndSerie(String empresaId, Integer numeroNfe, Integer serie);

    /**
     * Verifica se existe NFe com mesmo número e série
     */
    boolean existsByEmpresaIdAndNumeroNfeAndSerie(String empresaId, Integer numeroNfe, Integer serie);

    /**
     * Conta NFes por empresa e status
     */
    long countByEmpresaIdAndStatus(String empresaId, NFeStatusEnum status);

    /**
     * Conta NFes por empresa e período
     */
    @Query("SELECT COUNT(n) FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "AND n.dataEmissao BETWEEN :dataInicio AND :dataFim")
    long countByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca NFes autorizadas por empresa e período
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "AND n.status = 'AUTORIZADA' " +
           "AND n.dataAutorizacao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY n.dataAutorizacao DESC")
    List<NFeStatus> findAutorizadasByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca NFes rejeitadas por empresa e período
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "AND n.status = 'REJEITADA' " +
           "AND n.dataEmissao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY n.dataEmissao DESC")
    List<NFeStatus> findRejeitadasByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca NFes canceladas por empresa e período
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "AND n.status = 'CANCELADA' " +
           "AND n.dataCancelamento BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY n.dataCancelamento DESC")
    List<NFeStatus> findCanceladasByEmpresaIdAndPeriodo(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca NFes com maior número de tentativas
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.tentativas >= :minTentativas " +
           "ORDER BY n.tentativas DESC, n.createdAt ASC")
    List<NFeStatus> findComMaiorTentativas(@Param("minTentativas") Integer minTentativas);

    /**
     * Busca NFes antigas para limpeza
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.createdAt < :dataLimite " +
           "AND n.status IN ('AUTORIZADA', 'CANCELADA', 'INUTILIZADA') " +
           "ORDER BY n.createdAt ASC")
    List<NFeStatus> findAntigasParaLimpeza(@Param("dataLimite") LocalDateTime dataLimite);

    /**
     * Busca estatísticas por empresa
     */
    @Query("SELECT n.status, COUNT(n) FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "GROUP BY n.status")
    List<Object[]> findEstatisticasByEmpresaId(@Param("empresaId") String empresaId);

    /**
     * Busca estatísticas por período
     */
    @Query("SELECT n.status, COUNT(n) FROM NFeStatus n " +
           "WHERE n.dataEmissao BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY n.status")
    List<Object[]> findEstatisticasByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca NFes por protocolo
     */
    Optional<NFeStatus> findByProtocolo(String protocolo);

    /**
     * Verifica se existe NFe com mesmo protocolo
     */
    boolean existsByProtocolo(String protocolo);

    /**
     * Busca NFes por CNPJ do emitente (usando chave de acesso)
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.chaveAcesso LIKE :cnpj%")
    List<NFeStatus> findByCnpjEmitente(@Param("cnpj") String cnpj);

    /**
     * Busca NFes por CNPJ do emitente e período
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.chaveAcesso LIKE :cnpj% " +
           "AND n.dataEmissao BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY n.dataEmissao DESC")
    List<NFeStatus> findByCnpjEmitenteAndPeriodo(
            @Param("cnpj") String cnpj,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca NFes para relatório de performance
     */
    @Query("SELECT n FROM NFeStatus n WHERE n.empresaId = :empresaId " +
           "AND n.dataEmissao BETWEEN :dataInicio AND :dataFim " +
           "AND n.status IN ('AUTORIZADA', 'REJEITADA', 'ERRO') " +
           "ORDER BY n.dataEmissao DESC")
    List<NFeStatus> findParaRelatorioPerformance(
            @Param("empresaId") String empresaId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);
}


