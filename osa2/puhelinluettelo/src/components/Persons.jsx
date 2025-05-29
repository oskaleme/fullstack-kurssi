const Persons = ({ persons }) => (
    <ul>
      {persons.map((p, i) =>
        <li key={i}>{p.name} {p.number}</li>
      )}
    </ul>
  )
  
  export default Persons  