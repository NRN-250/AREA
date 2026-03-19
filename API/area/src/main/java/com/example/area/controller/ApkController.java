package com.example.area.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Controller for serving the mobile APK file.
 * The APK is expected to be in the /export-apk volume mounted by Docker.
 */
@RestController
public class ApkController {

    private static final Logger log = LoggerFactory.getLogger(ApkController.class);

    // Path where the APK is stored (shared Docker volume)
    private static final String APK_DIRECTORY = "/export-apk";
    private static final String APK_FILENAME = "area.apk";

    @GetMapping("/client.apk")
    public ResponseEntity<Resource> downloadApk() {
        try {
            Path apkPath = Paths.get(APK_DIRECTORY, APK_FILENAME);
            File apkFile = apkPath.toFile();

            if (!apkFile.exists()) {
                log.warn("APK file not found at: {}", apkPath);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(apkFile);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + APK_FILENAME + "\"")
                    .contentLength(apkFile.length())
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving APK file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/client.apk/status")
    public ResponseEntity<?> getApkStatus() {
        Path apkPath = Paths.get(APK_DIRECTORY, APK_FILENAME);
        File apkFile = apkPath.toFile();

        if (apkFile.exists()) {
            return ResponseEntity.ok(java.util.Map.of(
                    "available", true,
                    "filename", APK_FILENAME,
                    "size", apkFile.length()));
        } else {
            return ResponseEntity.ok(java.util.Map.of(
                    "available", false,
                    "message", "APK not yet built"));
        }
    }
}
