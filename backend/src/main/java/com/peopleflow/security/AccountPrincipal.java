package com.peopleflow.security;
import com.peopleflow.model.AppUser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import java.util.List;
public class AccountPrincipal extends User {
 public final Long id;
 public final long version;
 public AccountPrincipal(AppUser u) {
  super(u.email,u.passwordHash,u.enabled,true,true,true,List.of(new SimpleGrantedAuthority("ROLE_"+u.role.name())));
  id=u.id;version=u.authVersion;
 }
}
