package com.example.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.Admin;

@Repository
public interface AdminRepo extends CrudRepository<Admin, Integer> {

    // Existing method (unchanged)
    @Query("select cre.password from Admin cre where cre.username=?1")
    Iterable<Admin> findAllUsernamePassword(String username);

    // Find admin by username
    @Query("select a from Admin a where a.username = ?1")
    Optional<Admin> findByUsername(String username);

    // Get the max id to auto-increment for new admin
    @Query("select max(a.id) from Admin a")
    Optional<Integer> findMaxId();
}
