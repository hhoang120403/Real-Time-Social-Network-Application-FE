import { updatePostItem } from '@redux/reducers/post/post.reducer';
import type { AppDispatch } from '@redux/store';
import { Utils } from '@services/utils/utils.service';

export class ImageUtils {
  static validateFile(file: File, type: string) {
    if (type === 'image') {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      return file && validImageTypes.indexOf(file.type) > -1;
    } else {
      const validVideoTypes = ['video/m4v', 'video/avi', 'video/mpg', 'video/mp4', 'video/webm'];
      return file && validVideoTypes.indexOf(file.type) > -1;
    }
  }

  static checkFileSize(file: File, type: string) {
    let fileError = '';
    const isValid = ImageUtils.validateFile(file, type);
    if (!isValid) {
      fileError = `File ${file.name} not accepted`;
    }
    if (file.size > 50000000) {
      // 50 MB
      fileError = 'File is too large.';
    }
    return fileError;
  }

  static checkFile(file: File, type: string, dispatch?: AppDispatch) {
    if (!ImageUtils.validateFile(file, type)) {
      const msg = `File ${file.name} not accepted`;
      if (dispatch) Utils.dispatchNotification(msg, 'error', dispatch);
      else window.alert(msg);
      return false;
    }
    const fileSizeError = ImageUtils.checkFileSize(file, type);
    if (fileSizeError) {
      if (dispatch) Utils.dispatchNotification(fileSizeError, 'error', dispatch);
      else window.alert(fileSizeError);
      return false;
    }
    return true;
  }

  static async addFileToRedux(
    event: React.ChangeEvent<HTMLInputElement>,
    post: string,
    setSelectedImage: (image: File) => void,
    dispatch: AppDispatch,
    type: string
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    const ok = ImageUtils.checkFile(file, type);
    if (!ok) return;
    setSelectedImage(file);
    dispatch(
      updatePostItem({
        image: type === 'image' ? URL.createObjectURL(file) : '',
        video: type === 'video' ? URL.createObjectURL(file) : '',
        gifUrl: '',
        imgId: '',
        imgVersion: '',
        videoId: '',
        videoVersion: '',
        post
      })
    );
  }

  static readAsBase64(file: File): Promise<string> {
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  static getBackgroundImageColor(imageUrl: string) {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    const backgroundImageColor = new Promise((resolve, _reject) => {
      image.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context?.drawImage(image, 0, 0);

        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        const params = imageData?.data;
        const bgColor = ImageUtils.convertRGBToHex(params![0], params![1], params![2]);
        resolve(bgColor);
      });

      image.src = imageUrl;
    });
    return backgroundImageColor;
  }

  static convertRGBToHex(red: any, green: any, blue: any) {
    red = red.toString(16);
    green = green.toString(16);
    blue = blue.toString(16);

    red = red.length === 1 ? '0' + red : red;
    green = green.length === 1 ? '0' + green : green;
    blue = blue.length === 1 ? '0' + blue : blue;
    return `#${red}${green}${blue}`;
  }
}
