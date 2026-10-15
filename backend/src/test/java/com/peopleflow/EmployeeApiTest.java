package com.peopleflow;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import com.peopleflow.repository.EmployeeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"spring.profiles.active=demo","spring.datasource.url=jdbc:h2:mem:test;MODE=MySQL;DB_CLOSE_DELAY=-1","app.seed-data=false"})
@org.springframework.security.test.context.support.WithMockUser(roles="ADMIN")
@AutoConfigureMockMvc
class EmployeeApiTest {
 @Autowired MockMvc mvc; @Autowired EmployeeRepository repository; @Autowired ObjectMapper mapper;
 private final String body="{\"name\":\"Test Employee\",\"email\":\"test@example.com\",\"department\":\"Engineering\",\"role\":\"Developer\",\"status\":\"ACTIVE\",\"joinedOn\":\"2025-01-01\"}";
 @BeforeEach void clear(){repository.deleteAll();}
 @Test void completeCrud() throws Exception {
  String response=mvc.perform(post("/api/employees").with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
  long id=mapper.readTree(response).get("id").asLong();
  mvc.perform(get("/api/employees/"+id)).andExpect(jsonPath("$.name").value("Test Employee"));
  mvc.perform(put("/api/employees/"+id).with(csrf()).contentType("application/json").content(body.replace("Developer","Senior Developer"))).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("Senior Developer"));
  mvc.perform(delete("/api/employees/"+id).with(csrf())).andExpect(status().isNoContent());
  mvc.perform(get("/api/employees/"+id)).andExpect(status().isNotFound());
 }
 @Test void rejectsDuplicateIgnoringCase() throws Exception {
  mvc.perform(post("/api/employees").with(csrf()).contentType("application/json").content(body)).andExpect(status().isCreated());
  mvc.perform(post("/api/employees").with(csrf()).contentType("application/json").content(body.replace("test@example.com","TEST@EXAMPLE.COM"))).andExpect(status().isConflict());
 }
 @Test void rejectsInvalidEmail() throws Exception {mvc.perform(post("/api/employees").with(csrf()).contentType("application/json").content(body.replace("test@example.com","not-an-email"))).andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.email").exists());}
 @Test void rejectsBlankName() throws Exception {mvc.perform(post("/api/employees").with(csrf()).contentType("application/json").content(body.replace("Test Employee","   "))).andExpect(status().isBadRequest());}
 @Test void missingDeleteReturns404() throws Exception {mvc.perform(delete("/api/employees/999999").with(csrf())).andExpect(status().isNotFound());}
}
