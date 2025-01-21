import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

async function fetchYouTubeTrailer(title: string, year: string) {
  try {
    // Search for movie trailer
    const searchQuery = `${title} ${year} official trailer`
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
    )
    const searchData = await searchResponse.json()

    if (!searchData.items?.[0]) {
      throw new Error('No trailer found')
    }

    const videoId = searchData.items[0].id.videoId

    // Get video details to verify it's a trailer
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    )
    const detailsData = await detailsResponse.json()

    if (!detailsData.items?.[0]) {
      throw new Error('Video details not found')
    }

    const video = detailsData.items[0]
    const isTrailer = video.snippet.title.toLowerCase().includes('trailer')

    if (!isTrailer) {
      throw new Error('No official trailer found')
    }

    return {
      url: `https://www.youtube.com/embed/${videoId}`,
      type: 'video/mp4',
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnails: video.snippet.thumbnails,
      viewCount: video.statistics.viewCount
    }
  } catch (error) {
    console.error('Error fetching YouTube trailer:', error)
    throw error
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imdbId = searchParams.get('imdbId')

  if (!imdbId) {
    return NextResponse.json({ error: 'IMDB ID is required' }, { status: 400 })
  }

  try {
    // First fetch movie details from OMDB
    const omdbResponse = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${imdbId}`
    )
    const movieData = await omdbResponse.json()

    if (movieData.Error) {
      throw new Error(movieData.Error)
    }

    // Then fetch the trailer from YouTube
    const trailerData = await fetchYouTubeTrailer(movieData.Title, movieData.Year)

    return NextResponse.json({
      url: trailerData.url,
      type: trailerData.type,
      genres: movieData.Genre.split(', '),
      rating: movieData.Rated,
      language: 'English',
      title: trailerData.title,
      description: trailerData.description,
      thumbnails: trailerData.thumbnails,
      viewCount: trailerData.viewCount
    })
  } catch (error) {
    console.error('Error fetching trailer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trailer' }, 
      { status: 500 }
    )
  }
} 