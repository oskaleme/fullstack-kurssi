import { useState, useEffect } from 'react'
import personService from './services/persons'

import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        setErrorMessage('Tietojen haku epäonnistui')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }, [])

  const addPerson = (e) => {
    e.preventDefault()

    if (persons.some(p => p.name === newName)) {
      const existing = persons.find(p => p.name === newName)
      if (
        window.confirm(
          `${newName} on jo luettelossa. Haluatko päivittää numeron?`
        )
      ) {
        const updatedPerson = { ...existing, number: newNumber }
        personService
          .update(existing.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== existing.id ? p : returnedPerson))
            setSuccessMessage(`Päivitettiin ${returnedPerson.name}`)
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            setErrorMessage(
              `Henkilö '${existing.name}' oli jo poistettu palvelimelta`
            )
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
            setPersons(persons.filter(p => p.id !== existing.id))
          })
      }
      return
    }

    const personObject = {
      name: newName,
      number: newNumber
    }
    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setSuccessMessage(`Lisättiin ${returnedPerson.name}`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        setErrorMessage('Lisäys epäonnistui')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const personsToShow = filter
    ? persons.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : persons

  const removePerson = (id) => {
    const person = persons.find(p => p.id === id)
    if (!person) return
    if (window.confirm(`Poistetaanko ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          setSuccessMessage(`Poistettiin ${person.name}`)
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
        .catch(error => {
          setErrorMessage(
            `Henkilö '${person.name}' oli jo poistettu palvelimelta`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>

      {/* Onnistumisilmoitus ja virheilmoitus */}
      <Notification message={successMessage} type="success" />
      <Notification message={errorMessage} type="error" />

      <Filter value={filter} onChange={e => setFilter(e.target.value)} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        nameValue={newName}
        onNameChange={e => setNewName(e.target.value)}
        numberValue={newNumber}
        onNumberChange={e => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} removePerson={removePerson} />
    </div>
  )
}

export default App