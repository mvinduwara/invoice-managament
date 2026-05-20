import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiZap, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName:   z.string().min(2, 'First name must be at least 2 characters'),
  lastName:    z.string().min(2, 'Last name must be at least 2 characters'),
  email:       z.string().email('Please enter a valid email'),
  companyName: z.string().optional(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function Register() {
  const { register: registerUser } = useAuth()
  const [showPass, setShowPass]    = useState(false)
  const [loading, setLoading]      = useState(false)

  const {
    register, handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = data
      await registerUser(payload)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 
                        bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 
                          bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <FiZap size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Create Account</h1>
          <p className="text-slate-400 mt-2">Start managing your invoices today</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="form-label">First Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    {...register('firstName')}
                    placeholder="John"
                    className={`form-input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="form-label">Last Name <span className="text-red-400">*</span></label>
                <input
                  {...register('lastName')}
                  placeholder="Doe"
                  className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email <span className="text-red-400">*</span></label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="form-label">Company Name</label>
              <div className="relative">
                <FiBriefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('companyName')}
                  placeholder="Your Company Ltd."
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 
                             hover:text-slate-300"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password <span className="text-red-400">*</span></label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Repeat your password"
                className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}