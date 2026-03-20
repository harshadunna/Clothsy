import './App.css'
import Navigation from './customer/components/Navigation/Navigation'
import Footer from './customer/components/Footer/Footer'
import Product from './customer/components/Product/Product'
import ProductDetails from './customer/components/ProductDetails/ProductDetails'
import Cart from './customer/components/Cart/Cart'
import Checkout from './customer/components/Checkout/Checkout'

function App() {

  return (
    <>
    <div>
      <Navigation />
    </div>

    <div>
      {/* <HomePage /> */}
      {/* <Product /> */}
      {/* <ProductDetails /> */}
      {/* <Cart /> */}
      <Checkout />
    </div>
    <div>
      <Footer />
    </div>
    </>
  );
}

export default App
