import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Fields from './components/Fields';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero />
                    <Fields />
                  </>
                } />
              </Routes>
            </main>
            <Footer />
            <BookingModal />
            <AuthModal />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;