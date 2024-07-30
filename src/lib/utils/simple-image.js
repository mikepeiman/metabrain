// src/lib/editor/SimpleImage.js

export default class SimpleImage {
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.wrapper = undefined;
    this.settings = {
      buttonText: 'Select an Image',
      inputPlaceholder: 'Paste an image URL',
      dropzoneText: 'Drop an image here'
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('simple-image');

    if (this.data && this.data.url) {
      this._createImage(this.data.url);
      return this.wrapper;
    }

    this._createImageSelector();
    return this.wrapper;
  }

  _createImage(url) {
    const image = document.createElement('img');
    image.src = url;
    image.classList.add('simple-image__picture');

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(image);

    image.addEventListener('click', () => {
      this._createImageSelector();
    });
  }

  _createImageSelector() {
    this.wrapper.innerHTML = `
      <input type="text" placeholder="${this.settings.inputPlaceholder}" />
      <button type="button">${this.settings.buttonText}</button>
      <div class="simple-image__dropzone">${this.settings.dropzoneText}</div>
    `;

    const input = this.wrapper.querySelector('input');
    const button = this.wrapper.querySelector('button');
    const dropzone = this.wrapper.querySelector('.simple-image__dropzone');

    button.addEventListener('click', () => this.selectFile());
    input.addEventListener('paste', (event) => {
      this._pasted(event);
    });

    this.setupDragAndDrop(dropzone);
  }

  setupDragAndDrop(dropzone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('highlight');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('highlight');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      this._processFile(file);
    }, false);
  }

  selectFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      this._processFile(file);
    };
    input.click();
  }

  _processFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this._createImage(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  _pasted(event) {
    const pastedData = event.clipboardData || window.clipboardData;
    const pastedText = pastedData.getData('text');
    
    if (this._isURL(pastedText)) {
      this._createImage(pastedText);
    }
  }

  _isURL(str) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  save(blockContent) {
    const image = blockContent.querySelector('img');
    return {
      url: image ? image.src : ''
    };
  }
}