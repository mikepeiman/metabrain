// src/lib/editor/SimpleImage.js
import { toast } from "svelte-sonner";

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
      this._createImage(this.data.url, true);
      return this.wrapper;
    }

    this._createImageSelector();
    return this.wrapper;
  }

  _createImage(url, isInitialRender = false) {
    const image = document.createElement('img');
    image.src = url;
    image.classList.add('simple-image__picture');

    const input = document.createElement('input');
    input.value = url;
    input.classList.add('simple-image__url');
    input.addEventListener('click', () => input.select());
    input.addEventListener('change', () => this._handleUrlChange(input.value));

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(image);
    this.wrapper.appendChild(input);

    if (!isInitialRender) {
      image.classList.add('simple-image__picture--preview');
    }

    image.addEventListener('click', () => {
      image.classList.toggle('simple-image__picture--preview');
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
    input.addEventListener('change', () => this._handleUrlChange(input.value));

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
    
    this._handleUrlChange(pastedText);
  }

  _handleUrlChange(url) {
    if (this._isValidImageUrl(url)) {
      this._createImage(url);
    } else {
      toast.error("Invalid image URL", {
        description: "Please enter a valid image URL",
      });
    }
  }

  _isValidImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  save(blockContent) {
    const image = blockContent.querySelector('img');
    const input = blockContent.querySelector('input');
    return {
      url: image ? image.src : (input ? input.value : '')
    };
  }
}