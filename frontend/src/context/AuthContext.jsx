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
      // Fix: Skip the secondary fetch if the user object is already loaded
      if (!user) {
        fetchCurrentUser(token)
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [token]) 

  const fetchCurrentUser = async (currentToken) => {
    try {
      // Fix: Explicitly attach the header to bypass any Axios timing issues
      const { data } = await axiosInstance.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      })
      setUser({ id: data.id, username: data.username, email: data.email })
    } catch (err) {
      console.error("Session verification failed:", err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const { data } = await axiosInstance.post('/api/auth/login', credentials)
    const jwt = data.token
    const loggedInUser = { id: data.id, username: data.username, email: data.email }
    
    localStorage.setItem('token', jwt)
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    
    setUser(loggedInUser)
    setToken(jwt)
    
    toast.success(`Welcome back, ${data.username}!`)
    navigate('/dashboard')
  }

  const register = async (userData) => {
    const { data } = await axiosInstance.post('/api/auth/register', userData)
    const jwt = data.token
    const newUser = { id: data.id, username: data.username, email: data.email }
    
    localStorage.setItem('token', jwt)
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    
    setUser(newUser)
    setToken(jwt)
    
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