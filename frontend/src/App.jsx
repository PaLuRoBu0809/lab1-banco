import { useState } from 'react'
import CustomerList from './components/CustomerList.jsx'
import TransferFund from './components/TransferFund.jsx'
import TransactionHistory from './components/TransactionHistory.jsx'

function App() {
  const [view, setView] = useState('clientes')

  return (
    <div className="container">
      <header>
        <h1>Banco UdeA</h1>
        <nav>
          <button className={view === 'clientes' ? 'active' : ''} onClick={() => setView('clientes')}>
            Clientes
          </button>
          <button className={view === 'transferir' ? 'active' : ''} onClick={() => setView('transferir')}>
            Transferir
          </button>
          <button className={view === 'historial' ? 'active' : ''} onClick={() => setView('historial')}>
            Historial
          </button>
        </nav>
      </header>

      <main>
        {view === 'clientes' && <CustomerList />}
        {view === 'transferir' && <TransferFund />}
        {view === 'historial' && <TransactionHistory />}
      </main>
    </div>
  )
}

export default App
