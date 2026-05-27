// dto/request/UpdateProfileRequest.java
package com.prepforge.backend.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String targetRole;
    private String college;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
}
