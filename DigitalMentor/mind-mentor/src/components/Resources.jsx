import { useEffect, useState } from 'react'
import {
  ExternalLink,
  Globe,
  Loader2,
  Search,
  Trash2,
} from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ITEMS_PER_PAGE = 5

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem('mind_mentor_user') || '{}',
    )
  } catch {
    return {}
  }
}

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

function sampleResources(subject) {
  return {
    _id: `local-resource-${Date.now()}`,
    topic: subject,
    lastUpdated: new Date().toISOString(),
    resources: [
      {
        _id: `${Date.now()}-1`,
        title: `${subject} - Official Documentation`,
        description: `Read the official documentation and learn the core concepts of ${subject}.`,
        type: 'Documentation',
        link: `https://www.google.com/search?q=${encodeURIComponent(
          `${subject} official documentation`,
        )}`,
      },
      {
        _id: `${Date.now()}-2`,
        title: `${subject} - Beginner Course`,
        description: `Find beginner-friendly lessons and tutorials to start learning ${subject}.`,
        type: 'Course',
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${subject} tutorial`,
        )}`,
      },
      {
        _id: `${Date.now()}-3`,
        title: `${subject} - Practice Resources`,
        description: `Practice important concepts and improve your understanding of ${subject}.`,
        type: 'Practice',
        link: `https://www.google.com/search?q=${encodeURIComponent(
          `${subject} practice exercises`,
        )}`,
      },
    ],
  }
}

