const Notification = ({ message, type }) => {
    if (message === null) {
      return null
    }
  
    // type oletuksena 'error' tai 'success'
    const className = type === 'success' ? 'success' : 'error'
  
    return (
      <div className={className}>
        {message}
      </div>
    )
  }
  
  export default Notification