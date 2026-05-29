package com.inmobiliaria.siat_simulator.repository;
import com.inmobiliaria.siat_simulator.model.FacturasRecibidas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturasRecibidasRepository extends JpaRepository<FacturasRecibidas, Long> {
    // Aquí podemos añadir métodos de búsqueda personalizados más adelante si los necesitamos
}