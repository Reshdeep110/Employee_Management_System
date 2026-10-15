package com.peopleflow.config;
import com.peopleflow.model.*;
import com.peopleflow.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import java.time.LocalDate;
@Component
@ConditionalOnProperty(name="app.seed-data",havingValue="true")
public class DemoData implements CommandLineRunner {
 private final EmployeeRepository repository;
 public DemoData(EmployeeRepository repository){this.repository=repository;}
 public void run(String... args){
  if(repository.count()!=0)return;
  String[][] rows={
   {"Arun Kumar","arun@example.com","Engineering","Java Developer","ACTIVE"},
   {"Priya Nair","priya@example.com","Product","Product Designer","ACTIVE"},
   {"Kaviya Ravi","kaviya@example.com","People","HR Specialist","ON_LEAVE"},
   {"Rahul Menon","rahul@example.com","Engineering","Frontend Developer","ACTIVE"},
   {"Deepika S","deepika@example.com","Finance","Finance Analyst","ACTIVE"},
   {"Meera Krishnan","meera@example.com","Engineering","Backend Developer","ACTIVE"},
   {"Naveen Raj","naveen@example.com","Sales","Account Executive","INACTIVE"},
   {"Ananya Iyer","ananya@example.com","Marketing","Content Strategist","ACTIVE"}
  };
  for(int i=0;i<rows.length;i++){
   String[] r=rows[i];Employee e=new Employee();e.setName(r[0]);e.setEmail(r[1]);e.setDepartment(r[2]);e.setRole(r[3]);e.setStatus(EmployeeStatus.valueOf(r[4]));e.setJoinedOn(LocalDate.now().minusDays(i*17L+4));repository.save(e);
  }
 }
}
