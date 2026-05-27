package com.prepforge.backend.config;

import com.prepforge.backend.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOriginPatterns(List.of("http://localhost:*"));
                    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // 🔥 FIXED ORDER
                        .requestMatchers("/api/notes/pdf/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/notes/**").permitAll()
                        .requestMatchers("/api/notes/file/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/questions/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/aptitude/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/coding/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/quiz/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/mcq/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/mcq-sessions/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/mock/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/profile/**"  ).permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/progress/**" ).permitAll()

                        .requestMatchers("/api/bookmarks/**").authenticated()

                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        .requestMatchers("/api/notes/upload-pdf").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/notes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notes/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/questions/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/aptitude/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/aptitude/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}