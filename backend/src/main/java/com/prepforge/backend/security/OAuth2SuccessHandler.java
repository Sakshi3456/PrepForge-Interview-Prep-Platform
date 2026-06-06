package com.prepforge.backend.security;

import com.prepforge.backend.entity.User;
import com.prepforge.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepo;
    private final JwtUtil        jwtUtil;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User =
                (OAuth2User) authentication.getPrincipal();

        String email   = oAuth2User.getAttribute("email");
        String name    = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture = oAuth2User.getAttribute("picture");

        // Find or create user
        Optional<User> existingUser =
                userRepo.findByEmail(email.toLowerCase());

        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update Google info
            user.setGoogleId(googleId);
            user.setProfilePicture(picture);
            user.setEmailVerified(true);
            userRepo.save(user);
        } else {
            // Create new user from Google
            user = new User();
            user.setEmail(email.toLowerCase());
            user.setName(name);
            user.setGoogleId(googleId);
            user.setProfilePicture(picture);
            user.setAuthProvider("GOOGLE");
            user.setEmailVerified(true);
            user.setRole("USER");
            user.setPassword(""); // no password for Google users
            userRepo.save(user);
        }

        // Generate JWT
        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole());

        // Redirect to frontend with token
        String redirectUrl = frontendUrl
                + "/oauth2/callback"
                + "?token=" + token
                + "&userId=" + user.getId()
                + "&name=" + user.getName()
                + "&email=" + user.getEmail()
                + "&role=" + user.getRole();

        response.sendRedirect(redirectUrl);
    }
}