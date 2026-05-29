package com.inmobiliaria.siat_simulator.repository;

import com.inmobiliaria.siat_simulator.model.RegistroCuis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistroCuisRepository extends JpaRepository<RegistroCuis, Long> {
        Optional<RegistroCuis> findByCodigoCuisAndActivoTrue(String codigoCuis);
}