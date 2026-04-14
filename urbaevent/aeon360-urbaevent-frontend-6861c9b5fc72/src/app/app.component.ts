import { Component } from "@angular/core";
import { Router, RoutesRecognized } from "@angular/router";
import { Subscription } from "rxjs";
import { GlobalService } from "./services/global.service";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
})
export class AppComponent {
	lang: string;
	routerSub: Subscription;
	authSub: Subscription;
	loggedControleur = false;
	minimalLayout = false;

	constructor(private globalService: GlobalService, private router: Router) {}

	ngOnInit(): void {
		if (localStorage.getItem("auth") != null) {
			const auth = JSON.parse(localStorage.getItem("auth"));
			this.globalService.authSubject.next(JSON.parse(localStorage.getItem("auth")));
		}
	}

	ngOnDestroy() {
		this.routerSub.unsubscribe();
		this.authSub.unsubscribe();
	}
}
