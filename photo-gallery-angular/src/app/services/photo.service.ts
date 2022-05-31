import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { Platform } from '@ionic/angular'
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  // カメラで撮影した写真の配列
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  // 撮影
  public async addNewToGallery() {
    // デバイスのカメラ
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100 // highest quality (0 to 100)
    });
    // 写真の保存、配列に追加
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    // Storage APIで写真配列を保存
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  public async loadSaved() {
    // Storage APIで写真配列を読み込み
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photoList.value) || [];

    // Webプラットフォームの場合
    if (!this.platform.is('hybrid')) {
      // 写真をbase64で読み込んで表示
      for (let photo of this.photos) {
        // ファイルシステムから各写真データを読み込み
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        // Webプラットフォームのみ、写真をbase64として読み込む
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  // 画像を端末のファイルに保存する
  private async savePicture(photo: Photo) {
    // Filesystem APIで穂zんするために写真をbase64に変換
    const base64Data = await this.readAsBase64(photo);

    // ディレクトリにファイル保存
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    // Cordova または Capacitor が動作しているデバイス
    if (this.platform.is('hybrid')) {
      // 'file://'のパスをHTTPに書き換えて新しい画像を表示する
      // 参考 https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      // 新しく撮影した画像は既にメモリに読み込まれているので、base64の代わりにwebPathを使用して表示する
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  }

  private async readAsBase64(photo: Photo) {
    // Cordova または Capacitor が動作しているデバイス
    if (this.platform.is('hybrid')) {
      // FilesystemのreadFileメソッドで写真をbase64で読み取る
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      // 写真を取得しblobとして読み込み、base64に変換する
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async deletePicture(photo: UserPhoto, position: number) {
    // 写真配列から削除
    this.photos.splice(position, 1);

    // ストレージの写真配列を更新
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    // ファイルシステムから写真ファイルを削除
    const filename = photo.filepath
      .substr(photo.filepath.lastIndexOf('/') + 1);

    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    });
  }
}

// 写真データを保存するためのクラス
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}