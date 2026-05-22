import { z } from 'zod'

const optStr = z.string().optional().or(z.literal(''))

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Имя должно содержать не менее 2 символов' }).max(100).trim(),
  email: z.string().email({ message: 'Некорректный формат email' }).trim().toLowerCase(),
  phone: z.string().regex(/^[\d\s\-+()]{7,20}$/, { message: 'Некорректный формат номера' }).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, { message: 'Пароль должен содержать не менее 8 символов' })
    .regex(/[A-Za-zА-Яа-я]/, { message: 'Пароль должен содержать буквы' })
    .regex(/[0-9]/, { message: 'Пароль должен содержать цифры' }),
  role: z.enum(['BUYER', 'SELLER'], { message: 'Выберите роль' }),
  // Seller-specific
  businessType: z.enum(['SELF_EMPLOYED', 'IP', 'COMPANY']).optional().or(z.literal('')),
  companyName:  optStr,
  inn:          optStr,
  ogrn:         optStr,
  kpp:          optStr,
  legalAddress: optStr,
  bankAccount:  optStr,
  bankBik:      optStr,
  bankName:     optStr,
  bankCorrAccount: optStr,
})

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Некорректный формат email' })
    .trim()
    .toLowerCase(),
  password: z.string().min(1, { message: 'Введите пароль' }),
})

export const InnSchema = z.object({
  inn: z
    .string()
    .regex(/^\d{10}$|^\d{12}$/, {
      message: 'ИНН должен содержать 10 (юрлицо) или 12 (физлицо) цифр',
    }),
})

export type RegisterFormState = {
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    password?: string[]
    role?: string[]
    businessType?: string[]
    inn?: string[]
    bankAccount?: string[]
    bankBik?: string[]
    general?: string[]
  }
  success?: boolean
}

export type LoginFormState = {
  errors?: {
    email?: string[]
    password?: string[]
    general?: string[]
  }
  success?: boolean
}
