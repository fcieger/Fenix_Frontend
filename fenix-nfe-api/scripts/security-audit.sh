#!/bin/bash

# Script de auditoria de segurança para Fenix NFe API
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

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
    ((WARNING_CHECKS++))
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
    ((FAILED_CHECKS++))
}

# Função para executar verificação
run_check() {
    local check_name="$1"
    local check_command="$2"
    local severity="${3:-error}"
    
    ((TOTAL_CHECKS++))
    log "Verificando: $check_name"
    
    if eval "$check_command" &> /dev/null; then
        log_success "$check_name"
        return 0
    else
        if [ "$severity" = "warning" ]; then
            log_warning "$check_name"
        else
            log_error "$check_name"
        fi
        return 1
    fi
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
    
    # Verificar trivy
    if ! command -v trivy &> /dev/null; then
        log_warning "trivy não está instalado (recomendado para scan de vulnerabilidades)"
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

# Função para verificar namespace
check_namespace() {
    log "Verificando namespace..."
    
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_error "Namespace $NAMESPACE não existe!"
        exit 1
    fi
    
    log_success "Namespace $NAMESPACE existe!"
}

# Função para verificar HTTPS
check_https() {
    log "Verificando HTTPS..."
    
    # Verificar se a API suporta HTTPS
    if curl -f -s "https://$API_URL/health" &> /dev/null; then
        log_success "HTTPS funcionando"
    else
        log_error "HTTPS não está funcionando"
        return 1
    fi
    
    # Verificar se HTTP redireciona para HTTPS
    local http_response=$(curl -s -o /dev/null -w "%{http_code}" "http://$API_URL/health")
    if [ "$http_response" = "301" ] || [ "$http_response" = "302" ]; then
        log_success "HTTP redireciona para HTTPS"
    else
        log_warning "HTTP não redireciona para HTTPS"
    fi
}

# Função para verificar headers de segurança
check_security_headers() {
    log "Verificando headers de segurança..."
    
    local headers=$(curl -s -I "https://$API_URL/health")
    
    # Verificar X-Frame-Options
    if echo "$headers" | grep -i "x-frame-options" &> /dev/null; then
        log_success "X-Frame-Options presente"
    else
        log_warning "X-Frame-Options ausente"
    fi
    
    # Verificar X-Content-Type-Options
    if echo "$headers" | grep -i "x-content-type-options" &> /dev/null; then
        log_success "X-Content-Type-Options presente"
    else
        log_warning "X-Content-Type-Options ausente"
    fi
    
    # Verificar X-XSS-Protection
    if echo "$headers" | grep -i "x-xss-protection" &> /dev/null; then
        log_success "X-XSS-Protection presente"
    else
        log_warning "X-XSS-Protection ausente"
    fi
    
    # Verificar Strict-Transport-Security
    if echo "$headers" | grep -i "strict-transport-security" &> /dev/null; then
        log_success "Strict-Transport-Security presente"
    else
        log_warning "Strict-Transport-Security ausente"
    fi
    
    # Verificar Content-Security-Policy
    if echo "$headers" | grep -i "content-security-policy" &> /dev/null; then
        log_success "Content-Security-Policy presente"
    else
        log_warning "Content-Security-Policy ausente"
    fi
}

# Função para verificar CORS
check_cors() {
    log "Verificando CORS..."
    
    local cors_headers=$(curl -s -I -H "Origin: https://example.com" "https://$API_URL/health" | grep -i "access-control-allow-origin")
    
    if [ -n "$cors_headers" ]; then
        log_success "CORS configurado"
    else
        log_warning "CORS não configurado"
    fi
}

# Função para verificar autenticação
check_authentication() {
    log "Verificando autenticação..."
    
    # Verificar se endpoints protegidos requerem autenticação
    local protected_response=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_URL/api/nfe/emitir")
    if [ "$protected_response" = "401" ] || [ "$protected_response" = "403" ]; then
        log_success "Endpoints protegidos requerem autenticação"
    else
        log_error "Endpoints protegidos não requerem autenticação"
    fi
    
    # Verificar se health check não requer autenticação
    local health_response=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_URL/health")
    if [ "$health_response" = "200" ]; then
        log_success "Health check não requer autenticação"
    else
        log_warning "Health check requer autenticação"
    fi
}

# Função para verificar autorização
check_authorization() {
    log "Verificando autorização..."
    
    # Verificar se há controle de acesso baseado em roles
    local auth_response=$(curl -s "https://$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username": "test@fenix.com.br", "password": "test123"}')
    
    local roles=$(echo "$auth_response" | jq -r '.data.roles // empty')
    if [ -n "$roles" ] && [ "$roles" != "null" ]; then
        log_success "Sistema de roles implementado"
    else
        log_warning "Sistema de roles não implementado"
    fi
}

# Função para verificar rate limiting
check_rate_limiting() {
    log "Verificando rate limiting..."
    
    # Fazer múltiplas requisições para testar rate limiting
    local rate_limit_headers=""
    for i in {1..10}; do
        rate_limit_headers=$(curl -s -I "https://$API_URL/health" | grep -i "x-rate-limit")
        if [ -n "$rate_limit_headers" ]; then
            break
        fi
        sleep 0.1
    done
    
    if [ -n "$rate_limit_headers" ]; then
        log_success "Rate limiting configurado"
    else
        log_warning "Rate limiting não configurado"
    fi
}

# Função para verificar validação de entrada
check_input_validation() {
    log "Verificando validação de entrada..."
    
    # Testar SQL injection
    local sql_test=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_URL/api/nfe/consulta/numero/1'; DROP TABLE nfe_status; --")
    if [ "$sql_test" = "400" ] || [ "$sql_test" = "422" ]; then
        log_success "Proteção contra SQL injection"
    else
        log_warning "Possível vulnerabilidade a SQL injection"
    fi
    
    # Testar XSS
    local xss_test=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_URL/api/nfe/consulta/numero/<script>alert('xss')</script>")
    if [ "$xss_test" = "400" ] || [ "$xss_test" = "422" ]; then
        log_success "Proteção contra XSS"
    else
        log_warning "Possível vulnerabilidade a XSS"
    fi
}

# Função para verificar logs de segurança
check_security_logs() {
    log "Verificando logs de segurança..."
    
    # Verificar se há logs de tentativas de login
    local pods=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $pods; do
        local auth_logs=$(kubectl logs $pod -n $NAMESPACE --since=1h | grep -i "auth\|login\|security" | wc -l)
        
        if [ $auth_logs -gt 0 ]; then
            log_success "Logs de segurança encontrados no pod $pod"
        else
            log_warning "Nenhum log de segurança encontrado no pod $pod"
        fi
    done
}

# Função para verificar certificados
check_certificates() {
    log "Verificando certificados..."
    
    # Verificar se há certificados configurados
    local cert_secret=$(kubectl get secret -n $NAMESPACE | grep certificate)
    
    if [ -n "$cert_secret" ]; then
        log_success "Certificados configurados"
    else
        log_error "Certificados não configurados"
    fi
    
    # Verificar validade do certificado SSL
    local cert_info=$(echo | openssl s_client -servername $API_URL -connect $API_URL:443 2>/dev/null | openssl x509 -noout -dates)
    
    if [ -n "$cert_info" ]; then
        local not_after=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        local expiry_date=$(date -d "$not_after" +%s)
        local current_date=$(date +%s)
        local days_until_expiry=$(( (expiry_date - current_date) / 86400 ))
        
        if [ $days_until_expiry -gt 30 ]; then
            log_success "Certificado SSL válido por $days_until_expiry dias"
        else
            log_warning "Certificado SSL expira em $days_until_expiry dias"
        fi
    else
        log_warning "Não foi possível verificar certificado SSL"
    fi
}

# Função para verificar configurações de rede
check_network_security() {
    log "Verificando configurações de rede..."
    
    # Verificar NetworkPolicy
    local network_policies=$(kubectl get networkpolicy -n $NAMESPACE | wc -l)
    
    if [ $network_policies -gt 1 ]; then
        log_success "NetworkPolicy configurada"
    else
        log_warning "NetworkPolicy não configurada"
    fi
    
    # Verificar se há pods com privilégios
    local privileged_pods=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[?(@.spec.containers[0].securityContext.privileged==true)].metadata.name}')
    
    if [ -z "$privileged_pods" ]; then
        log_success "Nenhum pod com privilégios"
    else
        log_error "Pods com privilégios encontrados: $privileged_pods"
    fi
}

