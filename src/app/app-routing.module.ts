import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AscMainLayoutComponent } from 'src/layouts/main-layout/main-layout.component';
import { AscMainLayoutModule } from 'src/layouts/main-layout/main-layout.module';
import { KeycloakSSOGuard } from 'src/sso/guards/keycloak.guard';

const routes: Routes = [
  { path: "", component: AscMainLayoutComponent, canActivate: [KeycloakSSOGuard], children: [

  ]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AscMainLayoutModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
