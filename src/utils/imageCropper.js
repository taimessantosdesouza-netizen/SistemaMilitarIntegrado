export const createCroppedEvidence = (dataUrl, zoom = 1) =>
  new Promise((resolve, reject) => {
    if (!dataUrl) return resolve(null);
    const image = new Image();
    image.onload = () => {
      const aspect = 16 / 9;
      const baseWidth = Math.min(image.width, image.height * aspect);
      const baseHeight = baseWidth / aspect;
      const sourceWidth = baseWidth / zoom;
      const sourceHeight = baseHeight / zoom;
      const sx = (image.width - sourceWidth) / 2;
      const sy = (image.height - sourceHeight) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
