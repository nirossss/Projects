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
export class ShopService {

  constructor(private http: HttpClient) { }

  postUserCart(): Observable<any> {
    return this.http.post('http://localhost:3000/api/userCart', {}, httpOptions);
  }

  getProducts(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/products`, httpOptions);
  }

  getUnavailableDates(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/unavailableDates`, httpOptions);
  }

  postProductToCart(productId, units): Observable<any> {
    return this.http.post('http://localhost:3000/api/productToCart', {
      product_id_fk: productId,
      units: units
    }, httpOptions);
  }

  postDeleteProductFromCart(cartProductId): Observable<any> {
    return this.http.post('http://localhost:3000/api/deleteProductFromCart', {
      cart_product_id: cartProductId
    }, httpOptions);
  }

  postDeleteAllProductFromCart(): Observable<any> {
    return this.http.post('http://localhost:3000/api/deleteAllProductFromCart', {}, httpOptions);
  }

  postNewOrder(orderData): Observable<any> {
    return this.http.post('http://localhost:3000/api/order', {
      order_city: orderData.city,
      order_street: orderData.street,
      shipping_date: orderData.shipping_date
    }, httpOptions);
  }

  getReceipt(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/receipt`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Content-Type': 'text/html',
      }),
      withCredentials: true
    });
  }

  deleteReceipt(): Observable<any> {
    return this.http.post('http://localhost:3000/api/receipt', {
      try: 'try'
    }, httpOptions);
  }
}
