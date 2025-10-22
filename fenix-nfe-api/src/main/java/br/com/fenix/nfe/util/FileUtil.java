package br.com.fenix.nfe.util;

import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Utilitários para manipulação de arquivos
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
public class FileUtil {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Lê conteúdo de arquivo como string
     */
    public static String readFileAsString(String filePath) {
        try {
            return Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Erro ao ler arquivo '{}': {}", filePath, e.getMessage());
            return null;
        }
    }

    /**
     * Lê conteúdo de arquivo como bytes
     */
    public static byte[] readFileAsBytes(String filePath) {
        try {
            return Files.readAllBytes(Paths.get(filePath));
        } catch (IOException e) {
            log.error("Erro ao ler arquivo '{}': {}", filePath, e.getMessage());
            return null;
        }
    }

    /**
     * Escreve string em arquivo
     */
    public static boolean writeStringToFile(String content, String filePath) {
        try {
            Files.write(Paths.get(filePath), content.getBytes(StandardCharsets.UTF_8));
            return true;
        } catch (IOException e) {
            log.error("Erro ao escrever arquivo '{}': {}", filePath, e.getMessage());
            return false;
        }
    }

    /**
     * Escreve bytes em arquivo
     */
    public static boolean writeBytesToFile(byte[] content, String filePath) {
        try {
            Files.write(Paths.get(filePath), content);
            return true;
        } catch (IOException e) {
            log.error("Erro ao escrever arquivo '{}': {}", filePath, e.getMessage());
            return false;
        }
    }

    /**
     * Verifica se arquivo existe
     */
    public static boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    /**
     * Verifica se diretório existe
     */
    public static boolean directoryExists(String dirPath) {
        return Files.exists(Paths.get(dirPath)) && Files.isDirectory(Paths.get(dirPath));
    }

