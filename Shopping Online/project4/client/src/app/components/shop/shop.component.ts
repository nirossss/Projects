import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/Authentication/auth.service'
import { ShopService } from '../../services/shop/shop.service'
import { Router } from '@angular/router';

let unavailbleDatesForInit = []

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  totalPrice: Number = 0
  isOrder: Boolean = false
  isFullCartView: Boolean = true
  isSmallView: Boolean = true
  chosenCategory: String = 'All products'
  cartWidth: String = '14%'
  todayDate: String = new Date().toISOString().substring(0, 10)

  dateFilter(date): Boolean {
    let unavailbleDates = unavailbleDatesForInit
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    let undy // getFullYear()
    let undm // getMonth()
    let undd // getDate() --> gives the day number in month
    let unddArr = [] // unavailble days arr (in chosen year and month)
    for (let i = 0; i < unavailbleDates.length; i++) { // push the unavailable dates for picked month
      undy = new Date(unavailbleDates[i]).getFullYear()
      undm = new Date(unavailbleDates[i]).getMonth()
      undd = new Date(unavailbleDates[i]).getDate()
      if (undy === year && undm === month) {
        unddArr.push(undd)
      }
    }
    return !unddArr.includes(day)
  }

  userData = {
    first_name: '',
    last_name: '',
    city: '',
    street: ''
  }
  orderData = {
    city: '',
    street: '',
    shipping_date: '',
    creditCard: null
  }
  orderErrorObj = {
    isError: false,
    errorMsg: ''
  }

  categories = []
  products = []
  filteredProducts = []
  cartProducts = []
  citiesIsrael = ['Tel aviv', 'Jerusalem', 'Haifa', 'Risho letzion', 'Petah tikva', 'Ashdod', 'Natanya', 'Beer sheva', 'Bnei brak', 'Hulon']

  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.userAuthCheck()
    this.shopService.getUnavailableDates().subscribe(({ success, unavailableDates }) => {
      if (success) {
        unavailbleDatesForInit = unavailableDates
      }
    });
  }

  userAuthCheck(): void {
    this.authService.getVerification().subscribe((data) => {
      if (data.success) {
        this.userData = data.user_data
        this.shopService.getProducts().subscribe(({ categoriesData, productsData }) => {
          this.categories = categoriesData
          this.products = productsData
          this.filteredProducts = productsData
        });
        this.shopService.postUserCart().subscribe((data) => {
          this.cartProducts = data.cartProducts
          this.updateTotalPrice(data.cartProducts)
        });
        return
      } else if (!data.success) {
        this.router.navigate(['/home']);
        return
      }
    });
  }

  filterProductsByCategory(categoryId, categoryName): void {
    this.chosenCategory = categoryName

    this.shopService.getProducts().subscribe(({ productsData }) => {
      this.products = productsData
      const filteredProductsArr = this.products.filter(product => product.category_id === categoryId);
      this.filteredProducts = filteredProductsArr
    });
  }

  showAllProducts(): void {
    this.chosenCategory = 'All products'

    this.shopService.getProducts().subscribe(({ productsData }) => {
      this.products = productsData
      this.filteredProducts = this.products
    });
  }

  showSearchedProduct(e, input): void {
    e.preventDefault()
    this.chosenCategory = `Search results for ${input}`

    this.shopService.getProducts().subscribe(({ productsData }) => {
      this.products = productsData
      const filteredProductsArr = this.products.filter(product => product.product_name.toUpperCase().includes(input.toUpperCase()));
      this.filteredProducts = filteredProductsArr
    });
  }

  pushProductToCart(pushProductObj): void {
    const { units, chosenProduct } = pushProductObj

    // Send units as natural number to server
    let unitsNatural = Math.sqrt(Math.pow(Math.floor(units), 2))
    let { id: productId, product_name, image } = chosenProduct

    this.shopService.postProductToCart(productId, unitsNatural).subscribe(({ success, cart_product_id, real_sum_price }) => {
      if (success) {
        this.cartProducts.push({ cart_product_id: cart_product_id, sum_price: real_sum_price, units: unitsNatural, product_name: product_name, image: image })
        this.updateTotalPrice(this.cartProducts)
      }
    });
  }

  updateTotalPrice(cartProducts): void {
    this.totalPrice = 0
    if (cartProducts.length) {
      for (let i = 0; i < cartProducts.length; i++) {
        this.totalPrice += cartProducts[i].sum_price
      }
    }
    return
  }

  deleteProductFromCart(cartProductId): void {
    this.shopService.postDeleteProductFromCart(cartProductId).subscribe(({ success, data }) => {
      if (success) {
        for (let i = 0; i < this.cartProducts.length; i++) {
          if (this.cartProducts[i].cart_product_id === cartProductId) {
            this.cartProducts.splice(i, 1)
            this.updateTotalPrice(this.cartProducts)
          }
        }
        return
      }
    });
  }

  deleteAllProductFromCart(): void {
    this.shopService.postDeleteAllProductFromCart().subscribe(({ success }) => {
      if (success) {
        this.cartProducts = []
        this.updateTotalPrice(this.cartProducts)
        return
      }
    });
  }

  changeToShopingView(): void {
    this.searchProductOrder('')
    this.isOrder = false
  }

  userDetailByDblClick(key): void {
    this.orderData[key] = this.userData[key]
  }

  searchProductOrder(input): void {
    for (let i = 0; i < this.cartProducts.length; i++) {
      this.cartProducts[i].isMarked = false
      if (this.cartProducts[i].product_name.toUpperCase().includes(input.toUpperCase()) && input !== '') {
        this.cartProducts[i].isMarked = true
      }
    }
  }

  createNewOrder(e): void {
    e.preventDefault()

    const visaRegEx = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
    if (!visaRegEx.test(this.orderData.creditCard)) {
      this.orderErrorObj = {
        isError: true,
        errorMsg: 'We only accept Visa card numbers (** 4 x x x x x x x x x x x x x x x ** x = Number)'
      }
      return
    }
    /* 
      Our course teacher (Yehuda yadid) instruct us:
      NOT TO SEND CREDIT CARD TO OUR PROJECT DATA BASE!!!
    */

    this.shopService.postNewOrder(this.orderData).subscribe(({ success, msg }) => {
      if (success) {
        this.router.navigate(['/conclusion']);
      } else if (!success) {
        this.orderErrorObj = {
          isError: true,
          errorMsg: msg
        }
      }
    });
  }

}
