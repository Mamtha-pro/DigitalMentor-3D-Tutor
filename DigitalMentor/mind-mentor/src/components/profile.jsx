import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Avatar({ name }) {
  const firstLetter = name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F2EDE0] text-xl font-semibold text-[#27445D]">
      {firstLetter}
    </div>
  )
}

function Button({
  children,
  type = 'button',
  variant = 'default',
  disabled = false,
  onClick,
}) {
  const styles =
    variant === 'outline'
      ? 'border-2 border-black bg-white text-[#27445D] hover:bg-[#F2EDE0]'
      : 'border-2 border-black bg-[#c1ff72] text-[#27445D] shadow-[2px_2px_0_#000] hover:bg-[#b1ef62]'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {children}
    </button>
  )
}

export default function Profile({ user, onUserUpdated }) {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: user?.name || 'Mamatha Rai',
    email: user?.email || 'mamatharai70@gmail.com',
  })

  useEffect(() => {
    setFormData({
      name: user?.name || 'Mamatha Rai',
      email: user?.email || 'mamatharai70@gmail.com',
    })
  }, [user])
  useEffect(() => {
  async function loadProfile() {
    try {
      const token = localStorage.getItem('mind_mentor_token')

      if (!token) return

      const response = await fetch(
        `${API_BASE_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json()

      if (data.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
        })

        if (onUserUpdated) {
          onUserUpdated(data.user)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  loadProfile()
}, [onUserUpdated])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const token = localStorage.getItem('mind_mentor_token')

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()

      setMessage(data.message || 'Profile updated successfully')
      setIsEditing(false)

      if (data.user && onUserUpdated) {
        onUserUpdated(data.user)
      }
    } catch (submitError) {
      console.error('Error updating profile:', submitError)

      /*
       * Temporary frontend behavior while Spring Boot is not connected.
       * Remove this fallback after your backend is ready.
       */
      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        email: formData.email,
      }

      localStorage.setItem(
        'mind_mentor_user',
        JSON.stringify(updatedUser),
      )

      if (onUserUpdated) {
        onUserUpdated(updatedUser)
      }

      setMessage('Profile updated successfully')
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="overflow-hidden rounded-lg border-2 border-black bg-[#F2EDE0]">
        <div className="border-b-2 border-black p-6">
          <div className="flex items-center gap-4">
            <Avatar name={formData.name} />

            <div>
              <h1 className="text-2xl font-bold text-[#27445D]">
                {formData.name}
              </h1>

              <p className="text-sm text-gray-500">
                {formData.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-4 rounded-md border border-[#497D74] bg-[#D5EBE7] px-4 py-3 text-sm text-[#27445D]">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-[#27445D]"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border-2 border-[#27445D] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c1ff72]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#27445D]"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  onChange={handleChange}
                  className="mt-1 w-full cursor-not-allowed rounded-md border-2 border-[#27445D] bg-gray-100 px-3 py-2 text-sm text-gray-500"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => {
                setMessage('')
                setError('')
                setIsEditing(true)
              }}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}