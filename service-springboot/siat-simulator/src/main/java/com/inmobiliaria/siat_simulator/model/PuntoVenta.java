package com.inmobiliaria.siat_simulator.model;
import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "punto_venta")
@Data
public class PuntoVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nitEmisor;
    private Integer codigoSucursal; 
    private Integer codigoPuntoVenta;
    private String nombre; 

}