# Função para verificar secrets
check_secrets() {
    log "Verificando secrets..."
    
    # Verificar se secrets estão configurados
    local secrets=$(kubectl get secrets -n $NAMESPACE | wc -l)
    
    if [ $secrets -gt 3 ]; then
        log_success "Secrets configurados"
    else
        log_warning "Poucos secrets configurados"
    fi
    
    # Verificar se secrets não estão em plain text
    local plain_text_secrets=$(kubectl get secrets -n $NAMESPACE -o yaml | grep -i "password\|secret\|key" | grep -v "name:" | wc -l)
    
    if [ $plain_text_secrets -eq 0 ]; then
        log_success "Secrets não estão em plain text"
    else
        log_warning "Possíveis secrets em plain text"
    fi
}

# Função para verificar RBAC
check_rbac() {
    log "Verificando RBAC..."
    
    # Verificar se há ServiceAccount
    local service_accounts=$(kubectl get serviceaccount -n $NAMESPACE | wc -l)
    
    if [ $service_accounts -gt 1 ]; then
        log_success "ServiceAccount configurado"
    else
        log_warning "ServiceAccount não configurado"
    fi
    
    # Verificar se há Role/RoleBinding
    local roles=$(kubectl get role -n $NAMESPACE | wc -l)
    local role_bindings=$(kubectl get rolebinding -n $NAMESPACE | wc -l)
    
    if [ $roles -gt 0 ] && [ $role_bindings -gt 0 ]; then
        log_success "RBAC configurado"
    else
        log_warning "RBAC não configurado"
    fi
}

