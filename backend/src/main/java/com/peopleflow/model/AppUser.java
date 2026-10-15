package com.peopleflow.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="users")
public class AppUser {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,length=100) public String name;
 @Column(nullable=false,unique=true,length=160) public String email;
 @Column(nullable=false) public String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=16) public Role role;
 @Column(nullable=false) public boolean enabled=true;
 @Column(nullable=false) public long authVersion=0;
 @Column(nullable=false,updatable=false) public Instant createdAt=Instant.now();
 public enum Role { ADMIN, STAFF }
}
