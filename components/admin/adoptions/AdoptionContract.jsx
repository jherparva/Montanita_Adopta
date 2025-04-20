"use client"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"

export default function AdoptionContract({ adoption, onClose, onApprove }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    documentId: "",
    animalSex: adoption.animal.sex || "",
    animalAge: adoption.animal.age || "",
    chipNumber: adoption.animal.chipNumber || "Pendiente de microchip",
  })
  const contractRef = useRef()
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handlePrint = useReactToPrint({
    content: () => contractRef.current,
    documentTitle: `Contrato_Adopcion_${adoption.animal.name}`,
    onBeforeGetContent: () => {
      setLoading(true)
      return new Promise((resolve) => setTimeout(resolve, 500))
    },
    onAfterPrint: () => setLoading(false),
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const translateSex = (sex) => {
    if (!sex) return "No especificado"
    return sex === "male" ? "Macho" : sex === "female" ? "Hembra" : sex
  }

  const translateAge = (age) => {
    if (!age) return "No especificada"
    if (age === "puppy" || age === "kitten") return "Cachorro"
    if (age === "adult") return "Adulto"
    if (age === "senior") return "Senior"
    return age
  }

  return (
    <div className="adoption-contract-modal">
      <div className="contract-modal-content">
        <div className="contract-header">
          <h2>Contrato de Adopción</h2>
          <div className="contract-actions">
            <button onClick={handlePrint} disabled={loading} className="btn-print">
              {loading ? "Preparando..." : "Imprimir Contrato"}
            </button>
            <button onClick={onClose} className="btn-close">
              Cerrar
            </button>
          </div>
        </div>

        <div className="contract-edit-form">
          <h3>Editar información del contrato</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="documentId">Documento de identidad del adoptante:</label>
              <input
                type="text"
                id="documentId"
                name="documentId"
                value={formData.documentId}
                onChange={handleChange}
                placeholder="Ingrese número de cédula"
              />
            </div>
            <div className="form-group">
              <label htmlFor="animalSex">Sexo del animal:</label>
              <select id="animalSex" name="animalSex" value={formData.animalSex} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="animalAge">Edad del animal:</label>
              <select id="animalAge" name="animalAge" value={formData.animalAge} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="puppy">Cachorro (Perro)</option>
                <option value="kitten">Cachorro (Gato)</option>
                <option value="adult">Adulto</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="chipNumber">Número de microchip:</label>
              <input
                type="text"
                id="chipNumber"
                name="chipNumber"
                value={formData.chipNumber}
                onChange={handleChange}
                placeholder="Número de microchip o estado"
              />
            </div>
          </div>
        </div>

        <div className="contract-document" ref={contractRef}>
          <div className="contract-logo">
            <img src="/imagenes/logo.webp" alt="Logo Montañita Adopta" />
          </div>

          <h1>CONTRATO DE ADOPCIÓN</h1>

          <div className="contract-section">
            <h2>REUNIDOS</h2>
            <p>
              <strong>De una parte,</strong> la Asociación Protectora de Animales "Montañita Adopta", con domicilio en
              carrera 5 calle 8a #04, barrio guillermo escobar, representada por JOHN HERNANDO PARRA VALDERRAMA, en
              calidad de ADMINISTRADOR, en adelante LA PROTECTORA.
            </p>
            <p>
              <strong>Y de otra parte,</strong> {adoption.adopter.name}, con documento de identidad{" "}
              {formData.documentId || "[Documento]"}, domiciliado en {adoption.adopter.address}, {adoption.adopter.city}
              , en adelante EL/LA ADOPTANTE.
            </p>
          </div>

          <div className="contract-section">
            <h2>MANIFIESTAN</h2>
            <p>
              Que LA PROTECTORA tiene bajo su custodia al animal cuyas características se describen a continuación y que
              EL/LA ADOPTANTE está interesado/a en su adopción, por lo que ambas partes acuerdan celebrar el presente
              CONTRATO DE ADOPCIÓN con arreglo a las siguientes cláusulas:
            </p>
          </div>

          <div className="contract-section">
            <h2>DESCRIPCIÓN DEL ANIMAL</h2>
            <table className="animal-details">
              <tbody>
                <tr>
                  <td>
                    <strong>Nombre:</strong>
                  </td>
                  <td>{adoption.animal.name}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Especie:</strong>
                  </td>
                  <td>
                    {adoption.animal.species === "dog"
                      ? "Perro"
                      : adoption.animal.species === "cat"
                        ? "Gato"
                        : adoption.animal.species}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Raza:</strong>
                  </td>
                  <td>{adoption.animal.breed}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sexo:</strong>
                  </td>
                  <td>{translateSex(formData.animalSex || adoption.animal.sex)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Edad aproximada:</strong>
                  </td>
                  <td>{translateAge(formData.animalAge || adoption.animal.age)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Identificación:</strong>
                  </td>
                  <td>{formData.chipNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="contract-section">
            <h2>CLÁUSULAS</h2>
            <ol className="contract-clauses">
              <li>
                <strong>Objeto del contrato:</strong> LA PROTECTORA cede en adopción al animal arriba descrito a EL/LA
                ADOPTANTE, quien lo acepta y recibe en este acto.
              </li>
              <li>
                <strong>Compromiso de cuidado:</strong> EL/LA ADOPTANTE se compromete a proporcionar al animal los
                cuidados necesarios para su bienestar, incluyendo alimentación adecuada, higiene, ejercicio, atención
                veterinaria y afecto.
              </li>
              <li>
                <strong>Atención veterinaria:</strong> EL/LA ADOPTANTE se compromete a llevar al animal a revisiones
                veterinarias periódicas, mantener su calendario de vacunación al día y proporcionarle tratamiento
                veterinario cuando sea necesario.
              </li>
              <li>
                <strong>Identificación y registro:</strong> EL/LA ADOPTANTE se compromete a mantener al animal
                debidamente identificado mediante microchip y a realizar el cambio de titularidad en el registro
                correspondiente en un plazo máximo de 30 días desde la firma de este contrato.
              </li>
              <li>
                <strong>Prohibición de abandono:</strong> EL/LA ADOPTANTE se compromete a no abandonar al animal bajo
                ninguna circunstancia. En caso de no poder seguir haciéndose cargo del mismo, deberá comunicarlo a LA
                PROTECTORA con antelación suficiente.
              </li>
              <li>
                <strong>Prohibición de cesión:</strong> EL/LA ADOPTANTE no podrá ceder, vender o regalar al animal a
                terceras personas sin el consentimiento previo y por escrito de LA PROTECTORA.
              </li>
              <li>
                <strong>Seguimiento:</strong> EL/LA ADOPTANTE autoriza a LA PROTECTORA a realizar visitas de seguimiento
                para comprobar el estado del animal, previo aviso y en horario conveniente para ambas partes.
              </li>
              <li>
                <strong>Incumplimiento:</strong> El incumplimiento de cualquiera de las cláusulas de este contrato
                facultará a LA PROTECTORA para recuperar la custodia del animal, sin derecho a compensación alguna para
                EL/LA ADOPTANTE.
              </li>
            </ol>
          </div>

          <div className="contract-section">
            <h2>ACEPTACIÓN</h2>
            <p>
              Ambas partes manifiestan su conformidad con el presente contrato, que firman por duplicado y a un solo
              efecto, en el lugar y fecha indicados.
            </p>
          </div>

          <div className="contract-signatures">
            <div className="signature-block">
              <p>LA PROTECTORA</p>
              <div className="signature-line"></div>
              <p>Nombre y firma</p>
            </div>

            <div className="signature-block">
              <p>EL/LA ADOPTANTE</p>
              <div className="signature-line"></div>
              <p>Nombre y firma</p>
            </div>
          </div>

          <div className="contract-date">
            <p>En __________________, a {currentDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}