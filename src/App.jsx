import { useEffect, useState } from 'react'
import Header from './components/Header'
import MenuPage from './components/MenuPage'
import PromotionsPage from './components/PromotionsPage'
import ContactPage from './components/ContactPage'
import AdminPage from './components/AdminPage'
import ChatbotWidget from './components/ChatbotWidget'
import './App.css'

const resolveView = () => {
  const hash = window.location.hash.replace('#', '')
  return hash === 'menu'
    ? 'menu'
    : hash === 'promociones'
      ? 'promotions'
      : hash === 'contacto'
      ? 'contact'
      : hash === 'admin'
        ? 'admin'
        : 'home'
}

function App() {
  const [view, setView] = useState(resolveView)

  useEffect(() => {
    const onHashChange = () => {
      setView(resolveView())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <>
      <Header activeView={view} setView={setView}>
        {view === 'menu' ? (
          <MenuPage />
        ) : view === 'promotions' ? (
          <PromotionsPage />
        ) : view === 'contact' ? (
          <ContactPage />
        ) : view === 'admin' ? (
          <AdminPage />
        ) : null}
      </Header>
      {view !== 'admin' ? <ChatbotWidget /> : null}
    </>
  )
}

export default App
