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
export class AdminService {

  constructor(private http: HttpClient) { }

  postImage(fileToUpload: File): Observable<any> {
    const endpoint = 'http://localhost:3000/api/images';
    const formData: FormData = new FormData();
    formData.append('image', fileToUpload);
    return this.http.post(endpoint, formData, { withCredentials: true })
  }

  postImageUpdateDelete(isNew, lastImage, newImage, productId): Observable<any> {
    return this.http.post('http://localhost:3000/api/imageUpdateDelete', {
      isNew: isNew,
      lastImage: lastImage,
      newImage: newImage,
      id: productId
    }, httpOptions);
  }

  postNewProduct(newProductObj): Observable<any> {
    return this.http.post('http://localhost:3000/api/products', newProductObj, httpOptions);
  }
}
