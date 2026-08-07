export interface UploadedSimpleFile {
  path: string;
  size: number;
}

export interface IUploadProvider {
  uploadSimple(path: string): Promise<UploadedSimpleFile>;
  uploadFile(file: Express.Multer.File): Promise<any>;
  removeFile(filePath: string): Promise<void>;
}
