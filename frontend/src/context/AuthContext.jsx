import React, { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axios'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchCurrentUser = async () => {
    try {
      const { data } = await axiosInstance.get('/api/auth/me')
      setUser(data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const { data } = await axiosInstance.post('/api/auth/login', credentials)
    const { token: jwt, user: userData } = data
    localStorage.setItem('token', jwt)
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    setToken(jwt)
    setUser(userData)
    toast.success(`Welcome back, ${userData.firstName}!`)
    navigate('/dashboard')
  }

  const register = async (userData) => {
    const { data } = await axiosInstance.post('/api/auth/register', userData)
    const { token: jwt, user: newUser } = data
    localStorage.setItem('token', jwt)
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    setToken(jwt)
    setUser(newUser)
    toast.success('Account created successfully!')
    navigate('/dashboard')
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    delete axiosInstance.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}