import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  AuditoriaService
} from '../../../../core/services/auditoria.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './auditoria.components.html',
  styleUrls: ['./auditoria.components.css']
})
export class AuditoriaComponent implements OnInit {

  private auditoriaService =
    inject(AuditoriaService);

  auditLogs: any[] = [];

  filteredLogs: any[] = [];

  searchText = '';

  selectedLog: any = null;

  ngOnInit(): void {

    this.loadData();

  }

  loadData(): void {

    this.auditoriaService
      .getAuditLogs()
      .subscribe({

        next: (data) => {

          this.auditLogs = data;

          this.filteredLogs = data;

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  applyFilter(): void {

    this.filteredLogs =

      this.auditLogs.filter(log => {

        return (

          log.action
            .toLowerCase()
            .includes(
              this.searchText
                .toLowerCase()
            )

          ||

          log.entity
            .toLowerCase()
            .includes(
              this.searchText
                .toLowerCase()
            )

          ||

          log.hash
            .toLowerCase()
            .includes(
              this.searchText
                .toLowerCase()
            )

        );

      });

  }

  openDetail(log: any): void {

    this.selectedLog = log;

  }

  closeDetail(): void {

    this.selectedLog = null;

  }

}