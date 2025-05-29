import { useState } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

const App = () => {
  // hlöt
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456' }
  ])
  const [newName, setNewName]     = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterText, setFilterText] = useState('')


  const addPerson = (event) => {
    event.preventDefault()
    // step 2: tarkistetaan onko jo lisättynä
    if (persons.find(p => p.name === newName)) {
      alert(`${newName} is already added to phonebook`)
      return
    }
    // lisätään henkilö
    const personObject = { name: newName, number: newNumber }
    setPersons(persons.concat(personObject))
    setNewName('')      
    setNewNumber('')
  }

  //filter
  const personsToShow = filterText
    ? persons.filter(p =>
        p.name.toLowerCase().includes(filterText.toLowerCase())
      )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter 
        filterText={filterText}
        handleFilterChange={e => setFilterText(e.target.value)}
      />

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        nameValue={newName}
        onNameChange={e => setNewName(e.target.value)}
        numberValue={newNumber}
        onNumberChange={e => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} />
    </div>
  )
}

export default App
