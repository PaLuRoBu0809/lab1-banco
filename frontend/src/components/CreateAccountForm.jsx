import { useState } from 'react'
import { createCustomer, errorMessage } from '../api'

const empty = { firstName: '', lastName: '', accountNumber: '', balance: '' }

function CreateAccountForm({ onCreated }) {
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createCustomer({ ...form, balance: Number(form.balance) })
      setMessage({ ok: true, text: 'Cliente creado.' })
      setForm(empty)
      onCreated()
    } catch (error) {
      setMessage({ ok: false, text: errorMessage(error) })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>Crear cliente</h3>
      <input name="firstName" placeholder="Nombre" value={form.firstName} onChange={handleChange} required />
      <input name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange} required />
      <input name="accountNumber" placeholder="Número de cuenta" value={form.accountNumber} onChange={handleChange} required />
      <input name="balance" type="number" min="0" step="0.01" placeholder="Saldo inicial" value={form.balance} onChange={handleChange} required />
      <button type="submit">Crear cliente</button>
      {message && <p className={message.ok ? 'ok' : 'error'}>{message.text}</p>}
    </form>
  )
}

export default CreateAccountForm
