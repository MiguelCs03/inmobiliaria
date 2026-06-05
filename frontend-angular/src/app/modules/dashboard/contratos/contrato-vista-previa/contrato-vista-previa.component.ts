import { Component, Input } from "@angular/core";
import { ContratoPreviaVista } from "../../../../core/models/contrato-previa-vista.model";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
    selector: 'app-contrato-previa-vista',
    standalone: true,
    templateUrl: './contrato-vista-previa.component.html',
    styleUrls: ['./contrato-vista-previa.component.css']
})

export class ContratoPreviaVistaComponent {
    @Input()
    contrato!: ContratoPreviaVista;

    //aqui vamos a obtener el PDF del contrato
    descargarPDF(): void {
        const data = document.getElementById('documentoContrato');

        if (!data) return;

        html2canvas(data)
            .then(canvas => {

                const imgWidth = 250;

                const pageHeight = 300;

                const imgHeight =
                    canvas.height *
                    imgWidth /
                    canvas.width;

                const pdf =
                    new jsPDF('p', 'mm', 'a4');

                const imgData =
                    canvas.toDataURL(
                        'image/png'
                    );

                pdf.addImage(
                    imgData,
                    'PNG',
                    0,
                    0,
                    imgWidth,
                    imgHeight
                );

                pdf.save(
                    'contrato.pdf'
                );
            });
    }
}
