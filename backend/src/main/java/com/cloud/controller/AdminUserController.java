package com.cloud.controller;

import com.cloud.service.UserAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.annotations.*;

@Api(tags = "Administration des utilisateurs")
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_MANAGER')")
public class AdminUserController {

    private final UserAdminService userAdminService;

    public AdminUserController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @ApiOperation("Débloquer un compte utilisateur")
    @ApiResponses({
        @ApiResponse(code = 200, message = "Compte débloqué"),
        @ApiResponse(code = 404, message = "Utilisateur introuvable"),
        @ApiResponse(code = 403, message = "Accès refusé")
    })
    @PutMapping("/{id}/unlock")
    public ResponseEntity<String> unlockUser(@PathVariable Long id) {
        userAdminService.unlockUser(id);
        return ResponseEntity.ok("User unlocked successfully");
    }

    @ApiOperation("Bloquer un compte utilisateur")
    @ApiResponses({
        @ApiResponse(code = 200, message = "Compte bloqué"),
        @ApiResponse(code = 404, message = "Utilisateur introuvable"),
        @ApiResponse(code = 403, message = "Accès refusé")
    })
    @PutMapping("/{id}/lock")
    public ResponseEntity<String> lockUser(@PathVariable Long id) {
        userAdminService.lockUser(id);
        return ResponseEntity.ok("User locked successfully");
    }
}
