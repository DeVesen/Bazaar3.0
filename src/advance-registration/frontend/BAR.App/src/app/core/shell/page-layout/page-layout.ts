import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-page-layout',
  imports: [RouterOutlet],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.scss'
})
export class PageLayout {
  private readonly route = inject(ActivatedRoute);

  readonly title = this.route.snapshot.data['title'] ?? '';
}
