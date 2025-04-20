export function corsMiddleware(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Origin", "*") // In production, replace with your specific domain
    res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    )
  
    // Handle OPTIONS request
    if (req.method === "OPTIONS") {
      res.status(200).end()
      return true
    }
    return false
  }
  