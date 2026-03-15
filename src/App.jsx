import './App.css'
import Navigation from './customer/components/Navigation/Navigation'
import Footer from './customer/components/Footer/Footer'
import Product from './customer/components/Product/Product'

function App() {

  return (
    <>
    <div>
      <Navigation />
    </div>

    <div>
      {/* <HomePage /> */}
      <Product />
    </div>
    <div>
      <Footer />
    </div>
    </>
  );
}

export default App
