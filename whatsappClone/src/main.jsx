import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChatProvider } from './Context/ChatContext'


ReactDOM.createRoot(document.getElementById('root')).render(
    <ChatProvider>
        <App />
    </ChatProvider>
)
