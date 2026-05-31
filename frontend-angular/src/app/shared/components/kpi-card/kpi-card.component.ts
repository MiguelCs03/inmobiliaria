import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css'],
})
export class KpiCardComponent {
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() subtitle = '';
  @Input() color: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'teal' = 'blue';
  @Input() icon: 'users' | 'home' | 'currency' | 'chart' | 'star' | 'search' | 'building' | 'tag' = 'home';
  @Input() trend = '';
  @Input() trendUp = true;
}