function ResourceCurator({ onResourcesCreated }) {
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!subject.trim()) {
      setError('Please enter a subject')
      return
    }

    setLoading(true)

    try {
      const user = getUser()

      const response = await fetch(
        `${API_BASE_URL}/curate-resources`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            userId: user.id || 'demo-user',
            subject: subject.trim(),
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        if (data.error === 'RESOURCE_EXISTS') {
          setError(
            data.message ||
              'Resources for this subject already exist. Please check the existing resources.',
          )
          return
        }

        throw new Error(
          data.message || 'Failed to create resources',
        )
      }

      const data = await response.json()

      const resourceGroup = {
        _id: data._id || `resource-${Date.now()}`,
        topic: data.topic || subject.trim(),
        lastUpdated:
          data.lastUpdated || new Date().toISOString(),
        resources: data.resources || [],
      }

      onResourcesCreated(resourceGroup)
      setSubject('')
    } catch (requestError) {
      console.error('Error creating resources:', requestError)

      /*
       * Temporary frontend fallback.
       * This allows the UI to work before Spring Boot is connected.
       */
      const localResourceGroup = sampleResources(subject.trim())

      onResourcesCreated(localResourceGroup)
      setSubject('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full rounded-xl border-2 border-b-4 border-r-4 border-black bg-[#F2EDE0] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:gap-4"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter a topic to find learning resources..."
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value)
                setError('')
              }}
              className={`w-full rounded-xl border-2 bg-white p-6 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-[#c1ff72] sm:text-lg ${
                error ? 'border-red-500' : 'border-black'
              }`}
            />

            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !subject.trim()}
            className="mt-1 inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#c1ff72] px-8 py-4 text-base font-semibold text-gray-800 shadow-[3px_3px_0_#000] transition hover:bg-[#b1ef62] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Resources'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function StoredResources({ resource, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formattedDate = resource.lastUpdated
    ? new Date(resource.lastUpdated).toLocaleDateString()
    : 'Date not available'

  async function handleDelete() {
    const confirmed = window.confirm(
      'This action cannot be undone. This will permanently delete these curated resources.',
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      await fetch(
        `${API_BASE_URL}/curate-resources/${resource._id}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        },
      )
    } catch {
      // Local UI deletion still works before backend integration.
    } finally {
      onDelete(resource._id)
      setIsDeleting(false)
    }
  }

  return (
    <div className="mt-4 w-full rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#000] sm:mt-8">
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="break-words text-xl font-bold sm:text-2xl">
            Resources for {resource.topic}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-gray-400 px-3 py-1 text-sm">
              {formattedDate}
            </span>

            <span className="rounded-full border border-gray-400 px-3 py-1 text-sm">
              {resource.resources.length} Resources
            </span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-red-600 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 sm:w-auto"
        >
          <Trash2 size={16} />
          {isDeleting ? 'Deleting...' : 'Delete Resources'}
        </button>
      </div>

      <div className="border-t border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {resource.resources.map((item) => (
            <div
              key={item._id || item.link}
              className="rounded-lg border border-gray-300 bg-[#F2EDE0] p-4 sm:p-6"
            >
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <h4 className="break-words text-base font-semibold sm:text-lg">
                  {item.title}
                </h4>

                <span className="rounded-full bg-[#497D74] px-3 py-1 text-xs text-white sm:text-sm">
                  {item.type}
                </span>
              </div>

              <p className="mt-4 break-words text-xs text-gray-600 sm:text-sm">
                {item.description}
              </p>

              <button
                onClick={() => window.open(item.link, '_blank')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-black bg-white px-4 py-2 text-sm transition hover:bg-gray-100 sm:text-base"
              >
                Visit Resource
                <ExternalLink size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WebSearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchData, setSearchData] = useState(null)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/web-search`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          query: query.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not complete web search')
      }

      const data = await response.json()
      setSearchData(data)
    } catch (requestError) {
      console.error('Search failed:', requestError)
      setError('Could not complete web search. Please try again.')
      setSearchData(null)
    } finally {
      setLoading(false)
    }
  }

  function getDomainFromUrl(url) {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className="w-full">
      <div className="w-full rounded-xl border-2 border-b-4 border-r-4 border-black bg-[#E8F0FE] p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Web Search
            </h3>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <input
              type="text"
              placeholder="Search the web for any topic..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full flex-1 rounded-xl border-2 border-black bg-white p-6 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-300 sm:text-lg"
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-blue-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Web
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      {searchData && (
        <div className="mt-6 space-y-4">
          {searchData.answer && (
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5">
              <h3 className="mb-2 font-semibold text-blue-800">
                AI Answer
              </h3>

              <p className="text-sm text-gray-700">
                {searchData.answer}
              </p>
            </div>
          )}

          {searchData.results?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {searchData.results.map((result, index) => (
                <div
                  key={index}
                  className="rounded-lg border-2 border-b-4 border-r-4 border-black bg-white p-4 transition hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-semibold text-gray-800">
                      {result.title}
                    </h3>

                    <span className="shrink-0 rounded-full border border-gray-400 px-2 py-1 text-xs">
                      {Math.round((result.score || 0) * 100)}%
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {getDomainFromUrl(result.url)}
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                    {result.content}
                  </p>

                  <button
                    onClick={() => window.open(result.url, '_blank')}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-black bg-white px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Visit
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-gray-500">
              No results found. Try a different query.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function Resources() {
  const [storedResources, setStoredResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('curate')

  useEffect(() => {
    async function fetchResources() {
      const user = getUser()

      setLoading(true)

      try {
        const response = await fetch(
          `${API_BASE_URL}/curate-resources/${
            user.id || 'demo-user'
          }`,
          {
            headers: authHeaders(),
          },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch resources')
        }

        const data = await response.json()

        if (Array.isArray(data.resources)) {
          setStoredResources(data.resources)
        }
      } catch {
        /*
         * No local resources are created automatically.
         * The empty state remains the same as the original repository.
         */
        setStoredResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  function handleResourcesCreated(resourceGroup) {
    setStoredResources((previous) => [
      resourceGroup,
      ...previous.filter(
        (resource) => resource._id !== resourceGroup._id,
      ),
    ])

    setCurrentPage(1)
  }

  function handleResourceDelete(resourceId) {
    setStoredResources((previous) =>
      previous.filter((resource) => resource._id !== resourceId),
    )
  }

  const totalPages = Math.ceil(
    storedResources.length / ITEMS_PER_PAGE,
  )

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE

  const currentResources = storedResources.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Resources
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('curate')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'curate'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Curate Resources
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Web Search
          </button>
        </div>
      </div>

      <div className="mx-auto w-full">
        {activeTab === 'curate' ? (
          <ResourceCurator
            onResourcesCreated={handleResourcesCreated}
          />
        ) : (
          <WebSearch />
        )}
      </div>

      {loading ? (
        <div className="mt-8 space-y-4 sm:mt-12">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-300" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-gray-300" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-gray-300" />
        </div>
      ) : (
        <div id="stored-resources" className="mt-8 sm:mt-12">
          <div className="my-6 h-px bg-gray-400 sm:my-8" />

          <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
            Your Curated Resources
          </h2>

          {storedResources.length > 0 ? (
            <>
              <div className="space-y-4 sm:space-y-6">
                {currentResources.map((resource) => (
                  <StoredResources
                    key={resource._id}
                    resource={resource}
                    onDelete={handleResourceDelete}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1),
                      )
                    }
                    className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1),
                      )
                    }
                    className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>You haven&apos;t curated any resources yet.</p>

              <p className="mt-2">
                Use the form above to get personalized learning resources!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}