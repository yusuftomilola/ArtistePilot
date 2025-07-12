import { FileTypes } from '../enums/fileTypes.enum';

export interface UploadFile {
  name: string;
  path: string;
  type: FileTypes;
  mime: string;
  size: number;
}
