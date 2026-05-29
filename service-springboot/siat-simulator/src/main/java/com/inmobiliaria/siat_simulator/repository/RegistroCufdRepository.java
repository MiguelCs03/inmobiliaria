package com.inmobiliaria.siat_simulator.repository;

import com.inmobiliaria.siat_simulator.model.RegistroCufd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface RegistroCufdRepository extends JpaRepository<RegistroCufd, Long> {
    Optional<RegistroCufd> findByCodigoCufd(String codigoCufd);
}
