
const express = require('express')
const app = express()


app.use(express.json())


let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
]

// 3.1 GET api/persons -> palauttaa koko listan
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

// 3.2 GET /info -> näyttää kuinka monta henkilöä ja daten
app.get('/info', (req, res) => {
  const count = persons.length
  const now = new Date()
  res.send(`<p>Phonebook has info for ${count} people</p><p>${now}</p>`)
})

// 3.3 GET /api/persons/:id -> yksittäinen henkilötieto
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end() 
  }
})

// 3.4  poistaa henkilön
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(p => p.id !== id)
  res.status(204).end() 
})

// apufunktio id:n tekoon (3.5)

const generateId = () => String(Math.floor(Math.random() * 1000000))

// 3.5 ja 3.6 lisää uusi henkilötieto 
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  if (persons.some(p => p.name === body.name)) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)
  res.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
