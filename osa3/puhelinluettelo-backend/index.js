require('dotenv').config()
//3.7 morgan
const morgan = require('morgan')
const express = require('express')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

//3.8
morgan.token('body', (req) => {
  return (['POST','PUT','PATCH'].includes(req.method) && req.body && Object.keys(req.body).length)
    ? JSON.stringify(req.body)
    : ''
})


// 3.7 ja 3.8
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


//let persons = [
//{ id: "1", name: "Arto Hellas", number: "040-123456" },
//{ id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
//{ id: "3", name: "Dan Abramov", number: "12-43-234345" },
//{ id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
//]

// 3.1 GET api/persons -> palauttaa koko listan
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})


// 3.2 GET /info -> näyttää kuinka monta henkilöä ja daten
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      const now = new Date()
      res.send(`<p>Phonebook has info for ${count} people</p><p>${now}</p>`)
    })
    .catch(error => next(error))
})

// 3.3 GET /api/persons/:id -> yksittäinen henkilötieto
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})
// 3.4  poistaa henkilön
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

// 3.17 päivittää olemassa olevan henkilön numeron
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    req.params.id,
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


// apufunktio id:n tekoon (3.5)

//const generateId = () => String(Math.floor(Math.random() * 1000000))

// 3.5 ja 3.6 lisää uusi henkilötieto
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  Person.findOne({ name: body.name })
    .then(existing => {
      if (existing) {
        return res.status(400).json({ error: 'name must be unique' })
      }

      const newPerson = new Person({
        name: body.name,
        number: body.number
      })

      return newPerson.save().then(savedPerson => {
        res.json(savedPerson)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
