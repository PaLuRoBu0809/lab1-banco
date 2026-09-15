import { useEffect, useState } from 'react'
import { getCustomers, getTransactions, errorMessage } from '../api'

function TransactionHistory() {
  const [customers, setCustomers] = useState([])
  const [account, setAccount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getCustomers()
      .then((res) => setCustomers(res.data))
      .catch((err) => setError(errorMessage(err)))
  }, [])

  // Cada vez que se elige una cuenta, se consulta su historial
  useEffect(() => {
    if (!account) {
      setTransactions([])
      return
    }
    getTransactions(account)
      .then((res) => {
        setTransactions(res.data)
        setError(null)
      })
      .catch((err) => setError(errorMessage(err)))
  }, [account])

  const formatDate = (value) => (value ? new Date(value).toLocaleString('es-CO') : '-')

  return (
    <section>
      <h2>Historial de transacciones</h2>
      {error && <p className="error">{error}</p>}

      <label className="form">
        Cliente
        <select value={account} onChange={(e) => setAccount(e.target.value)}>
          <option value="">Selecciona un cliente</option>
          {customers.map((c) => (
            <option key={c.id} value={c.accountNumber}>
              {c.accountNumber} - {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </label>

      {account && transactions.length === 0 && <p>Esta cuenta no tiene transacciones.</p>}

      {transactions.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Origen</th>
              <th>Destino</th>
              <th className="num">Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const sent = t.senderAccountNumber === account
              return (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td className={sent ? 'error' : 'ok'}>{sent ? 'Enviada' : 'Recibida'}</td>
                  <td>{t.senderAccountNumber}</td>
                  <td>{t.receiverAccountNumber}</td>
                  <td className="num">{sent ? '-' : '+'}${t.amount.toLocaleString('es-CO')}</td>
                  <td>{formatDate(t.timestamp)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default TransactionHistory