    /**
     * Cria diretório se não existir
     */
    public static boolean createDirectoryIfNotExists(String dirPath) {
        try {
            Path path = Paths.get(dirPath);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.debug("Diretório criado: {}", dirPath);
            }
            return true;
        } catch (IOException e) {
            log.error("Erro ao criar diretório '{}': {}", dirPath, e.getMessage());
            return false;
        }
    }

    /**
     * Obtém tamanho do arquivo em bytes
     */
    public static long getFileSize(String filePath) {
        try {
            return Files.size(Paths.get(filePath));
        } catch (IOException e) {
            log.error("Erro ao obter tamanho do arquivo '{}': {}", filePath, e.getMessage());
            return -1;
        }
    }

    /**
     * Obtém extensão do arquivo
     */
    public static String getFileExtension(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }
        
        int lastDotIndex = filePath.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filePath.length() - 1) {
            return "";
        }
        
        return filePath.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * Obtém nome do arquivo sem extensão
     */
    public static String getFileNameWithoutExtension(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }
        
        String fileName = Paths.get(filePath).getFileName().toString();
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return fileName;
        }
        
        return fileName.substring(0, lastDotIndex);
    }

    /**
     * Obtém nome do arquivo com extensão
     */
    public static String getFileName(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }
        
        return Paths.get(filePath).getFileName().toString();
    }

    /**
     * Lista arquivos em diretório
     */
    public static List<String> listFiles(String dirPath) {
        List<String> files = new ArrayList<>();
        try {
            Files.walk(Paths.get(dirPath))
                    .filter(Files::isRegularFile)
                    .forEach(path -> files.add(path.toString()));
        } catch (IOException e) {
            log.error("Erro ao listar arquivos em '{}': {}", dirPath, e.getMessage());
        }
        return files;
    }

    /**
     * Lista arquivos em diretório com extensão específica
     */
    public static List<String> listFilesByExtension(String dirPath, String extension) {
        List<String> files = new ArrayList<>();
        try {
            Files.walk(Paths.get(dirPath))
                    .filter(Files::isRegularFile)
                    .filter(path -> getFileExtension(path.toString()).equals(extension.toLowerCase()))
                    .forEach(path -> files.add(path.toString()));
        } catch (IOException e) {
            log.error("Erro ao listar arquivos com extensão '{}' em '{}': {}", extension, dirPath, e.getMessage());
        }
        return files;
    }

    /**
     * Move arquivo
     */
    public static boolean moveFile(String sourcePath, String targetPath) {
        try {
            Files.move(Paths.get(sourcePath), Paths.get(targetPath), StandardCopyOption.REPLACE_EXISTING);
            return true;
        } catch (IOException e) {
            log.error("Erro ao mover arquivo de '{}' para '{}': {}", sourcePath, targetPath, e.getMessage());
            return false;
        }
    }

    /**
     * Copia arquivo
     */
    public static boolean copyFile(String sourcePath, String targetPath) {
        try {
            Files.copy(Paths.get(sourcePath), Paths.get(targetPath), StandardCopyOption.REPLACE_EXISTING);
            return true;
        } catch (IOException e) {
            log.error("Erro ao copiar arquivo de '{}' para '{}': {}", sourcePath, targetPath, e.getMessage());
            return false;
        }
    }

    /**
     * Deleta arquivo
     */
    public static boolean deleteFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
            return true;
        } catch (IOException e) {
            log.error("Erro ao deletar arquivo '{}': {}", filePath, e.getMessage());
            return false;
        }
    }

    /**
     * Deleta diretório e todo seu conteúdo
     */
    public static boolean deleteDirectory(String dirPath) {
        try {
            Files.walkFileTree(Paths.get(dirPath), new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.delete(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
            return true;
        } catch (IOException e) {
            log.error("Erro ao deletar diretório '{}': {}", dirPath, e.getMessage());
            return false;
        }
    }

    /**
     * Cria backup de arquivo com timestamp
     */
    public static String createBackup(String filePath) {
        if (!fileExists(filePath)) {
            return null;
        }
        
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String extension = getFileExtension(filePath);
        String fileNameWithoutExt = getFileNameWithoutExtension(filePath);
        String backupPath = fileNameWithoutExt + "_backup_" + timestamp + "." + extension;
        
        if (copyFile(filePath, backupPath)) {
            return backupPath;
        }
        
        return null;
    }

    /**
     * Compacta arquivo em ZIP
     */
    public static boolean zipFile(String filePath, String zipPath) {
        try (ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(zipPath));
             FileInputStream fileIn = new FileInputStream(filePath)) {
            
            ZipEntry zipEntry = new ZipEntry(getFileName(filePath));
            zipOut.putNextEntry(zipEntry);
            
            byte[] buffer = new byte[1024];
            int length;
            while ((length = fileIn.read(buffer)) > 0) {
                zipOut.write(buffer, 0, length);
            }
            
            zipOut.closeEntry();
            return true;
        } catch (IOException e) {
            log.error("Erro ao compactar arquivo '{}' para '{}': {}", filePath, zipPath, e.getMessage());
            return false;
        }
    }

    /**
     * Descompacta arquivo ZIP
     */
    public static boolean unzipFile(String zipPath, String extractPath) {
        try (ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipPath))) {
            createDirectoryIfNotExists(extractPath);
            
            ZipEntry entry = zipIn.getNextEntry();
            while (entry != null) {
                String filePath = extractPath + File.separator + entry.getName();
                
                if (!entry.isDirectory()) {
                    try (FileOutputStream fos = new FileOutputStream(filePath)) {
                        byte[] buffer = new byte[1024];
                        int length;
                        while ((length = zipIn.read(buffer)) > 0) {
                            fos.write(buffer, 0, length);
                        }
                    }
                } else {
                    createDirectoryIfNotExists(filePath);
                }
                
                zipIn.closeEntry();
                entry = zipIn.getNextEntry();
            }
            
            return true;
        } catch (IOException e) {
            log.error("Erro ao descompactar arquivo '{}' para '{}': {}", zipPath, extractPath, e.getMessage());
            return false;
        }
    }

    /**
     * Obtém informações do arquivo
     */
    public static FileInfo getFileInfo(String filePath) {
        try {
            Path path = Paths.get(filePath);
            BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
            
            return FileInfo.builder()
                    .name(getFileName(filePath))
                    .size(attrs.size())
                    .isDirectory(attrs.isDirectory())
                    .isRegularFile(attrs.isRegularFile())
                    .creationTime(attrs.creationTime().toInstant())
                    .lastModifiedTime(attrs.lastModifiedTime().toInstant())
                    .lastAccessTime(attrs.lastAccessTime().toInstant())
                    .build();
        } catch (IOException e) {
            log.error("Erro ao obter informações do arquivo '{}': {}", filePath, e.getMessage());
            return null;
        }
    }

    /**
     * Classe para informações do arquivo
     */
    @lombok.Builder
    @lombok.Data
    public static class FileInfo {
        private String name;
        private long size;
        private boolean isDirectory;
        private boolean isRegularFile;
        private java.time.Instant creationTime;
        private java.time.Instant lastModifiedTime;
        private java.time.Instant lastAccessTime;
    }
}
