import './App.css'
import Navigation from './customer/components/Navigation/Navigation'
import Footer from './customer/components/Footer/Footer'
import Product from './customer/components/Product/Product'
import ProductDetails from './customer/components/ProductDetails/ProductDetails'
import Cart from './customer/components/Cart/Cart'
import Checkout from './customer/components/Checkout/Checkout'
import Order from './customer/components/Order/Order'

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
      {/* <Checkout /> */}
      <Order />
    </div>
    <div>
      <Footer />
    </div>
    </>
  );
}

export default App
