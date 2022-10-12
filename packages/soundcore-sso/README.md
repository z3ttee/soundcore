# Soundcore SSO
This package is a angular library to implement basic Single-Sign-On functionality for applications that
use [Keycloak](https://www.keycloak.org/) for authentication.

## Table Of Contents
1. [How this library works](#how-this-library-works)
2. [Registering the module](#registering-the-module)
3. [Using the built-in guard](#using-the-built-in-guard)
4. [Learn about request interception](#learn-about-request-interception)


## How this library works
The library is built on top of the package `keycloak-angular`. But to make configuration easier and to reduce
boilerplate code, this package was written to help with basic configuration. So to learn more on how the library
works, it should suffice to read the [documentation of `keycloak-angular`](https://github.com/mauriciovigolo/keycloak-angular).

## Registering the module
The package exports an Angular module which has to be imported in the root module of the Angular app.
Please follow this short example on how to configure the `SSOModule` inside your `app.module.ts` file:

```javascript
import { NgModule } from '@angular/core';
import { SSOModule } from "@soundcore/sso";

@NgModule({
    // ...
    imports: [
        // ...
        SSOModule.forRoot({
            baseUrl: environment.keycloak_url,
            realm: environment.keycloak_realm,
            clientId: environment.keycloak_client_id,
            initOptions: {
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
            },
            loadUserProfileAtStartUp: true,
            roleMapping: {
                admin: environment.admin_role,
                mod: environment.mod_role
            }
        }),
        // ...
    ],
    // ...
})
export class AppModule { }
```

## Using the built-in guard
`@soundcore/sso` provides a built-in route guard to manage restricted access to routes.
Guards are always applied in your app's route configuration, so please see the following example 
for how to use the guard and activate it in your `app-routing.module.ts`

```javascript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // ...
  { path: "admin", component: AdminLayoutComponent, canActivate: [ SSOGuard ], data: { roles: ["admin"] }, children: [
    // ...
  ]},
  // ...
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
```

In this case, the `/admin` route and all its children routes will be guarded by the `SSOGuard`. This guard simply checks for
the user's session and verifies it. If the session is not valid or the user does not have one of the required roles, access is blocked and the user is returned
to the main page. 

*HINT: You can define the required roles for a route via the `data` object on every route. Please see the above example on how to configure required roles. If multiple roles are defined, it functions like `OR` statement which grants access if the user has one of the given roles.*

## Learn about request interception
Upon every api request, the access token will be added to the `Authorization` header as `Bearer`-Token.