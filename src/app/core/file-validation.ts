export interface FileValidationOptions {
  maxFiles: number;
  maxFileMb: number;
  maxTotalMb: number;
  acceptedExtensions: string[];
}

export interface FileValidationResult {
  valid: boolean;
  message: string;
  fileNames: string[];
  totalKb: number;
}

export const HOMEWORK_FILE_RULES: FileValidationOptions = {
  maxFiles: 3,
  maxFileMb: 10,
  maxTotalMb: 25,
  acceptedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
};

export const DOCUMENT_FILE_RULES: FileValidationOptions = {
  maxFiles: 5,
  maxFileMb: 10,
  maxTotalMb: 25,
  acceptedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'ppt', 'pptx']
};

export function validateFiles(files: FileList | File[] | null, options: FileValidationOptions): FileValidationResult {
  const list = files ? Array.from(files) : [];
  if (list.length === 0) {
    return { valid: false, message: 'Ajoutez au moins un fichier.', fileNames: [], totalKb: 0 };
  }
  if (list.length > options.maxFiles) {
    return { valid: false, message: `Maximum ${options.maxFiles} fichiers autorisés.`, fileNames: list.map((file) => file.name), totalKb: 0 };
  }
  const totalBytes = list.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > options.maxTotalMb * 1024 * 1024) {
    return { valid: false, message: `La taille totale ne doit pas dépasser ${options.maxTotalMb} Mo.`, fileNames: list.map((file) => file.name), totalKb: Math.round(totalBytes / 1024) };
  }
  for (const file of list) {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!options.acceptedExtensions.includes(extension)) {
      return { valid: false, message: `Format refusé : ${file.name}. Formats acceptés : ${options.acceptedExtensions.join(', ').toUpperCase()}.`, fileNames: list.map((item) => item.name), totalKb: Math.round(totalBytes / 1024) };
    }
    if (file.size > options.maxFileMb * 1024 * 1024) {
      return { valid: false, message: `${file.name} dépasse ${options.maxFileMb} Mo.`, fileNames: list.map((item) => item.name), totalKb: Math.round(totalBytes / 1024) };
    }
  }
  return { valid: true, message: 'Fichiers valides.', fileNames: list.map((file) => file.name), totalKb: Math.round(totalBytes / 1024) };
}
