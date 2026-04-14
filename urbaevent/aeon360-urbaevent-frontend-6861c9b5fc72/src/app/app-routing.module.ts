import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./components/pages/login/login.component";
import { NotFoundComponent } from "./components/pages/not-found/not-found.component";
import { DownloadBadgeComponent } from "./components/pages/download-badge/download-badge.component";

const routes: Routes = [
	{ path: "", component: DownloadBadgeComponent },
	{ path: "login", component: LoginComponent },
	{ path: "not-found", component: NotFoundComponent },
	{ path: "**", redirectTo: "" },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
