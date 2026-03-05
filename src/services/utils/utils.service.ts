import { avatarColors } from './static.data';
import { floor, random } from 'lodash';

export class Utils {
  static avatarColor() {
    return avatarColors[floor(random(0.9) * avatarColors.length)];
  }

  static generateAvatarImage(text: string, backgroundColor: string, textColor: string = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return '';

    canvas.width = 200;
    canvas.height = 200;

    // Fill background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = 'bold 80px sans-serif';
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  }
}
