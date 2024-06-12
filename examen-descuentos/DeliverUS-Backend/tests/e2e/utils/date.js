const checkValidDate = (dateString) => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export { checkValidDate }
