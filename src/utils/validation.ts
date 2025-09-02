// Utilitários de validação
import { VALIDATION_CONFIG } from '../constants'

// Tipos para validação
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  test: (value: any) => boolean
  message: string
}

// Validador genérico
export class Validator {
  private rules: ValidationRule[] = []

  addRule(rule: ValidationRule): Validator {
    this.rules.push(rule)
    return this
  }

  validate(value: any): ValidationResult {
    const errors: string[] = []
    
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        errors.push(rule.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static create(): Validator {
    return new Validator()
  }
}

// Regras de validação comuns
export const ValidationRules = {
  required: (message = 'Campo obrigatório'): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.length >= min,
    message: message || `Mínimo de ${min} caracteres`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.length <= max,
    message: message || `Máximo de ${max} caracteres`
  }),

  email: (message = 'Email inválido'): ValidationRule => ({
    test: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return typeof value === 'string' && emailRegex.test(value)
    },
    message
  }),

  url: (message = 'URL inválida'): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message
  }),

  pattern: (regex: RegExp, message = 'Formato inválido'): ValidationRule => ({
    test: (value) => typeof value === 'string' && regex.test(value),
    message
  }),

  numeric: (message = 'Deve ser um número'): ValidationRule => ({
    test: (value) => !isNaN(Number(value)),
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    test: (value) => Number(value) >= min,
    message: message || `Valor mínimo: ${min}`
  }),

  max: (max: number, message?: string): ValidationRule => ({
    test: (value) => Number(value) <= max,
    message: message || `Valor máximo: ${max}`
  }),

  oneOf: (options: any[], message?: string): ValidationRule => ({
    test: (value) => options.includes(value),
    message: message || `Deve ser um dos valores: ${options.join(', ')}`
  })
}

// Validadores específicos da aplicação
export const validateHubName = (name: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.required('Nome do hub é obrigatório'))
    .addRule(ValidationRules.minLength(VALIDATION_CONFIG.hub.nameMinLength))
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.hub.nameMaxLength))
    .validate(name)
}

export const validateHubDescription = (description: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.hub.descriptionMaxLength))
    .validate(description)
}

export const validateAgentName = (name: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.required('Nome do agente é obrigatório'))
    .addRule(ValidationRules.minLength(VALIDATION_CONFIG.agent.nameMinLength))
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.agent.nameMaxLength))
    .validate(name)
}

export const validateAgentDescription = (description: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.agent.descriptionMaxLength))
    .validate(description)
}

export const validateAgentInstructions = (instructions: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.agent.instructionsMaxLength))
    .validate(instructions)
}

export const validateUsername = (username: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.required('Nome de usuário é obrigatório'))
    .addRule(ValidationRules.minLength(VALIDATION_CONFIG.user.usernameMinLength))
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.user.usernameMaxLength))
    .addRule(ValidationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e underscore'))
    .validate(username)
}

export const validateEmail = (email: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.required('Email é obrigatório'))
    .addRule(ValidationRules.email())
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.user.emailMaxLength))
    .validate(email)
}

export const validatePassword = (password: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.required('Senha é obrigatória'))
    .addRule(ValidationRules.minLength(VALIDATION_CONFIG.user.passwordMinLength))
    .validate(password)
}

export const validateChatMessage = (message: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.required('Mensagem não pode estar vazia'))
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.chat.messageMaxLength))
    .validate(message)
}

export const validateChatTitle = (title: string): ValidationResult => {
  return Validator.create()
    .addRule(ValidationRules.maxLength(VALIDATION_CONFIG.chat.titleMaxLength))
    .validate(title)
}

// Validação de arquivos
export const validateFile = (file: File, maxSize: number, allowedTypes: string[]): ValidationResult => {
  const errors: string[] = []

  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não suportado: ${file.type}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validação de formulários
export const validateForm = (data: Record<string, any>, validators: Record<string, (value: any) => ValidationResult>): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {}
  let isValid = true

  for (const [field, validator] of Object.entries(validators)) {
    const result = validator(data[field])
    if (!result.isValid) {
      errors[field] = result.errors
      isValid = false
    }
  }

  return { isValid, errors }
}