const Filter = ({ filterText, handleFilterChange }) => (
    <div>
      filter shown with{' '}
      <input
        value={filterText}
        onChange={handleFilterChange}
      />
    </div>
  )
  
  export default Filter  