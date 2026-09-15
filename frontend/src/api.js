import axios from 'axios'

// URL del backend Spring Boot
const api = axios.create({ baseURL: 'http://localhost:8080/api' })

// ---- Clientes (CustomerController) ----
export const getCustomers = () => api.get('/customers')
export const createCustomer = (customer) => api.post('/customers', customer)

// ---- Transacciones (TransactionController) ----
export const transferMoney = (transfer) => api.post('/transactions', transfer)
export const getTransactions = (accountNumber) => api.get(`/transactions/${accountNumber}`)

// Convierte cualquier error de Axios en un texto legible
export const errorMessage = (error) => {
  if (!error.response) return 'No hay conexión con el backend. ¿Está corriendo en el puerto 8080?'
  const data = error.response.data
  if (typeof data === 'string' && data) return data
  return data?.message || `Error ${error.response.status}`
}