# Função para verificar vulnerabilidades
check_vulnerabilities() {
    log "Verificando vulnerabilidades..."
    
    if command -v trivy &> /dev/null; then
        # Verificar vulnerabilidades nas imagens
        local images=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort -u)
        
        for image in $images; do
            log "Verificando vulnerabilidades na imagem: $image"
            
            local vuln_count=$(trivy image --severity HIGH,CRITICAL --format json "$image" | jq '.Results[].Vulnerabilities | length' | paste -sd+ | bc)
            
            if [ -z "$vuln_count" ] || [ "$vuln_count" -eq 0 ]; then
                log_success "Nenhuma vulnerabilidade crítica encontrada em $image"
            else
                log_error "$vuln_count vulnerabilidades críticas encontradas em $image"
            fi
        done
    else
        log_warning "Trivy não instalado - pulando verificação de vulnerabilidades"
    fi
}

# Função para verificar compliance
check_compliance() {
    log "Verificando compliance..."
    
    # Verificar se há políticas de compliance
    local compliance_policies=$(kubectl get podsecuritypolicy -n $NAMESPACE | wc -l)
    
    if [ $compliance_policies -gt 0 ]; then
        log_success "Políticas de compliance configuradas"
    else
        log_warning "Políticas de compliance não configuradas"
    fi
    
    # Verificar se há auditoria habilitada
    local audit_logs=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].spec.containers[*].env[?(@.name=="AUDIT_ENABLED")].value}')
    
    if [ -n "$audit_logs" ]; then
        log_success "Auditoria habilitada"
    else
        log_warning "Auditoria não habilitada"
    fi
}

