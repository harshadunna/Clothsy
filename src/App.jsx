import './App.css'
import Navigation from './customer/components/Navigation/Navigation'
import HomePage from './customer/pages/HomePage'
import Footer from './customer/components/Footer/Footer'

function App() {

  return (
    <>
    <div>
      <Navigation />
    </div>

    <div>
      <HomePage />
    </div>
    <div>
      <Footer />
    </div>
    </>
  );
}

export default App
