import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-shop-products-list',
  templateUrl: './shop-products-list.component.html',
  styleUrls: ['./shop-products-list.component.css']
})
export class ShopProductsListComponent implements OnInit {

  constructor() { }
  @Input() filteredProducts
  @Output() newProductToCartEvent = new EventEmitter<any>()

  isPopup: Boolean = false

  chosenProduct = {
    id: 0,
    product_name: '',
    price: 0,
    image: ''
  }

  ngOnInit(): void {
  }

  openUnitsPopup(product): void {
    this.chosenProduct = product
    this.isPopup = true
  }

  pushProductToCart(units): void {
    this.newProductToCartEvent.emit({ units: units, chosenProduct: this.chosenProduct });
    this.isPopup = false
  }

}
