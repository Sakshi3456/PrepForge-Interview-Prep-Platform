package com.prepforge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String difficulty;
    private Integer readTime;

    @Column(name = "pdf_file_name")
    private String pdfFileName;

    @Column(name = "file_name")
    private String fileName;
    private String fileType; // PDF or CSV
}
