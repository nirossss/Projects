import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/Authentication/auth.service'
import { ShopService } from '../../services/shop/shop.service'
import { AdminService } from '../../services/admin/admin.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  imageToUpload
  isEdit = false
  chosenCategory: String = 'All products'

  userData = {
    first_name: '',
    last_name: ''
  }
  editProductForm = {
    isNew: true,
    id: null,
    category_id: null,
    image: '',
    price: null,
    product_name: ''
  }
  adminErrorObj = {
    isError: false,
    errorMsg: ''
  }

  categories = []
  products = []
  filteredProducts = []

  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getAdminVerification().subscribe((data) => {
      if (data.success) {
        this.userData = data.user_data
        this.shopService.getProducts().subscribe(({ success, categoriesData, productsData }) => {
          this.categories = categoriesData
          this.products = productsData
          this.filteredProducts = productsData
        });
        return
      } else if (!data.success) {
        this.router.navigate(['/home']);
        return
      }
    });
  }

  backHomeAndImgCheck(): void {
    let { image, isNew, id } = this.editProductForm

    if (image.length > 0 && isNew) {
      // if admin change-url in a middle of creating new product
      // change image to new product before save
      // delete last image
      this.adminService.postImageUpdateDelete(isNew, image, '', id).subscribe(({ success, msg }) => { })
    }
    this.router.navigate(['/home']);
  }

  filterProductsByCategory(categoryId, categoryName): void {
    this.chosenCategory = categoryName
    const filteredProductsArr = this.products.filter(product => product.category_id == categoryId);
    this.filteredProducts = filteredProductsArr
  }

  showAllProducts(): void {
    this.chosenCategory = 'All products'
    this.filteredProducts = this.products
  }

  showSearchedProduct(e, input): void {
    e.preventDefault()
    this.chosenCategory = `Search results for ${input}`

    const filteredProductsArr = this.products.filter(product => product.product_name.toUpperCase().includes(input.toUpperCase()));
    this.filteredProducts = filteredProductsArr
  }

  handleImageUpload(files: FileList): void {
    let { image, isNew, id } = this.editProductForm
    this.imageToUpload = files.item(0);

    this.adminService.postImage(this.imageToUpload).subscribe(({ success, fileName }) => {
      if (success) {
        this.editProductForm.image = fileName
        if (image.length > 0 && isNew) {
          // change image to new product before save
          // delete last image
          this.adminService.postImageUpdateDelete(isNew, image, fileName, id).subscribe(({ success, msg }) => { })
        } else if (image.length > 0 && !isNew) {
          // change image to existing product
          // update existing product image before save and delete last image
          this.adminService.postImageUpdateDelete(isNew, image, fileName, id).subscribe(({ success, msg }) => { })
        }
      }
    });
  }

  closeForm(): void {
    let { image, isNew, id } = this.editProductForm

    if (image.length > 0 && isNew) {
      // if admin close form in a middle of creating new product
      // change image to new product before save
      // delete last image
      this.adminService.postImageUpdateDelete(isNew, image, '', id).subscribe(({ success, msg }) => {
        if (success) {
          this.clearForm
          return
        }
      })
    }
    this.clearForm()
  }

  openEditFormNew(): void {
    this.isEdit = true
    this.editProductForm.isNew = true
  }

  openEditFormUpdate(product): void {
    this.isEdit = true
    this.editProductForm = product
    this.editProductForm.isNew = false
  }

  handleEditedProductSubmit(e): void {
    e.preventDefault()
    this.errorControl(false, '')

    if (this.editProductForm.isNew) {
      this.adminService.postNewProduct(this.editProductForm).subscribe(({ success, product_id, msg }) => {
        if (success) {
          this.editProductForm.id = product_id
          this.products.push(this.editProductForm)
          this.clearForm()
        } else if (!success) {
          this.errorControl(true, msg)
        }
      });
    } else if (!this.editProductForm.isNew) {
      this.adminService.postNewProduct(this.editProductForm).subscribe(({ success, product_id, msg }) => {
        if (success) {
          this.clearForm()
        } else if (!success) {
          this.errorControl(true, msg)
        }
      });
    }
  }

  clearForm(): void {
    this.editProductForm = {
      isNew: true,
      id: null,
      category_id: null,
      image: '',
      price: null,
      product_name: ''
    }
    this.isEdit = false
  }

  errorControl(isErr, msg): void {
    this.adminErrorObj = {
      isError: isErr,
      errorMsg: msg
    }
  }
}
