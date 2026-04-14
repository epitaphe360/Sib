import { Component, OnInit, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { AcceuilService } from "src/app/services/accueil.service";
import { NewsletterService } from "src/app/services/newsletter.service";
import { environment } from "src/environments/environment";
import * as cryptoJS from "crypto-js";
import { GlobalService } from "src/app/services/global.service";
import { GalerieService } from "src/app/services/galerie.service";
declare let $, aos, countDown, magnificPopup, magnificPopupVideo: any;

@Component({
	selector: "app-accueil",
	templateUrl: "./accueil.component.html",
	styleUrls: ["./accueil.component.css"],
})
export class AccueilComponent implements OnInit {
	adminURL: string;
	apiURL: string;
	visitorForm: FormGroup;
	submitted = false;
	submitLoading = false;
	submitValidated = null;
	autreSecteurVisible = false;
	isVisitorFormLoading: boolean = false;
	isNewsLetterFormLoading: boolean = false;
	banniereHaut: any;
	banniereBas: any;
	// isMobileDevice: boolean = false;
	screenSize: number;
	sib: any = {};
	sibLoadidng = false;
	temoignages: any[] = [];
	temoignagesLoading = false;
	galerie: any[] = [];
	galerieLoading = false;
	magnificPopupApplied = false;
	magnificPopupVideoApplied = false;
	youtubeVideoUrl: any = null;
	exposantForm: FormGroup;

	constructor(
		private title: Title,
		private fb: FormBuilder,
		private accueilService: AcceuilService,
		private newsletterService: NewsletterService,
		private globalService: GlobalService,
		private galerieService: GalerieService,
		private renderer: Renderer2,
		private domSanitizer: DomSanitizer,
		private _fb: FormBuilder,
		private _gs: GlobalService
	) {
		this.title.setTitle(environment.appTitle + " - Accueil");
		this.adminURL = environment.adminURL;
		this.apiURL = environment.apiURL;
	}

	ngOnInit(): void {
		// this.screenSize = window.innerWidth;

		// this._gs.getSIB().subscribe(
		//     response => {
		//         this.sib = response.data.attributes;
		//         this.youtubeVideoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.sib.youtube_video_id + '?start=15&autoplay=1&mute=1&playsinline=0&loop=1&controls=1&rel=0&showinfo=0&vq=hd1080')
		//         this.sibLoadidng = false;
		//     },
		//     error => {
		//         console.log(error);
		//         this.sibLoadidng = false;
		//     }
		// );

		// this._gs.getTemoignages().subscribe(
		//     response => {
		//         this.temoignages = response.data;
		//         this.temoignagesLoading = false;
		//     },
		//     error => {
		//         console.log(error);
		//         this.temoignagesLoading = false;
		//     }
		// );

		// this.galerieService.getList().subscribe(
		//     response => {
		//         this.galerie = response.data;
		//         this.galerieLoading = false;
		//     },
		//     error => {
		//         console.log(error);
		//         this.galerieLoading = false;
		//     }
		// );

		// this.accueilService.getBannieres().subscribe(
		//     response => {
		//         this.banniereHaut = response.banniereHaut.data[0]?.attributes;
		//         this.banniereBas = response.banniereBas.data[0]?.attributes;
		//     },
		//     error => {
		//         console.log(error);
		//     }
		// );

		this.visitorForm = this._fb.group({
			name: ["", this.noWhiteSpaceValidator],
			email: ["", [this.noWhiteSpaceValidator, Validators.email]],
			phone: ["", this.noWhiteSpaceValidator],
			company: "",
			jobPosition: "",
			event: 7,
			username: "",
			password: "",
			confirmed: true,
			emailOTPConfirmed: true,
			type: "visitor",
			provider: "local",
			role: 1,
		});

		this.exposantForm = this._fb.group({
			nom: ["", this.noWhiteSpaceValidator],
			email: ["", [this.noWhiteSpaceValidator, Validators.email]],
			telephone: ["", this.noWhiteSpaceValidator],
			societe: [""],
			secteur_activite: [""],
			// pays: ['', this.noWhiteSpaceValidator],
			// fonction: [''],
			// adresse: [''],
			message: [""],
		});

		aos.init();
		countDown.init();
		magnificPopupVideo.init();
	}

	onFormSubmit() {
		this.submitted = true;
		this.submitValidated = null;
		this.exposantForm.markAllAsTouched();
		if (this.exposantForm.valid) {
			this.submitLoading = true;
			if (this.exposantForm.get("secteur_activite").value == "") this.exposantForm.patchValue({ secteur_activite: "non rempli" });
			this._gs.postExposant(this.exposantForm.value).subscribe(
				(response) => {
					console.log(response);
					this.submitted = false;
					this.submitValidated = true;
					this.submitLoading = false;
					this.autreSecteurVisible = false;
					this.exposantForm.reset({ secteur_activite: "" });
				},
				(error) => {
					if (error == 400) {
						this.submitted = false;
						this.submitValidated = false;
						this.submitLoading = false;
					}
				}
			);
		}
	}

	magnificPopup() {
		if (!this.magnificPopupApplied) {
			magnificPopup.init();
			this.magnificPopupApplied = true;
		}
	}

	magnificPopupVideo() {
		if (!this.magnificPopupVideoApplied) {
			magnificPopupVideo.init();
			this.magnificPopupVideoApplied = true;
		}
	}

	onSecteurChange(secteur: string) {
		if (secteur == "Autre") {
			this.autreSecteurVisible = true;
			this.visitorForm.controls["secteur_activite"].reset();
			setTimeout(() => {
				this.renderer.selectRootElement("#secteur_activite").focus();
			}, 0);
		} else this.autreSecteurVisible = false;
	}

	onVisitorFormSubmit() {
		this.submitted = true;
		this.submitValidated = null;
		this.visitorForm.markAllAsTouched();
		this.visitorForm.markAsDirty();
		if (this.visitorForm.valid) {
			this._gs.postVisitor(this.visitorForm.getRawValue()).subscribe(
				(response) => {
					this.submitted = false;
					this.submitValidated = true;
					this.autreSecteurVisible = false;
					this.visitorForm.reset(this.visitorFormReset());
				},
				(error) => {
					if (error.status == 0) {
						this.submitted = false;
						this.submitValidated = true;
						this.autreSecteurVisible = false;
						this.visitorForm.reset(this.visitorFormReset());
					} else if (error.status == 400) {
						this.submitted = false;
						this.submitValidated = false;
					}
				}
			);
		} else {
			$("body,html").animate({ scrollTop: 0 }, 0);
		}
	}

	noWhiteSpaceValidator(control: FormControl) {
		const isWhitespace = (control.value || "").trim().length === 0;
		const isValid = !isWhitespace;
		return isValid ? null : { required: true };
	}

	onNewsLetterSubmit(inputEmail: HTMLInputElement) {
		const email = inputEmail.value.trim();
		if (this.validateEmail(email) == null) {
			alert("Email non valide !");
			return;
		}
		this.isNewsLetterFormLoading = true;
		this.newsletterService.postEmail(email).subscribe(
			(response) => {
				alert("Votre email a été bien enregistré.");
				inputEmail.value = "";
				this.isNewsLetterFormLoading = false;
			},
			(error) => {
				alert(error);
				inputEmail.focus();
				this.isNewsLetterFormLoading = false;
			}
		);
	}

	visitorFormReset() {
		return {
			name: "",
			email: "",
			phone: "",
			company: "",
			jobPosition: "",
			event: 7,
			username: "",
			password: "",
			confirmed: true,
			emailOTPConfirmed: true,
			type: "visitor",
			provider: "local",
			role: 1,
		};
	}

	validateEmail(email) {
		return email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	}
}
