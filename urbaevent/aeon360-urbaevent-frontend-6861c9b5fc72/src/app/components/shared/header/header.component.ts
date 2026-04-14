import { Component, OnInit } from "@angular/core";
import { Router, RoutesRecognized } from "@angular/router";
import { Subscription } from "rxjs";
import { GlobalService } from "src/app/services/global.service";
declare let $, menuSideBar: any;

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
	routerSub: Subscription;
	authSub: Subscription;
	isProgrammeRoute = false;
	loggedData = null;

	constructor(private router: Router, private globalService: GlobalService) {}

	ngOnInit(): void {
		this.authSub = this.globalService.authSubject.subscribe((auth) => {
			if (auth != null) {
				this.loggedData = auth;
			} else {
				this.loggedData = null;
			}
		});
		menuSideBar.init();
	}

	onSignOut() {
		if (confirm("Êtes vous sûr de vouloir se déconnecter ?")) {
			this.globalService.authSubject.next(null);
			localStorage.removeItem("auth");
			this.router.navigate(["/login"]);
		}
	}

	ngOnDestroy() {
		this.routerSub.unsubscribe();
		this.authSub.unsubscribe();
		this.authSub.unsubscribe();
	}
}
