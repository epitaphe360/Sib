import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { GlobalService } from "src/app/services/global.service";
import { environment } from "src/environments/environment";
declare let $: any;

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
	adminURL: string;
	loginForm: FormGroup;
	submitted = false;
	submitValidated = null;
	redirectToUrl: string = "/";

	constructor(private title: Title, private fb: FormBuilder, private globalService: GlobalService, private router: Router) {
		this.title.setTitle(environment.appTitle + " - BackOffice");
		this.adminURL = environment.adminURL;
	}

	ngOnInit(): void {
		this.loginForm = this.fb.group({
			email: ["", [this.noWhiteSpaceValidator, Validators.email]],
			password: ["", [this.noWhiteSpaceValidator]],
		});
	}

	onLogin() {
		this.submitted = true;
		this.submitValidated = null;
		this.loginForm.markAllAsTouched();
		if (this.loginForm.valid) {
			this.globalService.login(this.loginForm.getRawValue()).subscribe(
				(response) => {
					this.globalService.getAuth(response.jwt).subscribe((response2) => {
						if (response2.role.type == "backoffice") {
							const auth = {
								...response.user,
								jwt: response.jwt,
								type: response2.role.type,
							};
							localStorage.setItem("auth", JSON.stringify(auth));
							this.globalService.authSubject.next(auth);
							this.router.navigateByUrl(this.redirectToUrl);
							this.submitValidated = true;
						} else {
							this.submitted = false;
							this.submitValidated = false;
						}
					});
				},
				(error) => {
					if (error == 400) {
						this.submitted = false;
						this.submitValidated = false;
					}
				}
			);
		}
	}

	noWhiteSpaceValidator(control: FormControl) {
		const isWhitespace = (control.value || "").trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { required: true };
	}
}
