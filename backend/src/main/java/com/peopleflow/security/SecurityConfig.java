package com.peopleflow.security;
import com.peopleflow.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Locale;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.filter.OncePerRequestFilter;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder(12);}
 @Bean UserDetailsService userDetailsService(UserRepository users){return email -> new AccountPrincipal(users.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT)).orElseThrow(()->new UsernameNotFoundException("Invalid credentials")));}
 @Bean SecurityFilterChain security(HttpSecurity http,UserRepository users) throws Exception {
  http.authorizeHttpRequests(a->a
   .requestMatchers("/api/auth/csrf","/api/auth/login","/api/health","/error").permitAll()
   .requestMatchers("/api/admin/**").hasRole("ADMIN")
   .requestMatchers(HttpMethod.GET,"/api/employees/**").hasAnyRole("ADMIN","STAFF")
   .requestMatchers("/api/employees/**").hasRole("ADMIN")
   .requestMatchers("/api/auth/me","/api/auth/password").authenticated()
   .anyRequest().denyAll())
   .requestCache(c->c.disable())
   .formLogin(f->f.loginProcessingUrl("/api/auth/login").usernameParameter("email")
    .successHandler((req,res,auth)->json(res,200,"Signed in"))
    .failureHandler((req,res,ex)->json(res,401,"Email or password is incorrect, or this account is inactive.")))
   .logout(l->l.logoutUrl("/api/auth/logout").invalidateHttpSession(true).clearAuthentication(true)
    .deleteCookies("JSESSIONID").logoutSuccessHandler((req,res,auth)->json(res,200,"Signed out")))
   .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->json(res,401,"Please sign in to continue."))
    .accessDeniedHandler((req,res,ex)->json(res,403,"Access denied or session token expired. Refresh and try again.")))
   .addFilterAfter(new OncePerRequestFilter(){
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
     var auth=SecurityContextHolder.getContext().getAuthentication();
     if(auth!=null && auth.getPrincipal() instanceof AccountPrincipal p){
      var user=users.findById(p.id);
      if(user.isEmpty()||!user.get().enabled||user.get().authVersion!=p.version){
       SecurityContextHolder.clearContext();
       var session=req.getSession(false);if(session!=null)session.invalidate();
       json(res,401,"Your session has ended. Please sign in again.");return;
      }
     }
     chain.doFilter(req,res);
    }
   },SecurityContextHolderFilter.class);
  return http.build();
 }
 private static void json(HttpServletResponse res,int status,String message)throws IOException {
  res.setStatus(status);res.setContentType("application/json");res.getWriter().write("{\"message\":\""+message+"\"}");
 }
}
