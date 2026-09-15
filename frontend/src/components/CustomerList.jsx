import { useEffect, useState } from 'react'
import { getCustomers, errorMessage } from '../api'
import CreateAccountForm from './CreateAccountForm.jsx'

function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState(null)

  const loadCustomers = async () => {
    try {
      const response = await getCustomers()
      setCustomers(response.data)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <section>
      <h2>Consultar clientes</h2>
      {error && <p className="error">{error}</p>}

      {customers.length === 0 ? (
        <p>No hay clientes registrados. Crea el primero con el formulario de abajo.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cuenta</th>
              <th className="num">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.firstName}</td>
                <td>{c.lastName}</td>
                <td>{c.accountNumber}</td>
                <td className="num">${c.balance.toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CreateAccountForm onCreated={loadCustomers} />
    </section>
  )
}

export default CustomerList
