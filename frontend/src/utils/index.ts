// Utilitários principais
export * from './api'
export * from './auth'
export * from './chat'
export * from './storage'
export * from './theme'
export * from './constants'

// Exportações específicas para evitar conflitos
export {
  formatDate as formatDateUtil,
  formatTime,
  formatDateTime,
  formatRelativeTime as formatRelativeTimeUtil,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isBefore,
  isAfter,
  isBetween,
  getWeekDays,
  getMonthDays,
  getDayName,
  getMonthName,
  parseDate,
  isValidDate,
  getTimezone,
  convertToTimezone
} from './date'

export {
  formatDate as formatDateString,
  formatRelativeTime as formatRelativeTimeString,
  formatFileSize as formatFileSizeString,
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  generateId,
  formatId,
  formatUrl,
  extractDomain,
  hexToRgb,
  rgbToHex
} from './format'

export {
  type FileInfo,
  getFileInfo,
  getFileExtension,
  getFileCategory,
  formatFileSize as formatFileSizeBytes,
  validateFile as validateFileUpload,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  fileToBase64,
  createTextFile,
  downloadFile,
  downloadText,
  downloadJSON,
  isImageFile,
  isDocumentFile,
  isTextFile,
  resizeImage
} from './file'

export {
  type ValidationRule,
  type ValidationResult,
  Validator,
  ValidationRules,
  validateHubName,
  validateHubDescription,
  validateAgentName,
  validateAgentDescription,
  validateAgentInstructions,
  validateUsername,
  validateEmail,
  validatePassword,
  validateChatMessage,
  validateChatTitle,
  validateFile as validateFileData,
  validateForm
} from './validation'