import passport from 'passport'

const hasRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).send({ error: 'Not logged in' })
  }
  if (!roles.includes(req.user.userType)) {
    return res.status(403).send({ error: 'Not enough privileges' })
  }
  return next()
}
const isLoggedIn = (req, res, next) => {
  passport.authenticate('bearer', { session: false })(req, res, next)
}

export { hasRole, isLoggedIn }
