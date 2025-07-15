import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  avatar?: string
  farmDetails?: {
    farmSize: number
    location: {
      state: string
      district: string
      village: string
    }
    soilType: string
    primaryCrops: string[]
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

// Set up axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      set({ token, user, isLoading: false })
      toast.success('Login successful!')
      
    } catch (error: any) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true })
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData)

      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      set({ token, user, isLoading: false })
      toast.success('Registration successful!')
      
    } catch (error: any) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({ user: null, token: null })
    toast.success('Logged out successfully')
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get(`${API_BASE_URL}/auth/me`)
      
      set({ user: response.data.user, token })
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      set({ user: null, token: null })
    }
  },
}))