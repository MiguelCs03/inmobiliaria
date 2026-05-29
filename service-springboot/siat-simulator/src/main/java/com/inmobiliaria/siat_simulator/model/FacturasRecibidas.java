package com.inmobiliaria.siat_simulator.model;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Table(name = "facturas_recibidas")
@Entity
public class FacturasRecibidas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Relación con el CUFD diario usando el FK cufd_id
    @ManyToOne
    @JoinColumn(name = "cufd_id", nullable = false)
    private RegistroCufd registroCufd;

    @Column(nullable = false)
    private Long nroFactura;

    @Column(nullable = false, unique = true)
    private String cuf;

    @Column(nullable = false)
    private String nitCliente;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal;

    @Column(nullable = false)
    private LocalDateTime fechaEmision;

    @Column(nullable = false)
    private String estado; // VALIDA, RECHAZADA, ANULADA

    @Column(columnDefinition = "TEXT")
    private String xmlContenido;
}
