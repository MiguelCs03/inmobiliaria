import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { ContratoService } from "../../../../core/services/contrato.service";

@Component({
  selector:'app-contrato-detalle',
  standalone:true,
  imports:[
    CommonModule
  ],
  templateUrl:
    './contrato-detalle.component.html',
  styleUrls:[
    './contrato-detalle.component.css'
  ]
})
export class ContratoDetalleComponent
implements OnInit{

  private route =
    inject(ActivatedRoute);

  contrato$!:Observable<any>;

  constructor(
    private contratoService:
      ContratoService
  ){}

  ngOnInit():void{

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.contrato$ =
      this.contratoService
      .getContratoById(id);

  }

}