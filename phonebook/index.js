const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

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

app.get('/api/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  let dateOfRequest = new Date();
  let numEntries = persons.length;
  let infoString = 'Phonebook has info for ' + numEntries + ' people'
  
  res.send('<p>' + infoString + '</p>' + '<p>' + dateOfRequest + '</p>')
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})