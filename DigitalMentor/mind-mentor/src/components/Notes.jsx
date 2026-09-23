import { useEffect, useState } from 'react'
import { File, MoreVertical, Plus, Trash2 } from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('mind_mentor_token')
}

function authHeaders() {
  const token = getToken()

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('mind_mentor_user') || '{}')
  } catch {
    return {}
  }
}

function NotesList({ notes, selectedNote, onSelectNote, onRefresh }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(event, noteId) {
    event.stopPropagation()
    setIsDeleting(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notes/${noteId}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      onRefresh()
    } catch (error) {
      console.error('Error deleting note:', error)

      const updatedNotes = notes.filter((note) => note._id !== noteId)
      onRefresh(updatedNotes)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-gray-500">
        <File className="mb-2 h-8 w-8" />
        <p>No notes yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note._id}
          className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition hover:bg-[#F5F1EA] ${
            selectedNote?._id === note._id ? 'bg-[#F5F1EA]' : ''
          }`}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex min-w-0 flex-1 items-center space-x-3">
            <File className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="truncate">
              {note.title || 'Untitled'}
            </span>
          </div>

          <button
            type="button"
            onClick={(event) => handleDelete(event, note._id)}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-gray-500 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function NoteEditor({ note, onSave, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(note?.title || 'Untitled')
  const [content, setContent] = useState(note?.content || '')

  useEffect(() => {
    if (note) {
      setTitle(note.title || 'Untitled')
      setContent(note.content || '')
    }
  }, [note])

  async function handleSave() {
    setLoading(true)

    try {
      const url = note?._id
        ? `${API_BASE_URL}/api/notes/${note._id}`
        : `${API_BASE_URL}/api/notes`

      const method = note?._id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      onSave()
    } catch (error) {
      console.error('Error saving note:', error)

      const fallbackNote = {
        _id: note?._id || `local-note-${Date.now()}`,
        title: title || 'Untitled',
        content,
        updatedAt: new Date().toISOString(),
      }

      const savedNotes = JSON.parse(
        localStorage.getItem('mind_mentor_notes') || '[]',
      )

      const nextNotes = note?._id
        ? savedNotes.map((item) =>
            item._id === note._id ? fallbackNote : item,
          )
        : [fallbackNote, ...savedNotes]

      localStorage.setItem(
        'mind_mentor_notes',
        JSON.stringify(nextNotes),
      )

      onSave(nextNotes)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Note title"
        className="w-full rounded-md border border-gray-400 bg-[#EFE9D5] px-3 py-2 text-xl font-bold text-[#27445d] outline-none focus:ring-2 focus:ring-[#497D74]"
      />

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Start writing your note here..."
        className="h-[calc(100vh-20rem)] w-full resize-none rounded-md border border-gray-400 bg-[#EFE9D5] p-4 text-base text-[#27445d] outline-none focus:ring-2 focus:ring-[#497D74]"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-medium text-[#27445d] hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-md border-2 border-black bg-[#c1ff72] px-4 py-2 text-sm font-medium text-[#27445d] shadow-[2px_2px_0_#000] hover:bg-[#b1ef62] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [loading, setLoading] = useState(true)

  function readLocalNotes() {
    try {
      const stored = JSON.parse(
        localStorage.getItem('mind_mentor_notes') || '[]',
      )

      return stored
    } catch {
      return []
    }
  }

  async function fetchNotes() {
    setLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notes`,
        {
          headers: authHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()

      const formattedNotes = data.map((note) => ({
        ...note,
        content: Array.isArray(note.content)
          ? note.content[0]?.content || ''
          : note.content || '',
      }))

      setNotes(formattedNotes)
      localStorage.setItem(
        'mind_mentor_notes',
        JSON.stringify(formattedNotes),
      )
    } catch {
      setNotes(readLocalNotes())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  function createNewNote() {
    setIsCreating(true)
    setSelectedNote(null)
    setShowSidebar(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#497D74] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="text-xl font-bold text-[#27445d] sm:text-2xl md:text-3xl">
          Notes
        </h1>

        <button
          type="button"
          onClick={createNewNote}
          className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#c1ff72] px-4 py-2 text-sm font-semibold text-[#27445d] shadow-[2px_2px_0_#000] hover:bg-[#b1ef62]"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-12">
        <div
          className={`${
            showSidebar ? 'block' : 'hidden'
          } md:block md:col-span-3`}
        >
          <div className="h-[calc(100vh-16rem)] overflow-y-auto rounded-lg border-2 border-black bg-[#F2EDE0] md:h-[calc(100vh-12rem)]">
            <div className="p-3 sm:p-4">
              <h3 className="text-lg font-semibold text-[#27445d] sm:text-xl">
                Your Notes
              </h3>
            </div>

            <div className="p-2 sm:p-4">
              <NotesList
                notes={notes}
                selectedNote={selectedNote}
                onSelectNote={(note) => {
                  setSelectedNote(note)
                  setShowSidebar(false)
                }}
                onRefresh={(updatedNotes) => {
                  if (updatedNotes) {
                    setNotes(updatedNotes)
                  } else {
                    fetchNotes()
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div
          className={`${
            showSidebar ? 'hidden' : 'block'
          } md:block md:col-span-9`}
        >
          <div className="h-[calc(100vh-16rem)] overflow-y-auto rounded-lg border-2 border-black bg-[#F2EDE0] md:h-[calc(100vh-12rem)]">
            <div className="p-4 sm:p-6">
              {isCreating || selectedNote ? (
                <NoteEditor
                  note={selectedNote}
                  onSave={(updatedNotes) => {
                    if (updatedNotes) {
                      setNotes(updatedNotes)
                    } else {
                      fetchNotes()
                    }

                    setIsCreating(false)
                    setSelectedNote(null)
                  }}
                  onCancel={() => {
                    setIsCreating(false)
                    setSelectedNote(null)
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <File className="mb-2 h-8 w-8 sm:h-12 sm:w-12" />
                  <p className="text-center text-sm sm:text-base">
                    Select a note or create a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}