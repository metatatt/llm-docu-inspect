export class CheckResult {
    constructor() {
      this._id = '';
      this._imageBlob = null;
      this._boxLoc = '';
      this._isQRCode = false;
      this._isTarget = false;
      this._qrCodeContent = '';
      this._result = {
        time: '',
        tag: '',
        probability: '',
        boundingBox: null,
      };

          // Initialize the checkWorker and add event listener
       this.cvWorker = new Worker('./lib/cvTextWorker.js');
        this.cvWorker.addEventListener('message', event => {
        this.showCVResult(event.data);
        });
    }
  
    reqeustCvService(imageBlob, cvServiceCredentials){
      console.log('cv cred', cvServiceCredentials)
      this._imageBlob = imageBlob
      const content = {
        imageBlob: imageBlob,
        cvServiceCredentials: cvServiceCredentials,
      };
      console.log('cvResult**1')
      this.cvWorker.postMessage(content)
    }
    
    showCVResult(ocrResult) {
      let textContent = "";
    
      if (ocrResult.regions && Array.isArray(ocrResult.regions)) {
        for (const region of ocrResult.regions) {
          for (const line of region.lines) {
            const lineWords = line.words.map(word => word.text).join(' ');
            textContent += lineWords + '\n';
          }
        }
      }
    
      console.log('Extracted text', textContent);
    
      // Assign the extracted text
      Object.assign(this._result, { text: textContent });
    
      console.log('cvResult**2');
      const event = new Event('cvResultReady');
      window.dispatchEvent(event);
    }
    
    
    
}

  