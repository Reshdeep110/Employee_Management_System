package com.peopleflow;
import com.peopleflow.model.AppUser;
import com.peopleflow.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"spring.profiles.active=demo","spring.datasource.url=jdbc:h2:mem:auth;MODE=MySQL;DB_CLOSE_DELAY=-1","app.seed-data=false"})
@AutoConfigureMockMvc
class AccountSecurityTest {
 @Autowired MockMvc mvc; @Autowired UserRepository users; @Autowired PasswordEncoder encoder; @Autowired ObjectMapper mapper;
 Long adminId,staffId;
 @BeforeEach void setup(){users.deleteAll();adminId=account("admin@example.com",AppUser.Role.ADMIN);staffId=account("staff@example.com",AppUser.Role.STAFF);}
 Long account(String email,AppUser.Role role){AppUser u=new AppUser();u.name="Test User";u.email=email;u.passwordHash=encoder.encode("TestPassword123!");u.role=role;return users.saveAndFlush(u).id;}
 MockHttpSession login(String email)throws Exception{return (MockHttpSession)mvc.perform(post("/api/auth/login").with(csrf()).param("email",email).param("password","TestPassword123!")).andExpect(status().isOk()).andReturn().getRequest().getSession(false);}
 @Test void anonymousBlockedAndNoPublicSignup()throws Exception{
  mvc.perform(get("/api/employees")).andExpect(status().isUnauthorized());
  mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/auth/signup").with(csrf()).contentType("application/json").content("{}")).andExpect(status().isUnauthorized());
 }
 @Test void loginSessionAndLogout()throws Exception{
  var session=login("admin@example.com");
  mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ADMIN")).andExpect(jsonPath("$.passwordHash").doesNotExist());
  mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isOk());
  assertTrue(session.isInvalid());mvc.perform(get("/api/employees")).andExpect(status().isUnauthorized());
 }
 @Test void badPasswordAndCsrfAreRejected()throws Exception{
  mvc.perform(post("/api/auth/login").with(csrf()).param("email","admin@example.com").param("password","wrong")).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/auth/login").param("email","admin@example.com").param("password","TestPassword123!")).andExpect(status().isForbidden());
  mvc.perform(post("/api/admin/users").session(login("admin@example.com")).contentType("application/json").content("{}")).andExpect(status().isForbidden());
 }
 @Test void staffCanReadButCannotWriteOrManageAccounts()throws Exception{
  var session=login("staff@example.com");
  mvc.perform(get("/api/employees").session(session)).andExpect(status().isOk());
  mvc.perform(post("/api/employees").session(session).with(csrf()).contentType("application/json").content("{}")).andExpect(status().isForbidden());
  mvc.perform(get("/api/admin/users").session(session)).andExpect(status().isForbidden());
  mvc.perform(patch("/api/admin/users/"+adminId+"/status").session(session).with(csrf()).contentType("application/json").content("{\"enabled\":false}")).andExpect(status().isForbidden());
 }
 @Test void createsHashedAccountAndRejectsDuplicateAndShortPassword()throws Exception{
  var session=login("admin@example.com");String body="{\"name\":\"New Staff\",\"email\":\"new@example.com\",\"password\":\"NewPassword123!\",\"role\":\"STAFF\"}";
  mvc.perform(post("/api/admin/users").session(session).with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.passwordHash").doesNotExist());
  var u=users.findByEmailIgnoreCase("new@example.com").orElseThrow();assertNotEquals("NewPassword123!",u.passwordHash);assertTrue(encoder.matches("NewPassword123!",u.passwordHash));
  mvc.perform(post("/api/admin/users").session(session).with(csrf()).contentType("application/json").content(body.replace("new@example.com","NEW@example.com"))).andExpect(status().isConflict());
  mvc.perform(post("/api/admin/users").session(session).with(csrf()).contentType("application/json").content(body.replace("new@example.com","other@example.com").replace("NewPassword123!","short"))).andExpect(status().isBadRequest());
 }
 @Test void deactivationRevokesExistingSessionAndBlocksLogin()throws Exception{
  var staff=login("staff@example.com");var admin=login("admin@example.com");
  mvc.perform(patch("/api/admin/users/"+staffId+"/status").session(admin).with(csrf()).contentType("application/json").content("{\"enabled\":false}")).andExpect(status().isOk());
  mvc.perform(get("/api/employees").session(staff)).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/auth/login").with(csrf()).param("email","staff@example.com").param("password","TestPassword123!")).andExpect(status().isUnauthorized());
  mvc.perform(patch("/api/admin/users/"+adminId+"/status").session(admin).with(csrf()).contentType("application/json").content("{\"enabled\":false}")).andExpect(status().isBadRequest());
 }
 @Test void passwordChangeRevokesSessionsAndNewPasswordWorks()throws Exception{
  var staff=login("staff@example.com");
  mvc.perform(post("/api/auth/password").session(staff).with(csrf()).contentType("application/json").content("{\"currentPassword\":\"TestPassword123!\",\"newPassword\":\"Replacement123!\"}")).andExpect(status().isOk());
  assertTrue(staff.isInvalid());
  mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/auth/login").with(csrf()).param("email","staff@example.com").param("password","Replacement123!")).andExpect(status().isOk());
 }
 @Test void adminResetRevokesStaffAndNewCredentialsWork()throws Exception{
  var staff=login("staff@example.com");var admin=login("admin@example.com");
  mvc.perform(post("/api/admin/users/"+staffId+"/password").session(admin).with(csrf()).contentType("application/json").content("{\"password\":\"ResetPassword123!\"}")).andExpect(status().isOk());
  mvc.perform(get("/api/employees").session(staff)).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/auth/login").with(csrf()).param("email","staff@example.com").param("password","ResetPassword123!")).andExpect(status().isOk());
 }
 @Test void browserCsrfFlowRotatesAfterLogin()throws Exception{
  var before=mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
  var token=mapper.readTree(before.getResponse().getContentAsString());var session=(MockHttpSession)before.getRequest().getSession();
  mvc.perform(post("/api/auth/login").session(session).header(token.get("headerName").asText(),token.get("token").asText()).param("email","admin@example.com").param("password","TestPassword123!")).andExpect(status().isOk());
  var after=mvc.perform(get("/api/auth/csrf").session(session)).andExpect(status().isOk()).andReturn();var next=mapper.readTree(after.getResponse().getContentAsString());
  mvc.perform(post("/api/auth/logout").session(session).header(next.get("headerName").asText(),next.get("token").asText())).andExpect(status().isOk());
 }
}
