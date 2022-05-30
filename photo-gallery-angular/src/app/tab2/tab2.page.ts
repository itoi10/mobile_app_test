import { Component } from '@angular/core';

import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(public photoService: PhotoService) { }

  // servicesで定義したメソッドを呼び出し
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

}
