// Convert image to base64
export function toDataURL(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';

    image.onload = function () {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      context.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };

    image.src = src;
  });
}
