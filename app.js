const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validateParcialMovie } = require('./schemas/moviesSchemas')


const app = express()

const PORT = process.env.PORT ?? 1234

app.disable('x-powered-by')

app.use(express.json())

app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:3000',
            'http://localhost:1234',
            'http://localhost:8080'
        ]

        if (ACCEPTED_ORIGINS.includes(origin)) return callback(null, true)

        if (!origin) return callback(null, true)

        return callback(new Error('No aceptado por CORS'))
    }
}))

// OTRO TIPO DE CONFIGURACION DE CORS
/*
const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:1234',
    'http://localhost:8080',
]

app.get('movies/:id', (req, res) => {
    const origin = req.header('origin')
 
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }
    
    
})

app.options('/movies', (req, res) => {
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    }
    res.send(200)
})

*/

app.get('/movies', (req, res) => {

    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        if (filteredMovies.length === 0) {
            return res.json({ message: "No hay peliculas de este género" })
        } else {
            return res.json(filteredMovies)
        }
    }

    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: "Pelicula no encontrada" })
})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
    }


    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
    const result = validateParcialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex = -1) {
        return res.status(404).json({ message: 'No se encontró la pelicula' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})

