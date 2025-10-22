package br.com.fenix.nfe.util;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;

/**
 * Utilitários para manipulação de datas
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
public class DateUtil {

    // Formatters padrão
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    public static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    public static final DateTimeFormatter DATETIME_WITH_TIMEZONE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
    public static final DateTimeFormatter NFE_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss-03:00");
    
    // Timezone padrão do Brasil
    public static final ZoneId BRAZIL_TIMEZONE = ZoneId.of("America/Sao_Paulo");

    /**
     * Converte LocalDateTime para Date
     */
    public static Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return Date.from(localDateTime.atZone(BRAZIL_TIMEZONE).toInstant());
    }

    /**
     * Converte Date para LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(BRAZIL_TIMEZONE).toLocalDateTime();
    }

    /**
     * Converte LocalDateTime para ZonedDateTime (Brasil)
     */
    public static ZonedDateTime toZonedDateTime(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atZone(BRAZIL_TIMEZONE);
    }

    /**
     * Obtém data/hora atual do Brasil
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(BRAZIL_TIMEZONE);
    }

    /**
     * Obtém ZonedDateTime atual do Brasil
     */
    public static ZonedDateTime nowZoned() {
        return ZonedDateTime.now(BRAZIL_TIMEZONE);
    }

    /**
     * Formata LocalDateTime para string
     */
    public static String format(LocalDateTime dateTime, DateTimeFormatter formatter) {
        if (dateTime == null) {
            return null;
        }
        try {
            return dateTime.format(formatter);
        } catch (Exception e) {
            log.error("Erro ao formatar data: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Formata LocalDateTime para string com formato padrão
     */
    public static String format(LocalDateTime dateTime) {
        return format(dateTime, DATETIME_FORMATTER);
    }

    /**
     * Formata LocalDateTime para string com timezone
     */
    public static String formatWithTimezone(LocalDateTime dateTime) {
        return format(dateTime, DATETIME_WITH_TIMEZONE_FORMATTER);
    }

    /**
     * Formata LocalDateTime para string no formato NFe
     */
    public static String formatForNFe(LocalDateTime dateTime) {
        return format(dateTime, NFE_DATETIME_FORMATTER);
    }

    /**
     * Converte string para LocalDateTime
     */
    public static LocalDateTime parse(String dateTimeString, DateTimeFormatter formatter) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeString, formatter);
        } catch (DateTimeParseException e) {
            log.error("Erro ao fazer parse da data '{}': {}", dateTimeString, e.getMessage());
            return null;
        }
    }

    /**
     * Converte string para LocalDateTime com formato padrão
     */
    public static LocalDateTime parse(String dateTimeString) {
        return parse(dateTimeString, DATETIME_FORMATTER);
    }

    /**
     * Converte string para LocalDateTime com timezone
     */
    public static LocalDateTime parseWithTimezone(String dateTimeString) {
        return parse(dateTimeString, DATETIME_WITH_TIMEZONE_FORMATTER);
    }

    /**
     * Converte string para LocalDateTime no formato NFe
     */
    public static LocalDateTime parseFromNFe(String dateTimeString) {
        return parse(dateTimeString, NFE_DATETIME_FORMATTER);
    }

    /**
     * Valida se a string é uma data válida
     */
    public static boolean isValidDate(String dateString, DateTimeFormatter formatter) {
        try {
            LocalDateTime.parse(dateString, formatter);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    /**
     * Valida se a string é uma data válida com formato padrão
     */
    public static boolean isValidDate(String dateString) {
        return isValidDate(dateString, DATETIME_FORMATTER);
    }

    /**
     * Obtém timestamp atual em milissegundos
     */
    public static long currentTimestamp() {
        return System.currentTimeMillis();
    }

    /**
     * Obtém timestamp de uma LocalDateTime em milissegundos
     */
    public static long toTimestamp(LocalDateTime dateTime) {
        if (dateTime == null) {
            return 0;
        }
        return dateTime.atZone(BRAZIL_TIMEZONE).toInstant().toEpochMilli();
    }

    /**
     * Converte timestamp para LocalDateTime
     */
    public static LocalDateTime fromTimestamp(long timestamp) {
        return LocalDateTime.ofInstant(
            java.time.Instant.ofEpochMilli(timestamp), 
            BRAZIL_TIMEZONE
        );
    }

    /**
     * Adiciona dias a uma data
     */
    public static LocalDateTime addDays(LocalDateTime dateTime, long days) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusDays(days);
    }

    /**
     * Adiciona horas a uma data
     */
    public static LocalDateTime addHours(LocalDateTime dateTime, long hours) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusHours(hours);
    }

    /**
     * Adiciona minutos a uma data
     */
    public static LocalDateTime addMinutes(LocalDateTime dateTime, long minutes) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.plusMinutes(minutes);
    }

    /**
     * Calcula diferença em dias entre duas datas
     */
    public static long daysBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return 0;
        }
        return java.time.Duration.between(start, end).toDays();
    }

    /**
     * Calcula diferença em horas entre duas datas
     */
    public static long hoursBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return 0;
        }
        return java.time.Duration.between(start, end).toHours();
    }

    /**
     * Calcula diferença em minutos entre duas datas
     */
    public static long minutesBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return 0;
        }
        return java.time.Duration.between(start, end).toMinutes();
    }
}
