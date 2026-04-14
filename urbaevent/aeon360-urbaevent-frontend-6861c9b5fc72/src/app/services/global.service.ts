import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

export interface fetchDataOptions {
	populate?: string;
	filters?: any;
	pagination?: {
		page?: number;
		pageSize: number;
	};
	sort?: {
		field: string;
		order: string;
	};
}

const apiURL = environment.apiURL;

@Injectable({
	providedIn: "root",
})
export class GlobalService {
	lang: string;
	authSubject = new BehaviorSubject<any>(null);

	constructor(private http: HttpClient) {
		this.lang = localStorage.getItem("lang");
	}

	login(data: any): Observable<any> {
		return this.http.post<any>(`${apiURL}auth/local`, { identifier: data.email, password: data.password }).pipe(
			catchError((errorResponse: HttpErrorResponse) => {
				return throwError(errorResponse.error.error.status);
			})
		);
	}

	getAuth(auth_token): Observable<any> {
		const headers = new HttpHeaders({
			"Content-Type": "application/json",
			Authorization: `Bearer ${auth_token}`,
		});
		return this.http.get<any>(`${apiURL}users/me?populate[role]=true`, { headers: headers }).pipe(
			catchError((errorResponse: HttpErrorResponse) => {
				return throwError(errorResponse.error.error.status);
			})
		);
	}

	registerUser(data: any): Observable<any> {
		data = {
			...data,
			username: data.email,
		};
		return this.http.post<any>(apiURL + "auth/local/register", data).pipe(catchError(this.handleError));
	}

	fetchData(collection: string, options?: fetchDataOptions): Observable<any> {
		let populate = options?.populate ? `&${options?.populate}` : ``;
		let filters = options?.filters ? `&${options?.filters}` : ``;
		let pagination = options?.pagination != undefined ? `&p&pagination[pageSize]=${options.pagination.pageSize}` : ``;
		let sort = options?.sort != undefined ? `&sort=${options.sort.field}:${options.sort.order}` : `&sort[0]=rank:asc&sort[1]=id:asc`;
		return this.http.get<any>(`${apiURL}${collection}?q${populate}${filters}${pagination}${sort}`);
	}

	addData(collection: string, data: any): Observable<any> {
		return this.http.post(`${apiURL}${collection}`, { data: data }).pipe(catchError(this.handleError));
	}

	addFormData(collection: string, data: any): Observable<any> {
		return this.http.post(`${apiURL}${collection}`, data).pipe(catchError(this.handleError));
	}

	updateData(collection: string, itemId: number, data: any): Observable<any> {
		return this.http.put(`${apiURL}${collection}/${itemId}`, { data: data }).pipe(catchError(this.handleError));
	}

	updateFormData(collection: string, itemId: number, data: any): Observable<any> {
		return this.http.put(`${apiURL}${collection}/${itemId}`, data).pipe(catchError(this.handleError));
	}

	deleteData(collection: string, id: number): Observable<any> {
		return this.http.delete(`${apiURL}${collection}/${id}`).pipe(catchError(this.handleError));
	}

	handleError(errorResponse: HttpErrorResponse) {
		console.log("=================== Error ===================");
		console.log(errorResponse);
		console.log("=================== /Error ==================");
		return throwError(errorResponse);
	}
}
