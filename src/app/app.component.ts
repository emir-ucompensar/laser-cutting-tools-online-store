import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub?: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // On cold start, restore session and redirect from auth screens.
    this.authSub = this.auth.authState$.subscribe((session) => {
      if (!session) return;

      if (this.isPublicAuthRoute(this.router.url)) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });

    this.auth.getSession().subscribe((session) => {
      if (!session) return;

      if (this.isPublicAuthRoute(this.router.url)) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  private isPublicAuthRoute(url: string): boolean {
    return (
      url === '/' ||
      url.startsWith('/login') ||
      url.startsWith('/register') ||
      url.startsWith('/verify')
    );
  }
}
