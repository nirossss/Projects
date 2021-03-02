import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/Authentication/auth.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  homeStats = {
    orders_placed: null,
    available_products: null
  }
  userStatus = {
    msg: '',
    isNewCart: false
  }
  userData = {
    first_name: '',
    last_name: ''
  }
  errorObj = {
    isError: false,
    errorMsg: ''
  }

  isLogin: boolean = false

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getOredersProductsAmount().subscribe(({ success, orders_placed, available_products }) => {
      this.homeStats = {
        orders_placed: orders_placed,
        available_products: available_products
      }
    });
  }

  connectAccount(e, email, password): void {
    e.preventDefault()
    this.errorControl(false, '')

    if (!email.trim() || !password.trim()) {
      this.errorControl(true, 'Missing fields.')
      return
    } else if (!email.includes('@') || !email.includes('.')) {
      this.errorControl(true, 'Incorrect email syntax.')
      return
    } else if (password.length > password.trim().length) {
      this.errorControl(true, 'White spaces used befor or after input.')
      return
    }

    this.authService.postLogin(email, password).subscribe(({ success, msg, data, newCart }) => {
      if (success) {
        if (msg === 'admin') {
          this.router.navigate(['/admin']);
        }
        this.userData = data
        this.userStatus = {
          msg: msg,
          isNewCart: newCart
        }
        this.isLogin = true
      } else if (!success) {
        if (msg === 'The user is not Registered') {
          this.router.navigate(['/register']);
          return
        }
        this.errorControl(true, msg)
      }
    });
  }

  errorControl(isErr, msg): void {
    this.errorObj = {
      isError: isErr,
      errorMsg: msg
    }
  }

  goShopping(): void {
    this.router.navigate(['/shop']);
  }
}
