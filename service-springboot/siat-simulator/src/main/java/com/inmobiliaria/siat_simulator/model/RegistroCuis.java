package com.inmobiliaria.siat_simulator.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;



@Data
@Table(name = "registro_cuis")
@Entity
public class RegistroCuis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relacion con la tabla PuntoVenta
    @ManyToOne
    @JoinColumn(name = "punto_venta_id", nullable = false)
    private PuntoVenta puntoVenta;

    @Column(nullable=false, unique = true)
    private String codigoCuis;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaVigencia;

    @Column(nullable = false)
    private Boolean activo;

}
