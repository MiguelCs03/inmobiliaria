import { Injectable, inject } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { filter, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private apollo = inject(Apollo);

  private readonly GET_AUDIT_LOGS = gql`

    query {

      auditLogs {

        success

        message

        data {

          id

          action

          entity

          hash

          signature

          timestamp

        }

      }

    }

  `;

  getAuditLogs() {

    return this.apollo

      .watchQuery({

        query: this.GET_AUDIT_LOGS

      })

      .valueChanges

      .pipe(

        filter(
          (result: any) => !!result.data
        ),

        map((result: any) => {

          return result.data
            .auditLogs
            .data;

        })

      );

  }

}