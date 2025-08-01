import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";

import SignInPage from "./components/Login";
import DashboardLayoutSlots from "./components/main";
import QRScannerDashboard from "./components/scanner";
import NotAuthorized from "./components/NotAuthorized";
import PrintIDCardsPage from "./components/DigitalID/PrintIDCardsPage";
import { isTokenValid } from "./utils/tokenUtils"; // import utility

function AnimatedRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const isValid = token && isTokenValid(token);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageWrapper><SignInPage /></PageWrapper>} />
      <Route 
        path="/NotAuthorize" 
        element={ <NotAuthorized /> }/>
        <Route 
        path="/all-digital-id" 
        element={isValid ? <PrintIDCardsPage />: <Navigate to ="/NotAuthorize"/> }/>
      <Route 
        path="/Scanner" 
        element={ isValid ?<QRScannerDashboard /> : <Navigate to ="/NotAuthorize"/>}/>
      <Route 
        path="/dashboard/*" 
        element={isValid ? <DashboardLayoutSlots /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

function PageWrapper({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
