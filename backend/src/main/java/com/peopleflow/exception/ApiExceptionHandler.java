package com.peopleflow.exception;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(ApiException.class)
 public ResponseEntity<?> business(ApiException ex){return ResponseEntity.status(ex.getStatus()).body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<?> validation(MethodArgumentNotValidException ex){
  Map<String,String> fields=new LinkedHashMap<>();
  ex.getBindingResult().getFieldErrors().forEach(e->fields.putIfAbsent(e.getField(),e.getDefaultMessage()));
  return ResponseEntity.badRequest().body(Map.of("message","Please correct the highlighted fields.","errors",fields));
 }
 @ExceptionHandler(HttpMessageNotReadableException.class)
 public ResponseEntity<?> invalidJson(){return ResponseEntity.badRequest().body(Map.of("message","Invalid request. Check status and date (YYYY-MM-DD)."));}
 @ExceptionHandler(DataIntegrityViolationException.class)
 public ResponseEntity<?> duplicate(){return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","A record with that email already exists."));}
}
