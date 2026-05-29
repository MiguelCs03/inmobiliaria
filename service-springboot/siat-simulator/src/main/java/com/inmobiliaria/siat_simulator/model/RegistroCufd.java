package com.inmobiliaria.siat_simulator.model;

import lombok.Data;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Data
@Table(name = "registro_cufd")
@Entity

public class RegistroCufd {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relacion con la tabla RegistroCuis usando el FK  cuid_id
    @ManyToOne
    @JoinColumn(name = "cuis_id", nullable = false)
    private RegistroCuis registroCuis;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String codigoCufd;

    @Column(nullable = false)
    private String codigoControl;

    @Column(nullable = false)
    private LocalDateTime fechaCreate; // O fechaCreacion para mantener tu estándar

    @Column(nullable = false)
    private LocalDateTime fechaVigencia;
}
