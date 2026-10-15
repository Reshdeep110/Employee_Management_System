package com.peopleflow.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import com.peopleflow.model.EmployeeStatus;
// Request DTO: clients cannot assign IDs or database-managed fields.
public record EmployeeRequest(
 @NotBlank(message="Full name is required") @Size(max=100) String name,
 @NotBlank(message="Email is required") @Email(message="Enter a valid email address") @Size(max=160) String email,
 @NotBlank(message="Department is required") @Size(max=80) String department,
 @NotBlank(message="Role is required") @Size(max=100) String role,
 @NotNull(message="Status is required") EmployeeStatus status,
 @NotNull(message="Joining date is required") @PastOrPresent(message="Joining date cannot be in the future") LocalDate joinedOn
) {}
