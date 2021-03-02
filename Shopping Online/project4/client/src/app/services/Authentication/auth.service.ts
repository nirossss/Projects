import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  getOredersProductsAmount(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/home`, httpOptions);
  }

  postLogin(email, password): Observable<any> {
    return this.http.post('http://localhost:3000/api/login', {
      email: email,
      password: password
    }, httpOptions);
  }

  postRegisterFirstStep(id, email): Observable<any> {
    return this.http.post('http://localhost:3000/api/register/firstStep', {
      user_id: id,
      email: email
    }, httpOptions);
  }

  postRegisteration(data): Observable<any> {
    return this.http.post('http://localhost:3000/api/register', data, httpOptions);
  }

  getVerification(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/auth/verify`, httpOptions);
  }

  getOrderVerification(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/auth/conclusion`, httpOptions);
  }

  getAdminVerification(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/auth/admin`, httpOptions);
  }
}
