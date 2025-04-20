"use client"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import "@/styles/admin/veterinario.css";

export default function VeterinaryServicesAdmin() {
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("services")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    icon: "fa-paw",
    active: true,
  })
  const [editingService, setEditingService] = useState(null)
  const [appointmentFilter, setAppointmentFilter] = useState("all")
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [appointmentFormData, setAppointmentFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  })
  const [availableTimes, setAvailableTimes] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
    fetchAppointments()

    // Generar horarios disponibles
    const times = []
    for (let hour = 9; hour <= 16; hour++) {
      times.push(`${hour}:00`)
      if (hour < 16) {
        times.push(`${hour}:30`)
      }
    }
    setAvailableTimes(times)
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/veterinary/services")
      const data = await response.json()

      if (data.success) {
        setServices(data.services)
      } else {
        setError("Error al cargar los servicios veterinarios")
        toast({
          title: "Error",
          description: "No se pudieron cargar los servicios veterinarios",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error fetching veterinary services:", err)
      setError("Error al cargar los servicios veterinarios")
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios veterinarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/veterinary/appointment")
      const data = await response.json()

      if (data.success) {
        setAppointments(data.appointments)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target
    setAppointmentFormData({
      ...appointmentFormData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const endpoint = "/api/veterinary/services"
      const method = editingService ? "PUT" : "POST"
      const body = editingService ? { ...formData, serviceId: editingService._id } : formData

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: editingService ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
        })
        resetForm()
        fetchServices()
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al procesar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting service:", error)
      toast({
        title: "Error",
        description: "Error al procesar el servicio",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      icon: service.icon || "fa-paw",
      active: service.active,
    })
  }

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment)

    // Formatear la fecha para el input date (YYYY-MM-DD)
    const date = new Date(appointment.appointmentDate)
    const formattedDate = date.toISOString().split("T")[0]

    setAppointmentFormData({
      appointmentDate: formattedDate,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes || "",
    })
  }

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return

    try {
      const response = await fetch("/api/veterinary/appointment/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: editingAppointment._id,
          status: editingAppointment.status,
          appointmentDate: appointmentFormData.appointmentDate,
          appointmentTime: appointmentFormData.appointmentTime,
          notes: appointmentFormData.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Cita actualizada correctamente",
        })
        setEditingAppointment(null)
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al actualizar la cita",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la cita",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (serviceId) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este servicio?")) {
      return
    }

    try {
      const response = await fetch(`/api/veterinary/services?id=${serviceId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Servicio desactivado correctamente",
        })
        fetchServices()
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al desactivar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: "Error al desactivar el servicio",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      icon: "fa-paw",
      active: true,
    })
    setEditingService(null)
  }

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await fetch("/api/veterinary/appointment/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: `Cita ${
            status === "confirmed" ? "confirmada" : status === "cancelled" ? "cancelada" : "completada"
          } correctamente`,
        })
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al actualizar el estado de la cita",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el estado de la cita",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const filteredAppointments =
    appointmentFilter === "all"
      ? appointments
      : appointments.filter((appointment) => appointment.status === appointmentFilter)

  return (
    <div className="admin-container">
      <h1 className="admin-title">Gestión de Servicios Veterinarios</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          Servicios
        </button>
        <button
          className={`admin-tab ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          Citas
        </button>
      </div>

      {activeTab === "services" && (
        <div className="admin-section">
          <h2 className="section-title">{editingService ? "Editar Servicio" : "Agregar Nuevo Servicio"}</h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre del Servicio:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="price">Precio:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icono:</label>
              <select id="icon" name="icon" value={formData.icon} onChange={handleInputChange}>
                <option value="fa-paw">Huella (fa-paw)</option>
                <option value="fa-syringe">Jeringa (fa-syringe)</option>
                <option value="fa-stethoscope">Estetoscopio (fa-stethoscope)</option>
                <option value="fa-cut">Tijeras (fa-cut)</option>
                <option value="fa-first-aid">Primeros Auxilios (fa-first-aid)</option>
                <option value="fa-pills">Medicamentos (fa-pills)</option>
                <option value="fa-heartbeat">Latido (fa-heartbeat)</option>
                <option value="fa-microscope">Microscopio (fa-microscope)</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="active">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                Activo
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingService ? "Actualizar Servicio" : "Agregar Servicio"}
              </button>
              {editingService && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <h2 className="section-title">Lista de Servicios</h2>

          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando servicios...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-info-circle"></i>
              <p>No hay servicios veterinarios registrados.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id} className={!service.active ? "inactive-row" : ""}>
                      <td>
                        <i className={`fas ${service.icon || "fa-paw"} me-2`}></i> {service.name}
                      </td>
                      <td>{service.description}</td>
                      <td>{formatPrice(service.price)}</td>
                      <td>
                        <span className={`status-badge ${service.active ? "active" : "inactive"}`}>
                          {service.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(service)}>
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        {service.active && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(service._id)}>
                            <i className="fas fa-trash-alt"></i> Desactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="admin-section">
          <h2 className="section-title">Gestión de Citas</h2>

          <div className="filter-controls mb-4">
            <label htmlFor="status-filter" className="me-2">
              Filtrar por estado:
            </label>
            <select
              id="status-filter"
              value={appointmentFilter}
              onChange={(e) => setAppointmentFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">Todas las citas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando citas...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-info-circle"></i>
              <p>No hay citas {appointmentFilter !== "all" ? `con estado "${appointmentFilter}"` : ""} registradas.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Propietario</th>
                    <th>Mascota</th>
                    <th>Servicio</th>
                    <th>Fecha y Hora</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.petOwnerName}</td>
                      <td>
                        {appointment.petName} (
                        {appointment.petType === "dog" ? "Perro" : appointment.petType === "cat" ? "Gato" : "Otro"})
                      </td>
                      <td>{appointment.service}</td>
                      <td>
                        {formatDate(appointment.appointmentDate)} - {appointment.appointmentTime}
                      </td>
                      <td>
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status === "pending"
                            ? "Pendiente"
                            : appointment.status === "confirmed"
                              ? "Confirmada"
                              : appointment.status === "completed"
                                ? "Completada"
                                : "Cancelada"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleEditAppointment(appointment)}>
                          <i className="fas fa-calendar-alt"></i> Reprogramar
                        </button>
                        {appointment.status === "pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => updateAppointmentStatus(appointment._id, "confirmed")}
                            >
                              <i className="fas fa-check"></i> Confirmar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                            >
                              <i className="fas fa-times"></i> Cancelar
                            </button>
                          </>
                        )}
                        {appointment.status === "confirmed" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => updateAppointmentStatus(appointment._id, "completed")}
                          >
                            <i className="fas fa-check-double"></i> Completar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal para reprogramar cita */}
          {editingAppointment && (
            <div className="modal" style={{ display: "block" }}>
              <div className="modal-content">
                <span className="close" onClick={() => setEditingAppointment(null)}>
                  &times;
                </span>
                <h2>Reprogramar Cita</h2>
                <div className="appointment-details">
                  <p>
                    <strong>Propietario:</strong> {editingAppointment.petOwnerName}
                  </p>
                  <p>
                    <strong>Mascota:</strong> {editingAppointment.petName} (
                    {editingAppointment.petType === "dog"
                      ? "Perro"
                      : editingAppointment.petType === "cat"
                        ? "Gato"
                        : "Otro"}
                    )
                  </p>
                  <p>
                    <strong>Servicio:</strong> {editingAppointment.service}
                  </p>
                </div>

                <form className="reschedule-form">
                  <div className="form-group">
                    <label htmlFor="appointmentDate">Nueva Fecha:</label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={appointmentFormData.appointmentDate}
                      onChange={handleAppointmentInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="appointmentTime">Nueva Hora:</label>
                    <select
                      id="appointmentTime"
                      name="appointmentTime"
                      value={appointmentFormData.appointmentTime}
                      onChange={handleAppointmentInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Notas adicionales:</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      value={appointmentFormData.notes}
                      onChange={handleAppointmentInputChange}
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={handleUpdateAppointment}>
                      Guardar Cambios
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingAppointment(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
