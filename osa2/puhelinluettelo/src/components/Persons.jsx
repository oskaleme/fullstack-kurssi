const Persons = ({ persons, removePerson }) => (
  <ul>
    {persons.map(p => (
      <li key={p.id}>
        {p.name} {p.number}{' '}
        <button onClick={() => removePerson(p.id)}>delete</button>
      </li>
    ))}
  </ul>
)

export default Persons