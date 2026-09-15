import { useEffect, useState } from 'react'
import { getCustomers, transferMoney, errorMessage } from '../api'

function TransferFund() {
  const [customers, setCustomers] = useState([])
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState(null)

  const loadCustomers = () =>
    getCustomers()
      .then((res) => setCustomers(res.data))
      .catch((err) => setMessage({ ok: false, text: errorMessage(err) }))

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sender === receiver) {
      setMessage({ ok: false, text: 'La cuenta de origen y la de destino deben ser distintas.' })
      return
    }
    try {
      const res = await transferMoney({
        senderAccountNumber: sender,
        receiverAccountNumber: receiver,
        amount: Number(amount),
      })
      setMessage({ ok: true, text: `Transferencia #${res.data.id} realizada por $${res.data.amount}.` })
      setAmount('')
      loadCustomers() // refresca los saldos
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    }
  }

  return (
    <section>
      <h2>Transferir dinero</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Cuenta de origen
          <select value={sender} onChange={(e) => setSender(e.target.value)} required>
            <option value="">Selecciona una cuenta</option>
            {customers.map((c) => (
              <option key={c.id} value={c.accountNumber}>
                {c.accountNumber} - {c.firstName} {c.lastName} (saldo ${c.balance})
              </option>
            ))}
          </select>
        </label>

        <label>
          Cuenta de destino
          <select value={receiver} onChange={(e) => setReceiver(e.target.value)} required>
            <option value="">Selecciona una cuenta</option>
            {customers.map((c) => (
              <option key={c.id} value={c.accountNumber}>
                {c.accountNumber} - {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Monto
          <input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>

        <button type="submit">Transferir</button>
        {message && <p className={message.ok ? 'ok' : 'error'}>{message.text}</p>}
      </form>
    </section>
  )
}

export default TransferFund
