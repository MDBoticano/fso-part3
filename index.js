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

/* Helper Functions: need to modify to work with MongoDB */
// persons = []

// const nameExists = (name) => {
//   let existingNames = persons.map(person => person.name.toLowerCase());
//   return existingNames.includes(name.toLowerCase());
// }

// const numberExists = (number) => {
//   let existingNumbers = persons.map(person => person.number);
//   return existingNumbers.includes(number);
// }

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
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

/* GET: specific id */
app.get('/api/persons/:id', (request, response, next) => {
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
app.post('/api/persons', (request, response) => {
  console.log('posting')
  
  const body = request.body

  // if(!body.name || !body.number) {
  //   return response.status(400).json({
  //     error: "missing content"
  //   })
  // } else if (nameExists(body.name)) {
  //   return response.status(400).json({
  //     error: "name must be unique"
  //   })
  // } else if (numberExists(body.number)) {
  //   return response.status(400).json({
  //     error: "number must be unique"
  //   })
  // }
  
  // Step 1: Name check -- does name exist? //
  // can pull all data and set it to state to keep function
  // get ID of existing name, then just use that and body to PUT instead

  const person = new Person({
    name: body.name,
    number: body.number,
    date: new Date()
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
})

/* DELETE: removes specific entry by id */
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* PUT: update an existing entry */
app.put('/api/persons/:id', (request, response, next) => {
  console.log('putting')
  
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
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
  }
}
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})