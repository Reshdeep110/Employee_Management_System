package com.peopleflow.controller;
import com.peopleflow.dto.EmployeeRequest;
import com.peopleflow.model.Employee;
import com.peopleflow.service.EmployeeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
 private final EmployeeService service;
 public EmployeeController(EmployeeService service){this.service=service;}
 @GetMapping public List<Employee> list(){return service.list();}
 @GetMapping("/{id}") public Employee get(@PathVariable Long id){return service.get(id);}
 @PostMapping public ResponseEntity<Employee> create(@Valid @RequestBody EmployeeRequest request){
  Employee employee=service.create(request);
  return ResponseEntity.created(URI.create("/api/employees/"+employee.getId())).body(employee);
 }
 @PutMapping("/{id}") public Employee update(@PathVariable Long id,@Valid @RequestBody EmployeeRequest request){return service.update(id,request);}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
