package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import ru.kata.spring.boot_security.demo.errors.UsernameNotUniqueException;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import javax.persistence.EntityNotFoundException;
import java.security.Principal;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String adminPage(Model model, Principal principal) {

        String email = principal.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        model.addAttribute("user", user);
        model.addAttribute("users", userService.findAll());
        model.addAttribute("allRoles", roleService.getListRoles());
        return "admin";
    }

    @PostMapping("/create")
    public String createUser(@ModelAttribute User user, Model model, Principal principal) {
        try {
            userService.save(user);
            return "redirect:/admin";
        } catch (UsernameNotUniqueException e) {
            model.addAttribute("error", e.getMessage());

            String email = principal.getName();
            User currentUser = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            model.addAttribute("user", currentUser);
            model.addAttribute("users", userService.findAll());
            model.addAttribute("allRoles", roleService.getListRoles());
            return "admin";
        }
    }

    @PostMapping("/edit")
    public String editUser(@ModelAttribute User user, Model model) {
        try {
            userService.update(user);
        } catch (UsernameNotUniqueException e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("users", userService.findAll());
            model.addAttribute("allRoles", roleService.getListRoles());
            return "admin";
        }
        return "redirect:/admin";
    }

    @GetMapping("/user")
    public String userPage(Model model, Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        model.addAttribute("user", user);
        return "user";
    }

    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return "redirect:/admin";
    }
}