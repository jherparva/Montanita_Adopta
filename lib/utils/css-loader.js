/**
 * Utilidad para cargar y descargar hojas de estilo dinámicamente
 * Esta función permite cargar CSS específico solo cuando se necesita
 */
export const CSSLoader = {
  // Almacena las hojas de estilo cargadas actualmente
  loadedStylesheets: [],

  // Función para cargar una hoja de estilo específica
  load: (stylesheetPath) => {
    if (typeof document === "undefined") return // Verificar que estamos en el cliente

    // Primero eliminamos cualquier hoja de estilo cargada previamente
    CSSLoader.unloadAll()

    // Crear un nuevo elemento link para la hoja de estilo
    const linkElement = document.createElement("link")
    linkElement.rel = "stylesheet"
    linkElement.href = stylesheetPath
    linkElement.id = `dynamic-stylesheet-${Date.now()}`

    // Añadir el elemento al head
    document.head.appendChild(linkElement)

    // Guardar referencia a la hoja de estilo cargada
    CSSLoader.loadedStylesheets.push(linkElement)

    console.log(`Hoja de estilo cargada: ${stylesheetPath}`)
  },

  // Función para descargar una hoja de estilo específica
  unload: (stylesheetPath) => {
    if (typeof document === "undefined") return

    // Buscar y eliminar la hoja de estilo específica
    const links = document.querySelectorAll(`link[href="${stylesheetPath}"]`)
    links.forEach((link) => {
      link.parentNode.removeChild(link)
    })

    // Actualizar la lista de hojas de estilo cargadas
    CSSLoader.loadedStylesheets = CSSLoader.loadedStylesheets.filter((link) => link.href !== stylesheetPath)

    console.log(`Hoja de estilo descargada: ${stylesheetPath}`)
  },

  // Función para descargar todas las hojas de estilo cargadas dinámicamente
  unloadAll: () => {
    if (typeof document === "undefined") return

    // Eliminar todas las hojas de estilo dinámicas
    CSSLoader.loadedStylesheets.forEach((link) => {
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    })

    // Limpiar la lista de hojas de estilo cargadas
    CSSLoader.loadedStylesheets = []

    console.log("Todas las hojas de estilo dinámicas han sido descargadas")
  },
}
