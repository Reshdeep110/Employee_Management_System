package com.peopleflow.model;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name="employees", uniqueConstraints=@UniqueConstraint(name="uk_employee_email",columnNames="email"))
public class Employee {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=100) private String name;
 @Column(nullable=false,length=160) private String email;
 @Column(nullable=false,length=80) private String department;
 @Column(nullable=false,length=100) private String role;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private EmployeeStatus status;
 @Column(nullable=false) private LocalDate joinedOn;
 public Long getId(){return id;}
 public String getName(){return name;} public void setName(String value){name=value;}
 public String getEmail(){return email;} public void setEmail(String value){email=value;}
 public String getDepartment(){return department;} public void setDepartment(String value){department=value;}
 public String getRole(){return role;} public void setRole(String value){role=value;}
 public EmployeeStatus getStatus(){return status;} public void setStatus(EmployeeStatus value){status=value;}
 public LocalDate getJoinedOn(){return joinedOn;} public void setJoinedOn(LocalDate value){joinedOn=value;}
}
