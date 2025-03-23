package ru.kata.spring.boot_security.demo.inits;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Проверяем, существуют ли роли
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            Role role = new Role("ROLE_ADMIN");
            return roleRepository.save(role);
        });

        Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role role = new Role("ROLE_USER");
            return roleRepository.save(role);
        });

        // Проверяем, существует ли администратор
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setFirstname("Admin");
            admin.setLastname("Adminov");
            admin.setAge(30);
            admin.setEmail("admin@example.com");
            admin.setRoles(Set.of(adminRole, userRole));
            userRepository.save(admin);
        }

        // Проверяем, существует ли обычный пользователь
        if (userRepository.findByEmail("user@example.com").isEmpty()) {
            User user = new User();
            user.setPassword(passwordEncoder.encode("user"));
            user.setFirstname("User");
            user.setLastname("Userov");
            user.setAge(25);
            user.setEmail("user@example.com");
            user.setRoles(Set.of(userRole));
            userRepository.save(user);
        }
    }
}