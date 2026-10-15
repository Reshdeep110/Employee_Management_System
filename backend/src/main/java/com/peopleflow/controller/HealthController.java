package com.peopleflow.controller;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
@RestController
public class HealthController {
 @Value("${spring.profiles.active:mysql}") private String profile;
 @GetMapping("/api/health") public Map<String,String> health(){return Map.of("status","UP","databaseMode",profile.contains("demo")?"H2 local demo":"MySQL");}
}
