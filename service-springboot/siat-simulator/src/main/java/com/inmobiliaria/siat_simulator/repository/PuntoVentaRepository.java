package com.inmobiliaria.siat_simulator.repository;

import com.inmobiliaria.siat_simulator.model.PuntoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PuntoVentaRepository extends JpaRepository<PuntoVenta, Long> {
    
    // Este método genera la consulta automática: 
    // SELECT * FROM puntos_de_venta WHERE nit_emisor = ? AND codigo_sucursal = ? AND codigo_punto_venta = ?
    Optional<PuntoVenta> findByNitEmisorAndCodigoSucursalAndCodigoPuntoVenta(
        String nitEmisor, Integer codigoSucursal, Integer codigoPuntoVenta
    );
}