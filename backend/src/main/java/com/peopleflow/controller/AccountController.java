package com.peopleflow.controller;
import com.peopleflow.model.AppUser;
import com.peopleflow.repository.UserRepository;
import com.peopleflow.security.AccountPrincipal;
import com.peopleflow.exception.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;
@RestController @RequestMapping("/api")
public class AccountController {
 private final UserRepository users;private final PasswordEncoder encoder;
 public AccountController(UserRepository users,PasswordEncoder encoder){this.users=users;this.encoder=encoder;}
 public record UserView(Long id,String name,String email,AppUser.Role role,boolean enabled,Instant createdAt){
  static UserView of(AppUser u){return new UserView(u.id,u.name,u.email,u.role,u.enabled,u.createdAt);}
 }
 public record CreateUser(@NotBlank @Size(max=100) String name,@NotBlank @Email @Size(max=160) String email,
  @NotBlank @Size(min=12,max=72) String password,@NotNull AppUser.Role role){}
 public record ChangePassword(@NotBlank String currentPassword,@NotBlank @Size(min=12,max=72) String newPassword){}
 public record ResetPassword(@NotBlank @Size(min=12,max=72) String password){}
 public record AccountStatus(@NotNull Boolean enabled){}
 @GetMapping("/auth/csrf") public Map<String,String> csrf(CsrfToken token){return Map.of("token",token.getToken(),"headerName",token.getHeaderName());}
 @GetMapping("/auth/me") public UserView me(@AuthenticationPrincipal AccountPrincipal principal){return UserView.of(find(principal.id));}
 @GetMapping("/admin/users") public List<UserView> list(){return users.findAll(org.springframework.data.domain.Sort.by("id").descending()).stream().map(UserView::of).toList();}
 @PostMapping("/admin/users") @ResponseStatus(HttpStatus.CREATED) @Transactional
 public UserView create(@Valid @RequestBody CreateUser input){
  String email=input.email().trim().toLowerCase(Locale.ROOT);
  if(users.existsByEmailIgnoreCase(email))throw new ApiException(HttpStatus.CONFLICT,"An account with this email already exists.");
  checkPassword(input.password());
  AppUser u=new AppUser();u.name=input.name().trim();u.email=email;u.passwordHash=encoder.encode(input.password());u.role=input.role();
  return UserView.of(users.saveAndFlush(u));
 }
 @PatchMapping("/admin/users/{id}/status") @Transactional
 public UserView status(@PathVariable Long id,@Valid @RequestBody AccountStatus input,@AuthenticationPrincipal AccountPrincipal principal){
  List<AppUser> all=users.lockUsers();
  AppUser u=all.stream().filter(x->x.id.equals(id)).findFirst().orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Account not found."));
  if(id.equals(principal.id))throw new ApiException(HttpStatus.BAD_REQUEST,"You cannot deactivate your own account.");
  if(!input.enabled()&&u.enabled&&u.role==AppUser.Role.ADMIN&&all.stream().filter(x->x.enabled&&x.role==AppUser.Role.ADMIN).count()<=1)
   throw new ApiException(HttpStatus.BAD_REQUEST,"Keep at least one active administrator.");
  if(u.enabled!=input.enabled()){u.enabled=input.enabled();u.authVersion++;}
  return UserView.of(users.save(u));
 }
 @PostMapping("/auth/password") @Transactional
 public Map<String,String> password(@Valid @RequestBody ChangePassword input,@AuthenticationPrincipal AccountPrincipal principal,jakarta.servlet.http.HttpServletRequest request){
  AppUser u=find(principal.id);
  if(!encoder.matches(input.currentPassword(),u.passwordHash))throw new ApiException(HttpStatus.BAD_REQUEST,"Your current password is incorrect.");
  checkPassword(input.newPassword());u.passwordHash=encoder.encode(input.newPassword());u.authVersion++;users.save(u);
  var session=request.getSession(false);if(session!=null)session.invalidate();
  org.springframework.security.core.context.SecurityContextHolder.clearContext();
  return Map.of("message","Password updated. Sign in again with your new password.");
 }
 @PostMapping("/admin/users/{id}/password") @Transactional
 public Map<String,String> resetPassword(@PathVariable Long id,@Valid @RequestBody ResetPassword input,@AuthenticationPrincipal AccountPrincipal principal){
  if(id.equals(principal.id))throw new ApiException(HttpStatus.BAD_REQUEST,"Use Change password for your own account.");
  checkPassword(input.password());AppUser u=find(id);u.passwordHash=encoder.encode(input.password());u.authVersion++;users.save(u);
  return Map.of("message","Password reset. Existing sessions have been revoked.");
 }
 private AppUser find(Long id){return users.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Account not found."));}
 private void checkPassword(String value){if(value.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw new ApiException(HttpStatus.BAD_REQUEST,"Password must be at most 72 UTF-8 bytes.");}
}
