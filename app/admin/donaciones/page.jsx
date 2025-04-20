"use client"
import { useState, useEffect, useRef } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { useToast } from "@/hooks/use-toast"
import { useReactToPrint } from "react-to-print"
import "@/styles/admin/donaciones.css";

export default function DonacionesPage() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("monetary")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [usageDescription, setUsageDescription] = useState("")
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })
  const [printMode, setPrintMode] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const printRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDonations()
  }, [currentPage, activeTab])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/donations?page=${currentPage}&limit=10&type=${activeTab}`)
      const data = await response.json()

      if (response.ok) {
        setDonations(data.donations || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError(data.message || "Error al cargar las donaciones")
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
      setError("Error al cargar las donaciones. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (donationId, newStatus) => {
    try {
      setStatusUpdateLoading(true)
      const response = await fetch("/api/donations/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId,
          status: newStatus,
          notes: selectedDonation?.notes || "",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Estado de la donación actualizado a ${newStatus === "confirmed" ? "confirmado" : "completado"}`,
        })
        fetchDonations()
        setSelectedDonation(null)
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al actualizar el estado de la donación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating donation status:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el estado de la donación",
        variant: "destructive",
      })
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleDeleteDonation = async (donationId) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/donations/${donationId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Donación eliminada correctamente",
        })
        fetchDonations()
        setDeleteConfirmation(null)
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al eliminar la donación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting donation:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la donación",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUsageDescriptionSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/donations/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: usageDescription,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Descripción de uso de donaciones actualizada correctamente",
        })
        setUsageDescription("")
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al actualizar la descripción de uso",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating usage description:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la descripción de uso",
        variant: "destructive",
      })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setDateRange({
      ...dateRange,
      [name]: value,
    })
  }

  const handleFilterByDate = () => {
    // Implementar filtrado por fecha
    fetchDonations()
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Reporte_Donaciones_${activeTab === "monetary" ? "Monetarias" : "Alimentos"}_${new Date().toLocaleDateString()}`,
    onBeforeGetContent: () => {
      setPrintMode(true);
      return new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    },
    onAfterPrint: () => {
      setPrintMode(false);
    },
  });

  const filteredDonations = donations.filter((donation) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      donation.donorName?.toLowerCase().includes(searchTermLower) ||
      donation.donorEmail?.toLowerCase().includes(searchTermLower) ||
      donation.donorPhone?.toLowerCase().includes(searchTermLower)
    )
  })

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodName = (method) => {
    switch (method) {
      case "nequi":
        return "Nequi"
      case "banco-bogota":
        return "Banco de Bogotá"
      case "paypal":
        return "PayPal"
      default:
        return "Otro"
    }
  }

  const getFoodTypeName = (type) => {
    switch (type) {
      case "dog-food":
        return "Comida para Perros"
      case "cat-food":
        return "Comida para Gatos"
      case "puppy-food":
        return "Comida para Cachorros"
      case "kitten-food":
        return "Comida para Gatitos"
      case "special-diet":
        return "Dieta Especial/Medicada"
      default:
        return "Otro"
    }
  }

  // Calcular totales para el reporte
  const calculateTotals = () => {
    if (activeTab === "monetary") {
      const total = filteredDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0)
      const confirmedTotal = filteredDonations
        .filter((d) => d.status === "confirmed" || d.status === "completed")
        .reduce((sum, donation) => sum + (donation.amount || 0), 0)

      return {
        total: formatAmount(total),
        confirmedTotal: formatAmount(confirmedTotal),
        count: filteredDonations.length,
        confirmedCount: filteredDonations.filter((d) => d.status === "confirmed" || d.status === "completed").length,
      }
    } else {
      const total = filteredDonations.reduce((sum, donation) => sum + (donation.quantity || 0), 0)
      const confirmedTotal = filteredDonations
        .filter((d) => d.status === "confirmed" || d.status === "completed")
        .reduce((sum, donation) => sum + (donation.quantity || 0), 0)

      return {
        total: `${total} kg`,
        confirmedTotal: `${confirmedTotal} kg`,
        count: filteredDonations.length,
        confirmedCount: filteredDonations.filter((d) => d.status === "confirmed" || d.status === "completed").length,
      }
    }
  }

  const totals = calculateTotals()

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="page-header">
          <h1>Gestión de Donaciones</h1>
          <p>Administra las donaciones recibidas y su uso</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "monetary" ? "active" : ""}`}
            onClick={() => setActiveTab("monetary")}
          >
            Donaciones Monetarias
          </button>
          <button className={`admin-tab ${activeTab === "food" ? "active" : ""}`} onClick={() => setActiveTab("food")}>
            Donaciones de Alimentos
          </button>
          <button
            className={`admin-tab ${activeTab === "usage" ? "active" : ""}`}
            onClick={() => setActiveTab("usage")}
          >
            Uso de Donaciones
          </button>
        </div>

        {activeTab !== "usage" && (
          <div className="filter-controls mb-4">
            <div className="search-filter">
              <input
                type="text"
                placeholder={`Buscar ${activeTab === "monetary" ? "donaciones monetarias" : "donaciones de alimentos"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="date-filter">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="date-input"
              />
              <span>a</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="date-input"
              />
              <button onClick={handleFilterByDate} className="btn-filter">
                <i className="fas fa-filter"></i> Filtrar
              </button>
            </div>

            <div className="action-buttons">
              <button onClick={() => fetchDonations()} className="btn-refresh">
                <i className="fas fa-sync-alt"></i> Actualizar
              </button>
              <button onClick={handlePrint} className="btn-print">
                <i className="fas fa-print"></i> Imprimir Reporte
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
            <button onClick={fetchDonations}>Reintentar</button>
          </div>
        )}

        <div ref={printRef}>
          {printMode && (
            <div className="print-header">
              <div className="print-logo">
                <img src="/imagenes/logo.webp" alt="Logo Montañita Adopta" />
              </div>
              <div className="print-title">
                <h2>Reporte de Donaciones {activeTab === "monetary" ? "Monetarias" : "de Alimentos"}</h2>
                <p>Fecha de generación: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activeTab === "monetary" && (
            <div className="admin-section">
              {!printMode && <h2 className="section-title">Donaciones Monetarias</h2>}

              {printMode && (
                <div className="print-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Donaciones:</span>
                    <span className="summary-value">{totals.count}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Donaciones Confirmadas:</span>
                    <span className="summary-value">{totals.confirmedCount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Monto Total:</span>
                    <span className="summary-value">{totals.total}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Monto Confirmado:</span>
                    <span className="summary-value">{totals.confirmedTotal}</span>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Cargando donaciones...</p>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="no-results">
                  <i className="fas fa-info-circle"></i>
                  <p>No hay donaciones monetarias {searchTerm ? "que coincidan con tu búsqueda" : "registradas"}.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Donante</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        {!printMode && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.map((donation) => (
                        <tr key={donation._id}>
                          <td>
                            <div className="donor-info">
                              <div>{donation.donorName}</div>
                              <div className="donor-contact">
                                <span>{donation.donorEmail}</span>
                                <span>{donation.donorPhone}</span>
                              </div>
                            </div>
                          </td>
                          <td>{getPaymentMethodName(donation.paymentMethod)}</td>
                          <td>{formatAmount(donation.amount)}</td>
                          <td>{formatDate(donation.createdAt)}</td>
                          <td>
                            <span className={`status-badge ${donation.status}`}>
                              {donation.status === "pending"
                                ? "Pendiente"
                                : donation.status === "confirmed"
                                  ? "Confirmada"
                                  : "Completada"}
                            </span>
                          </td>
                          {!printMode && (
                            <td>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => setSelectedDonation(donation)}
                              >
                                <i className="fas fa-eye"></i> Ver
                              </button>
                              {donation.status === "pending" && (
                                <button
                                  className="btn btn-sm btn-success me-2"
                                  onClick={() => handleStatusUpdate(donation._id, "confirmed")}
                                >
                                  <i className="fas fa-check"></i> Confirmar
                                </button>
                              )}
                              {donation.status === "confirmed" && (
                                <button
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => handleStatusUpdate(donation._id, "completed")}
                                >
                                  <i className="fas fa-check-double"></i> Completar
                                </button>
                              )}
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirmation(donation)}>
                                <i className="fas fa-trash"></i> Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!printMode && (
                <div className="paginacion-donaciones">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "food" && (
            <div className="admin-section">
              {!printMode && <h2 className="section-title">Donaciones de Alimentos</h2>}

              {printMode && (
                <div className="print-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Donaciones:</span>
                    <span className="summary-value">{totals.count}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Donaciones Confirmadas:</span>
                    <span className="summary-value">{totals.confirmedCount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Cantidad Total:</span>
                    <span className="summary-value">{totals.total}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Cantidad Confirmada:</span>
                    <span className="summary-value">{totals.confirmedTotal}</span>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Cargando donaciones...</p>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="no-results">
                  <i className="fas fa-info-circle"></i>
                  <p>No hay donaciones de alimentos {searchTerm ? "que coincidan con tu búsqueda" : "registradas"}.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Donante</th>
                        <th>Tipo de Alimento</th>
                        <th>Cantidad (Kg)</th>
                        <th>Entrega</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        {!printMode && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.map((donation) => (
                        <tr key={donation._id}>
                          <td>
                            <div className="donor-info">
                              <div>{donation.donorName}</div>
                              <div className="donor-contact">
                                <span>{donation.donorEmail}</span>
                                <span>{donation.donorPhone}</span>
                              </div>
                            </div>
                          </td>
                          <td>{getFoodTypeName(donation.foodType)}</td>
                          <td>{donation.quantity} kg</td>
                          <td>
                            {donation.deliveryOption === "self" ? "Entrega personal" : "Solicitud de recogida"}
                            {donation.deliveryOption === "pickup" && donation.pickupAddress && (
                              <div className="pickup-address">
                                <small>{donation.pickupAddress}</small>
                              </div>
                            )}
                          </td>
                          <td>{formatDate(donation.createdAt)}</td>
                          <td>
                            <span className={`status-badge ${donation.status}`}>
                              {donation.status === "pending"
                                ? "Pendiente"
                                : donation.status === "confirmed"
                                  ? "Confirmada"
                                  : "Completada"}
                            </span>
                          </td>
                          {!printMode && (
                            <td>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => setSelectedDonation(donation)}
                              >
                                <i className="fas fa-eye"></i> Ver
                              </button>
                              {donation.status === "pending" && (
                                <button
                                  className="btn btn-sm btn-success me-2"
                                  onClick={() => handleStatusUpdate(donation._id, "confirmed")}
                                >
                                  <i className="fas fa-check"></i> Confirmar
                                </button>
                              )}
                              {donation.status === "confirmed" && (
                                <button
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => handleStatusUpdate(donation._id, "completed")}
                                >
                                  <i className="fas fa-check-double"></i> Completar
                                </button>
                              )}
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirmation(donation)}>
                                <i className="fas fa-trash"></i> Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!printMode && (
                <div className="paginacion-donaciones">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "usage" && (
            <div className="admin-section">
              <h2 className="section-title">Uso de Donaciones</h2>

              <div className="usage-stats">
                <div className="usage-stat-card">
                  <div className="usage-stat-icon">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="usage-stat-content">
                    <h3>Total Donaciones Monetarias</h3>
                    <div className="usage-stat-value">$2,500,000</div>
                  </div>
                </div>

                <div className="usage-stat-card">
                  <div className="usage-stat-icon">
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div className="usage-stat-content">
                    <h3>Total Donaciones de Alimentos</h3>
                    <div className="usage-stat-value">350 kg</div>
                  </div>
                </div>

                <div className="usage-stat-card">
                  <div className="usage-stat-icon">
                    <i className="fas fa-paw"></i>
                  </div>
                  <div className="usage-stat-content">
                    <h3>Animales Beneficiados</h3>
                    <div className="usage-stat-value">45</div>
                  </div>
                </div>
              </div>

              <div className="usage-description-section">
                <h3>Actualizar Descripción de Uso de Donaciones</h3>
                <p className="usage-description-info">
                  Esta información se mostrará a los donantes para informarles cómo se utilizan sus donaciones.
                </p>

                <form onSubmit={handleUsageDescriptionSubmit} className="usage-form">
                  <div className="form-group">
                    <label htmlFor="usage-description">Descripción:</label>
                    <textarea
                      id="usage-description"
                      name="usage-description"
                      rows="6"
                      value={usageDescription}
                      onChange={(e) => setUsageDescription(e.target.value)}
                      placeholder="Describe cómo se utilizan las donaciones recibidas..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Actualizar Descripción
                  </button>
                </form>

                <div className="usage-history">
                  <h3>Historial de Uso</h3>
                  <div className="usage-history-item">
                    <div className="usage-history-date">15 de abril, 2025</div>
                    <div className="usage-history-description">
                      <strong>Compra de medicamentos:</strong> $500,000 para tratamientos veterinarios de 5 cachorros
                      rescatados.
                    </div>
                  </div>
                  <div className="usage-history-item">
                    <div className="usage-history-date">10 de abril, 2025</div>
                    <div className="usage-history-description">
                      <strong>Alimentos:</strong> Distribución de 120kg de alimento para perros y gatos del refugio.
                    </div>
                  </div>
                  <div className="usage-history-item">
                    <div className="usage-history-date">5 de abril, 2025</div>
                    <div className="usage-history-description">
                      <strong>Vacunación:</strong> $350,000 para vacunas de 12 animales rescatados recientemente.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal para ver detalles de donación */}
        {selectedDonation && (
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-content">
              <span className="close" onClick={() => setSelectedDonation(null)}>
                &times;
              </span>
              <h2>Detalles de la Donación</h2>
              <div className="donation-details">
                <div className="donation-detail-section">
                  <h3>Información del Donante</h3>
                  <p>
                    <strong>Nombre:</strong> {selectedDonation.donorName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedDonation.donorEmail}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {selectedDonation.donorPhone}
                  </p>
                </div>

                <div className="donation-detail-section">
                  <h3>Detalles de la Donación</h3>
                  {selectedDonation.type === "monetary" ? (
                    <>
                      <p>
                        <strong>Tipo:</strong> Donación Monetaria
                      </p>
                      <p>
                        <strong>Monto:</strong> {formatAmount(selectedDonation.amount)}
                      </p>
                      <p>
                        <strong>Método de Pago:</strong> {getPaymentMethodName(selectedDonation.paymentMethod)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Tipo:</strong> Donación de Alimentos
                      </p>
                      <p>
                        <strong>Tipo de Alimento:</strong> {getFoodTypeName(selectedDonation.foodType)}
                      </p>
                      <p>
                        <strong>Cantidad:</strong> {selectedDonation.quantity} kg
                      </p>
                      <p>
                        <strong>Método de Entrega:</strong>{" "}
                        {selectedDonation.deliveryOption === "self" ? "Entrega personal" : "Solicitud de recogida"}
                      </p>
                      {selectedDonation.deliveryOption === "pickup" && selectedDonation.pickupAddress && (
                        <p>
                          <strong>Dirección de Recogida:</strong> {selectedDonation.pickupAddress}
                        </p>
                      )}
                    </>
                  )}
                  <p>
                    <strong>Fecha:</strong> {formatDate(selectedDonation.createdAt)}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {selectedDonation.status === "pending"
                      ? "Pendiente"
                      : selectedDonation.status === "confirmed"
                        ? "Confirmada"
                        : "Completada"}
                  </p>
                </div>

                {selectedDonation.notes && (
                  <div className="donation-detail-section">
                    <h3>Mensaje del Donante</h3>
                    <p>{selectedDonation.notes}</p>
                  </div>
                )}

                {/* Sección para mostrar la evidencia si existe */}
                {selectedDonation.evidenceUrl && (
                  <div className="donation-detail-section">
                    <h3>Comprobante de Donación</h3>
                    <div className="evidence-preview">
                      <img
                        src={selectedDonation.evidenceUrl || "/placeholder.svg"}
                        alt="Comprobante de donación"
                        style={{ maxWidth: "100%", maxHeight: "300px", cursor: "pointer" }}
                        onClick={() => setShowEvidenceModal(true)}
                      />
                      <p className="text-center mt-2">
                        <button className="btn btn-sm btn-info" onClick={() => setShowEvidenceModal(true)}>
                          <i className="fas fa-search-plus"></i> Ver comprobante
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                <div className="donation-actions">
                  {selectedDonation.status === "pending" && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(selectedDonation._id, "confirmed")}
                      disabled={statusUpdateLoading}
                    >
                      {statusUpdateLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-check"></i>
                      )}{" "}
                      Confirmar Donación
                    </button>
                  )}
                  {selectedDonation.status === "confirmed" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(selectedDonation._id, "completed")}
                      disabled={statusUpdateLoading}
                    >
                      {statusUpdateLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-check-double"></i>
                      )}{" "}
                      Marcar como Completada
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setDeleteConfirmation(selectedDonation)
                      setSelectedDonation(null)
                    }}
                  >
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                  <button className="btn btn-secondary" onClick={() => setSelectedDonation(null)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver evidencia en tamaño completo */}
        {showEvidenceModal && selectedDonation?.evidenceUrl && (
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-content" style={{ maxWidth: "90%", height: "90vh" }}>
              <span className="close" onClick={() => setShowEvidenceModal(false)}>
                &times;
              </span>
              <h2>Comprobante de Donación</h2>
              <div className="evidence-full-view" style={{ textAlign: "center", height: "80%" }}>
                <img
                  src={selectedDonation.evidenceUrl || "/placeholder.svg"}
                  alt="Comprobante de donación"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button className="btn btn-secondary" onClick={() => setShowEvidenceModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar donación */}
        {deleteConfirmation && (
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-content" style={{ maxWidth: "500px" }}>
              <span className="close" onClick={() => setDeleteConfirmation(null)}>
                &times;
              </span>
              <h2>Confirmar Eliminación</h2>
              <p>¿Estás seguro de que deseas eliminar esta donación?</p>
              <p>
                <strong>Donante:</strong> {deleteConfirmation.donorName}
              </p>
              {deleteConfirmation.type === "monetary" ? (
                <p>
                  <strong>Monto:</strong> {formatAmount(deleteConfirmation.amount)}
                </p>
              ) : (
                <p>
                  <strong>Cantidad:</strong> {deleteConfirmation.quantity} kg de{" "}
                  {getFoodTypeName(deleteConfirmation.foodType)}
                </p>
              )}
              <p>
                <strong>Fecha:</strong> {formatDate(deleteConfirmation.createdAt)}
              </p>
              <div
                className="modal-actions"
                style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}
              >
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteDonation(deleteConfirmation._id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>} Eliminar
                </button>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmation(null)} disabled={isDeleting}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
