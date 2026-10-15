package com.peopleflow.security;
import com.peopleflow.model.AppUser;
import com.peopleflow.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Locale;
@Configuration
public class BootstrapAdmin {
 @Bean ApplicationRunner firstAdmin(UserRepository users,PasswordEncoder encoder,
  @Value("${app.bootstrap.email:}") String email,@Value("${app.bootstrap.password:}") String password,
  @Value("${app.bootstrap.name:Administrator}") String name){
  return args->{
   if(users.count()!=0 || email.isBlank() || password.isBlank())return;
   if(!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")||email.length()>160||name.isBlank()||name.length()>100||password.length()<12||password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)
    throw new IllegalArgumentException("First admin: use a valid email, name (1-100 characters), and password (at least 12 characters, at most 72 UTF-8 bytes).");
   AppUser u=new AppUser();u.email=email.trim().toLowerCase(Locale.ROOT);u.name=name.trim();u.passwordHash=encoder.encode(password);u.role=AppUser.Role.ADMIN;users.saveAndFlush(u);
  };
 }
}
