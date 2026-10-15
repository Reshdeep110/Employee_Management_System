package com.peopleflow.repository;
import com.peopleflow.model.AppUser;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface UserRepository extends JpaRepository<AppUser,Long> {
 Optional<AppUser> findByEmailIgnoreCase(String email);
 boolean existsByEmailIgnoreCase(String email);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from AppUser u order by u.id")
 List<AppUser> lockUsers();
}
