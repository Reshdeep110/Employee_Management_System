package com.peopleflow.service;
import com.peopleflow.dto.EmployeeRequest;
import com.peopleflow.exception.ApiException;
import com.peopleflow.model.Employee;
import com.peopleflow.repository.EmployeeRepository;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional(readOnly=true)
public class EmployeeService {
 private final EmployeeRepository repository;
 public EmployeeService(EmployeeRepository repository){this.repository=repository;}
 public List<Employee> list(){return repository.findAll(Sort.by(Sort.Direction.DESC,"id"));}
 public Employee get(Long id){return repository.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Employee not found."));}
 @Transactional
 public Employee create(EmployeeRequest request){
  String email=normalizeEmail(request.email());
  if(repository.existsByEmailIgnoreCase(email))throw new ApiException(HttpStatus.CONFLICT,"An employee with that email already exists.");
  Employee employee=new Employee();copy(request,employee);return repository.saveAndFlush(employee);
 }
 @Transactional
 public Employee update(Long id,EmployeeRequest request){
  Employee employee=get(id);
  if(repository.existsByEmailIgnoreCaseAndIdNot(normalizeEmail(request.email()),id))throw new ApiException(HttpStatus.CONFLICT,"An employee with that email already exists.");
  copy(request,employee);return repository.saveAndFlush(employee);
 }
 @Transactional
 public void delete(Long id){repository.delete(get(id));repository.flush();}
 private String normalizeEmail(String email){return email.strip().toLowerCase(Locale.ROOT);}
 private void copy(EmployeeRequest r,Employee e){
  e.setName(r.name().strip());e.setEmail(normalizeEmail(r.email()));e.setDepartment(r.department().strip());
  e.setRole(r.role().strip());e.setStatus(r.status());e.setJoinedOn(r.joinedOn());
 }
}
