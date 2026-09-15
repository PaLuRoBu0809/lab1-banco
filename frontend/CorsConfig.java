package com.udea.lab12026p.config; // <-- cámbialo por el paquete de tu proyecto (ej: com.udea.banco2025.config)

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173") // puerto del frontend (Vite)
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
