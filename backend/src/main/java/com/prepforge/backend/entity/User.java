package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

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
}
