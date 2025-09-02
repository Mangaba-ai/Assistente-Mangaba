// Utilitários para manipulação de arquivos
import { APP_CONFIG } from '../constants'

// Tipos de arquivo
export type FileType = 'image' | 'document' | 'audio' | 'video' | 'text' | 'other'

// Informações do arquivo
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  extension: string
  category: FileType
}

// Obter informações do arquivo
export const getFileInfo = (file: File): FileInfo => {
  const extension = getFileExtension(file.name)
  const category = getFileCategory(file.type, extension)
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    extension,
    category
  }
}

// Obter extensão do arquivo
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : ''
}

// Categorizar arquivo por tipo MIME e extensão
export const getFileCategory = (mimeType: string, extension: string): FileType => {
  // Verificar por tipo MIME primeiro
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('text/')) return 'text'
  
  // Verificar por extensão
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
  const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt']
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  const textExts = ['txt', 'md', 'json', 'xml', 'csv', 'log', 'js', 'ts', 'html', 'css']
  
  if (imageExts.includes(extension)) return 'image'
  if (documentExts.includes(extension)) return 'document'
  if (audioExts.includes(extension)) return 'audio'
  if (videoExts.includes(extension)) return 'video'
  if (textExts.includes(extension)) return 'text'
  
  return 'other'
}

// Formatação de tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Validação de arquivo
export const validateFile = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { maxFileSize, supportedFileTypes } = APP_CONFIG
  
  // Verificar tamanho
  if (file.size > maxFileSize) {
    errors.push(`Arquivo muito grande. Máximo: ${formatFileSize(maxFileSize)}`)
  }
  
  // Verificar tipo
  if (!supportedFileTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não suportado: ${file.type}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Ler arquivo como texto
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

// Ler arquivo como Data URL
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Ler arquivo como Array Buffer
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

// Converter arquivo para Base64
export const fileToBase64 = async (file: File): Promise<string> => {
  const dataURL = await readFileAsDataURL(file)
  return dataURL.split(',')[1] // Remove o prefixo "data:type;base64,"
}

// Criar arquivo a partir de texto
export const createTextFile = (content: string, filename: string, mimeType = 'text/plain'): File => {
  const blob = new Blob([content], { type: mimeType })
  return new File([blob], filename, { type: mimeType })
}

// Baixar arquivo
export const downloadFile = (file: File | Blob, filename: string): void => {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Baixar texto como arquivo
export const downloadText = (content: string, filename: string, mimeType = 'text/plain'): void => {
  const file = createTextFile(content, filename, mimeType)
  downloadFile(file, filename)
}

// Baixar JSON como arquivo
export const downloadJSON = (data: any, filename: string): void => {
  const content = JSON.stringify(data, null, 2)
  downloadText(content, filename, 'application/json')
}

// Verificar se é imagem
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/') || getFileCategory(file.type, getFileExtension(file.name)) === 'image'
}

// Verificar se é documento
export const isDocumentFile = (file: File): boolean => {
  return getFileCategory(file.type, getFileExtension(file.name)) === 'document'
}

// Verificar se é arquivo de texto
export const isTextFile = (file: File): boolean => {
  return file.type.startsWith('text/') || getFileCategory(file.type, getFileExtension(file.name)) === 'text'
}

// Redimensionar imagem (se for imagem)
export const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error('Arquivo não é uma imagem'))
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Converter para blob e depois para file
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          reject(new Error('Erro ao redimensionar imagem'))
        }
      }, file.type, quality)
    }
    
    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}