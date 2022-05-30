import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  // カメラで撮影した写真の配列
  public photos: UserPhoto[] = [];

  constructor() { }

  // 撮影
  public async addNewToGallery() {
    // デバイスのカメラ
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    // 配列に写真追加
    this.photos.unshift({
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath
    });
  }
}

// 写真データを保存するためのクラス
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}