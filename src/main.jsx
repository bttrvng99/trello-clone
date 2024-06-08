// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '~/theme.js'

import { Experimental_CssVarsProvider as CssVarProvider } from '@mui/material/styles'

// Cấu hình react-toastify
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <CssVarProvider theme={theme}>
    <CssBaseline />
    <App />
    <ToastContainer theme='colored' position='bottom-left'/>
  </CssVarProvider>
  // </React.StrictMode>
)