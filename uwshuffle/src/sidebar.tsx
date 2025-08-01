import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidebar from './components/Sidebar'
import './index.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

ReactDOM.createRoot(document.getElementById('sidebar-root')!).render(
  <React.StrictMode>
    <Sidebar />
  </React.StrictMode>,
)