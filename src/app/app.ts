import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header-component/header.component";
import { FooterComponent } from "./layout/footer-component/footer.component";

@Component({
  selector: 'llh-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('literaLabHub');
}
