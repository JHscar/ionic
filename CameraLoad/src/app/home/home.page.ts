import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Platform, LoadingController } from '@ionic/angular';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';

import domtoimage from 'dom-to-image';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pdfObj = null;

  @ViewChild('imageCanvas', { static: false }) canvas: any;

  imgtest;
  myname;
  phone;
  convertimg;


  // tslint:disable-next-line:variable-name
  ph_num: number;
  name: string;

  imageData: string;
  @Input() useURI = true;

  constructor(
    private plt: Platform,
    private camera: Camera,
    private webview: WebView,
    private base64ToGallery: Base64ToGallery,
    private file: File,
    private fileOpener: FileOpener,
    public loadingCtrl: LoadingController
  ) {

  }

  ngOninit() {
  }

  //
  getPicture(srcType: number) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.useURI ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: srcType,
      targetWidth: 800,
      targetHeight: 800
    };

    this.camera.getPicture(options).then((image) => {
      if (this.useURI) {
        this.imageData = this.webview.convertFileSrc(image);
        console.log('on', image);
        console.log('imageData:', this.imageData);
      } else {
        this.imageData = 'data:image/jpeg;base64,' + this.imageData;
        console.log('off', image);
        console.log('imageData:', this.imageData);
      }
    }, (err) => {
      console.log(err);
    });
  }

  getinfo() {
    console.log(this.myname);
    console.log(this.phone);
    this.name = this.myname;
    this.ph_num = this.phone;
  }

  convertIMG() {
    const divimg = this.canvas.nativeElement;
    domtoimage.toPng(divimg).then((dataurl) => {
      this.convertimg = dataurl;
      console.log(dataurl);
    });
  }

  async presentLoading(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg
    });
    return await loading.present();
  }

  exportPdf() {
    // this.presentLoading('Creating PDF file...');
    // const divpdf = this.canvas.nativeElement;

    const docDefinition = {
      content: [
        { image: this.convertimg }
      ]
    };
    this.pdfObj = pdfMake.createPdf(docDefinition);
    // console.log(divpdf);
  }

  downloadPdf() {
    if (this.plt.is('cordova')) {
      this.pdfObj.getBuffer((buffer) => {
        const utf8 = new Uint8Array(buffer);
        const binaryArray = utf8.buffer;
        const blob = new Blob([binaryArray], { type: 'application/pdf' });
        this.file.writeFile(this.file.dataDirectory, 'myImg.pdf', blob, { replace: true }).then(fileEntry => {
          this.fileOpener.open(this.file.dataDirectory + 'myImg.pdf', 'application/pdf');
          console.log(fileEntry);
          console.log(this.file.dataDirectory);
        });
      });
    } else {
      this.pdfObj.download();
    }
  }

}