# Função para gerar relatório
generate_report() {
    log "Gerando relatório de auditoria de segurança..."
    
    local report_file="$PROJECT_DIR/security-audit-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== RELATÓRIO DE AUDITORIA DE SEGURANÇA ==="
        echo "Data: $(date)"
        echo "Namespace: $NAMESPACE"
        echo "API URL: $API_URL"
        echo ""
        echo "=== RESUMO ==="
        echo "Total de verificações: $TOTAL_CHECKS"
        echo "Verificações aprovadas: $PASSED_CHECKS"
        echo "Verificações com aviso: $WARNING_CHECKS"
        echo "Verificações falharam: $FAILED_CHECKS"
        echo "Taxa de sucesso: $(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))%"
        echo ""
        echo "=== STATUS ==="
        if [ $FAILED_CHECKS -eq 0 ]; then
            echo "✅ AUDITORIA DE SEGURANÇA APROVADA"
        else
            echo "❌ AUDITORIA DE SEGURANÇA REPROVADA - CORRIGIR $FAILED_CHECKS PROBLEMA(S)"
        fi
        echo ""
        echo "=== RECOMENDAÇÕES ==="
        if [ $WARNING_CHECKS -gt 0 ]; then
            echo "⚠️  $WARNING_CHECKS aviso(s) encontrado(s) - revisar configurações"
        fi
        if [ $FAILED_CHECKS -gt 0 ]; then
            echo "❌ $FAILED_CHECKS problema(s) crítico(s) encontrado(s) - corrigir imediatamente"
        fi
        echo ""
        echo "=== PRÓXIMOS PASSOS ==="
        echo "1. Corrigir problemas críticos"
        echo "2. Revisar avisos"
        echo "3. Implementar recomendações"
        echo "4. Executar nova auditoria"
        echo "5. Documentar mudanças"
    } > "$report_file"
    
    log_success "Relatório salvo em: $report_file"
}

# Função para mostrar resumo
show_summary() {
    echo ""
    log "=== RESUMO DA AUDITORIA DE SEGURANÇA ==="
    echo "Total de verificações: $TOTAL_CHECKS"
    echo "Verificações aprovadas: $PASSED_CHECKS"
    echo "Verificações com aviso: $WARNING_CHECKS"
    echo "Verificações falharam: $FAILED_CHECKS"
    echo "Taxa de sucesso: $(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))%"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        log_success "AUDITORIA DE SEGURANÇA APROVADA!"
    else
        log_error "AUDITORIA DE SEGURANÇA REPROVADA - CORRIGIR $FAILED_CHECKS PROBLEMA(S)"
        exit 1
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  all         - Executa todas as verificações"
    echo "  basic       - Verificações básicas"
    echo "  network     - Verificações de rede"
    echo "  auth        - Verificações de autenticação"
    echo "  vuln        - Verificações de vulnerabilidades"
    echo "  compliance  - Verificações de compliance"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 all"
    echo "  $0 basic"
    echo "  $0 network"
}

# Função principal
main() {
    case "${1:-all}" in
        "all")
            check_dependencies
            check_connectivity
            check_namespace
            check_https
            check_security_headers
            check_cors
            check_authentication
            check_authorization
            check_rate_limiting
            check_input_validation
            check_security_logs
            check_certificates
            check_network_security
            check_secrets
            check_rbac
            check_vulnerabilities
            check_compliance
            generate_report
            show_summary
            ;;
        "basic")
            check_dependencies
            check_connectivity
            check_namespace
            check_https
            check_security_headers
            check_authentication
            show_summary
            ;;
        "network")
            check_dependencies
            check_connectivity
            check_namespace
            check_https
            check_cors
            check_network_security
            check_certificates
            show_summary
            ;;
        "auth")
            check_dependencies
            check_connectivity
            check_namespace
            check_authentication
            check_authorization
            check_rate_limiting
            check_input_validation
            check_security_logs
            show_summary
            ;;
        "vuln")
            check_dependencies
            check_connectivity
            check_namespace
            check_vulnerabilities
            check_secrets
            show_summary
            ;;
        "compliance")
            check_dependencies
            check_connectivity
            check_namespace
            check_rbac
            check_compliance
            show_summary
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
