import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/Authentication/auth.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  passwordV: String = ''
  isFirstStep: Boolean = false

  citiesIsrael = ['Tel aviv', 'Jerusalem', 'Haifa', 'Risho letzion', 'Petah tikva', 'Ashdod', 'Natanya', 'Beer sheva', 'Bnei brak', 'Hulon']

  registrationData = {
    user_id: null,
    email: '',
    password: '',
    city: '',
    street: '',
    first_name: '',
    last_name: ''
  }
  errorObj = {
    isError: false,
    errorMsg: ''
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  firstStepValidation(e) {
    e.preventDefault()
    const { user_id, email, password } = this.registrationData

    if (password !== this.passwordV) {
      this.errorControl(true, 'False pass validation')
      return
    }
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

    this.authService.postRegisterFirstStep(user_id, email).subscribe(({ success, msg }) => {
      if (success) {
        this.isFirstStep = true
        this.errorControl(false, '')
      } else if (!success) {
        this.errorControl(true, msg)
      }
    });
  }

  submitRegistration(e) {
    e.preventDefault()
    this.errorControl(false, '')
    const { user_id, email } = this.registrationData
    // in case user change first step state
    this.authService.postRegisterFirstStep(user_id, email).subscribe(({ success, msg }) => {
      if (success) {
        this.authService.postRegisteration(this.registrationData).subscribe(({ success, msg }) => {
          if (success) {
            this.router.navigate(['/home']);
          } else if (!success) {
            this.errorControl(true, msg)
          }
        });
        this.errorControl(false, '')
      } else if (!success) {
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
}
