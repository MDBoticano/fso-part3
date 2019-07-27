/* Imports & Middleware */
const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

morgan.token('body', (request) =>  {
  return JSON.stringify(request.body)
})

app.use(bodyParser.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(requestLogger)

app.use(express.static('build'))

/* Routes */
/* GET: root (no MongoDB connection) */
app.get('/api/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

/* GET: info (count and date of request) */
app.get('/info', (request, response) => {
  Person.find({}).then(persons => { 
    let dateOfRequest = new Date()
    let numEntries = persons.length 
    let infoString = 'Phonebook has info for ' + numEntries + ' people'
    response.send('<p>' + infoString + '</p>' + '<p>' + dateOfRequest + '</p>')
  })  
})

/* GET: all persons */
app.get('/api/persons', (request, response) => {
  console.log('GET: getting all entries')
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

/* GET: specific id */
app.get('/api/persons/:id', (request, response, next) => {
  console.log('GET: getting entry by id')
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        // console.log('Format is correct but object does not exist')
        response.status(204).end()
      }
    })
    .catch(error => {
      // console.log('Object Id format is incorrect')
      next(error)
    })
})

/* POST: add new entry */
app.post('/api/persons', (request, response, next) => {
  console.log('POST: adding entry')
  
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
    date: new Date()
  })

  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => { response.json(savedAndFormattedPerson) })
    .catch(error => next(error))
})

/* DELETE: removes specific entry by id */
app.delete('/api/persons/:id', (request, response, next) => {
  console.log('DELETE: deleting entry')
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* PUT: update an existing entry */
app.put('/api/persons/:id', (request, response, next) => {
  console.log('PUT: Updating entry')
  
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, 
    { new: true, 
      runValidators: true,
      context: 'query' 
    })
    .then(updatedEntry => {
      response.json(updatedEntry.toJSON())
    })
    .catch(error => next(error))
})

/* Middleware: unknown endpoint. DONT PUT ROUTES AFTER THIS!!! */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

/* Middleware: custom error handler for wrongly formatted id */
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'incorrect id format' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message, 
      errorType: 'ValidationError' })
  } else {
    return response.status(400).json({ error: 'data does not exist'})
  }
}
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})