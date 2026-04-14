import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { GlobalService } from "src/app/services/global.service";
import { environment } from "src/environments/environment";
declare let $: any;

@Component({
	selector: "app-download-badge",
	templateUrl: "./download-badge.component.html",
})
export class DownloadBadgeComponent implements OnInit {
	form: FormGroup;
	events: any[] = [];
	exhibitors: any[] = [];
	submitted = false;
	submitValidated = null;
	submitLoading = false;
	loggedData = null;
	types = [
		{ name: "visitor", label: "Visiteur" },
		{ name: "collaborator", label: "Collaborateur (Exposant)" },
	];
	authSub: Subscription;
	unsubscriber: Subject<any> = new Subject<any>();

	constructor(private _title: Title, private _fb: FormBuilder, private globalService: GlobalService, private router: Router) {
		this._title.setTitle(environment.appTitle + " - Télécharger un badge");
	}

	ngOnInit(): void {
		this.authSub = this.globalService.authSubject.subscribe((auth) => {
			this.loggedData = auth;
			if (this.loggedData == null) {
				this.router.navigateByUrl("/login");
			} else {
				this.form = this._fb.group({
					event: [this.events, Validators.required],
					type: ["", Validators.required],
					exhibitor: [null],
					name: ["", this.noWhiteSpaceValidator],
					email: ["", [this.noWhiteSpaceValidator, Validators.email]],
					phone: ["", this.noWhiteSpaceValidator],
					company: "",
					jobPosition: "",
					username: "",
					confirmed: true,
					emailOTPConfirmed: true,
					provider: "local",
					role: 1,
				});
			}
			this.globalService
				.fetchData("events", { filters: `filters[enabled]=true`, sort: { field: "name", order: "asc" } })
				.pipe(takeUntil(this.unsubscriber))
				.subscribe((response) => {
					this.events = response.data;
				});
		});
	}

	onSubmitForm() {
		this.submitted = true;
		this.submitValidated = null;
		this.form.markAllAsTouched();
		this.form.markAsDirty();
		console.log(this.form.getRawValue());
		if (this.form.valid) {
			this.submitLoading = true;
			this.globalService.registerUser(this.form.getRawValue()).subscribe(
				(response) => {
					this.submitLoading = false;
					this.submitValidated = true;
					location.href = `${environment.apiURL}registrations/downloadEbadgeFull/${response.registrationId}`;
					this.resetForm();
				},
				(error) => {
					this.submitLoading = false;
					if (error.status == 0) {
						this.submitValidated = true;
						this.resetForm();
					} else if (error.status == 400) {
						this.submitValidated = true;
					}
				}
			);
			this.submitted = false;
		} else {
			$("body,html").animate({ scrollTop: 0 }, 0);
		}
	}

	getExhibitorList() {
		this.exhibitors = [];
		this.form.get("exhibitor").clearValidators();
		this.form.get("exhibitor").updateValueAndValidity();
		if (this.form.get("event").value != "" && this.form.get("type").value == "collaborator") {
			this.globalService
				.fetchData(`registrations`, {
					filters: `filters[event]=${this.form.get("event").value}&filters[type]=exhibitor&filters[confirmed]=true&filters[user][company][$null]=false&filters[conference][id][$null]=true`,
					populate: `populate[gate]=true&populate[user][populate]=avatar`,
					pagination: { pageSize: 100 },
				})
				.pipe(takeUntil(this.unsubscriber))
				.subscribe((response) => {
					this.exhibitors = response.data;
					this.form.get("exhibitor").setValidators([Validators.required]);
					this.form.get("exhibitor").updateValueAndValidity();
				});
		}
	}

	resetForm() {
		this.form.patchValue({
			name: "",
			email: "",
			username: "",
			phone: "",
			company: "",
			jobPosition: "",
		});
	}

	noWhiteSpaceValidator(control: FormControl) {
		const isWhitespace = (control.value || "").trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { required: true };
	}

	ngOnDestroy(): void {
		this.unsubscriber.next(null);
		this.unsubscriber.complete();
	}
}
