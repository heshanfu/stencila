class GeneralError extends Error {

  constructor (message, details) {
    details = details | null
    super(message + ' ' + JSON.stringify(details))
    this.details = details
  }

}

export default GeneralError
