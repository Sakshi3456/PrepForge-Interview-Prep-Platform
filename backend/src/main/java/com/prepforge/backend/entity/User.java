package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role = "USER";

    private String targetRole;  // Java Developer, Full Stack etc
    private String college;     // college name
    private String bio;         // short bio
    private String linkedinUrl; // linkedin profile
    private String githubUrl;

    private String  authProvider;
    private String  googleId;
    private String  profilePicture;
    private Boolean emailVerified = false;
    private String  verificationToken;
    private String  resetPasswordToken;
    private LocalDateTime resetTokenExpiry;
    private LocalDateTime createdAt = LocalDateTime.now();
}
