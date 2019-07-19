const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(bodyParser.json())

app.use(morgan('tiny'))

let persons = [
  {
    name: "Arto Hellas",
    number: "123-455-4123",
    id: 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  },
  {
    "name": "Dan Anthony",
    "number": "123-555-7890",
    "date": "2019-07-16T23:25:18.663Z",
    "id": 5
  },
  {
    "name": "Seb Vettel",
    "number": "555-555-2013",
    "date": "2019-07-17T00:46:13.172Z",
    "id": 6
  },
  {
    "name": "James Hamilton",
    "number": "444-444-2018",
    "date": "2019-07-17T00:46:41.975Z",
    "id": 7
  },
  {
    "name": "Arthur King",
    "number": "123-456-4434",
    "date": "2019-07-17T21:26:13.292Z",
    "id": 10
  }
]

/* Helper Functions */
const nameExists = (name) => {
  let existingNames = persons.map(person => person.name.toLowerCase());
  return existingNames.includes(name.toLowerCase());
}

const numberExists = (number) => {
  let existingNumbers = persons.map(person => person.number);
  return existingNumbers.includes(number);
}

const generateID = () => {
  let maxID = -1;
  if (persons.length > 0) {
    maxID = Math.max(...persons.map(p => p.id))
  } else {
    maxID = 0
  }
  const randomNum = Math.floor(Math.random() * (100 - 1) + 1);

  return maxID + randomNum
}

/* Routes */
app.get('/api/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.get('/info', (request, response) => {
  let dateOfRequest = new Date();
  let numEntries = persons.length;
  let infoString = 'Phonebook has info for ' + numEntries + ' people'
  
  response.send('<p>' + infoString + '</p>' + '<p>' + dateOfRequest + '</p>')
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: "missing content"
    })
  } else if (nameExists(body.name)) {
    return response.status(400).json({
      error: "name must be unique"
    })
  } else if (numberExists(body.number)) {
    return response.status(400).json({
      error: "number must be unique"
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    date: new Date(),
    id: generateID(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})