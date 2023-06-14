package com.phyoticGen.ChompClone.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TemplateController {
    
    @GetMapping("/templates/{template}")
    public ResponseEntity<String> emptyCart(@PathVariable("template") String templateName) {
        String res = getFileResourceString("templates/" + templateName);

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .body(res);
    }

    private String getFileResourceString(String path) {
        ClassPathResource resource = new ClassPathResource(path);
        
        try {
            String res = Files.readString(Path.of(resource.getURI()), StandardCharsets.UTF_8);
            return res;
        } catch (IOException error) {
            System.out.println("Could not retrieve file. " + error);
            return "Error";
        }
    }
}
