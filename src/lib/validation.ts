export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class Validator {
  static validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = []

    // Required check
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required')
      return { isValid: false, errors }
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return { isValid: true, errors: [] }
    }

    const stringValue = value.toString()

    // Min length check
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters`)
    }

    // Max length check
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters`)
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push('Invalid format')
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        errors.push(customError)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateForm(data: Record<string, any>, schema: Record<string, ValidationRule>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    for (const [field, rules] of Object.entries(schema)) {
      results[field] = this.validate(data[field], rules)
    }

    return results
  }

  static hasErrors(results: Record<string, ValidationResult>): boolean {
    return Object.values(results).some(result => !result.isValid)
  }

  static getAllErrors(results: Record<string, ValidationResult>): string[] {
    return Object.values(results)
      .flatMap(result => result.errors)
  }
}

// Common validation schemas
export const validationSchemas = {
  car: {
    make: { required: true, minLength: 2, maxLength: 50 },
    model: { required: true, minLength: 2, maxLength: 50 },
    year: {
      required: true,
      custom: (value: any) => {
        const year = parseInt(value)
        const currentYear = new Date().getFullYear()
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          return `Year must be between 1900 and ${currentYear + 1}`
        }
        return null
      }
    },
    image_url: { required: true }
  },

  marketplaceListing: {
    title: { required: true, minLength: 3, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    price: {
      required: true,
      custom: (value: any) => {
        const price = parseFloat(value)
        if (isNaN(price) || price <= 0) {
          return 'Price must be a positive number'
        }
        return null
      }
    },
    condition: { required: true },
    location: { required: true, minLength: 2, maxLength: 100 }
  },

  forumPost: {
    title: { required: true, minLength: 3, maxLength: 200 },
    content: { required: true, minLength: 10, maxLength: 5000 },
    brand: { required: true }
  },

  meet: {
    title: { required: true, minLength: 3, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    date: {
      required: true,
      custom: (value: any) => {
        const date = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date < today) {
          return 'Date cannot be in the past'
        }
        return null
      }
    },
    time: { required: true },
    location_city: { required: true, minLength: 2, maxLength: 50 },
    location_state: { required: true, minLength: 2, maxLength: 50 }
  },

  user: {
    username: { required: true, minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: any) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address'
        }
        return null
      }
    },
    password: { required: true, minLength: 6, maxLength: 128 }
  }
}

// Convenience functions
export const validateCar = (data: any) => Validator.validateForm(data, validationSchemas.car)
export const validateMarketplaceListing = (data: any) => Validator.validateForm(data, validationSchemas.marketplaceListing)
export const validateForumPost = (data: any) => Validator.validateForm(data, validationSchemas.forumPost)
export const validateMeet = (data: any) => Validator.validateForm(data, validationSchemas.meet)
export const validateUser = (data: any) => Validator.validateForm(data, validationSchemas.user) 