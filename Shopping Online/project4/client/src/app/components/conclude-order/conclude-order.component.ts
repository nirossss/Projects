import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../services/shop/shop.service'
import { AuthService } from '../../services/Authentication/auth.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-conclude-order',
  templateUrl: './conclude-order.component.html',
  styleUrls: ['./conclude-order.component.css']
})
export class ConcludeOrderComponent implements OnInit {
  isOrder: Boolean = false

  constructor(
    private shopService: ShopService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getOrderVerification().subscribe((data) => {
      if (data.success) {
        console.log(data);
        this.isOrder = true
        return
      } else if (!data.success) {
        this.router.navigate(['/home']);
        return
      }
    });
  }

  downloadReceipt(): void {
    this.shopService.getReceipt().subscribe((data) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.download = "WiStore_receipt.txt";
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      this.shopService.deleteReceipt().subscribe((data) => { }) // async way to delete the receipt after user completes his download
    })
  }
}
