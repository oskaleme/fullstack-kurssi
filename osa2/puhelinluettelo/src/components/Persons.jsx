const Persons = ({ persons }) => (
    <ul>
      {persons.map(p => (
        <li key={p.id}>
          {p.name} {p.number}
        </li>
      ))}
    </ul>
  );
  export default Persons;  