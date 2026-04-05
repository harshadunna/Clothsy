import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../../config/api";
import html2pdf from "html2pdf.js";

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 1. Create a reference to target ONLY the invoice div
  const invoiceRef = useRef(null);

  useEffect(() => {
    const link1 = document.createElement("link");
    link1.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    link1.rel = "stylesheet";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    link2.rel = "stylesheet";
    document.head.appendChild(link2);

    api.get(`/api/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order for invoice:", err);
        setLoading(false);
      });

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, [orderId]);

  // 2. The  function to download the PDF
  const handleDownloadPdf = () => {
    setIsDownloading(true);
    const element = invoiceRef.current;
    
    const opt = {
      margin:       0,
      filename:     `Clothsy_Invoice_ORD${order.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, // useCORS allows external images to load in the PDF
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate and save the PDF, then reset the button state
    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f0f0f0]">
        <div className="w-8 h-8 border-2 border-t-transparent border-gray-800 animate-spin rounded-full"></div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const shortDate = new Date(order.createdAt).toLocaleDateString("en-GB"); // DD.MM.YYYY

  const itemTotal = order.totalDiscountedPrice || 0;
  const shippingFee = (itemTotal > 0 && itemTotal < 2999) ? 100 : 0;
  const finalTotal = itemTotal + shippingFee;

  const gstAmount = (finalTotal * 0.18).toFixed(2);

  return (
    <div className="bg-[#f0f0f0] min-h-screen flex justify-center py-10 print:py-0 print:bg-white text-[#1d1b18] selection:bg-[#fea052] selection:text-[#1d1b18]">
      
      {/* 3. Attach the ref to this container */}
      <div ref={invoiceRef} className="print-container bg-[#fef9f2] w-[210mm] min-h-[297mm] p-[40px] shadow-lg flex flex-col relative overflow-hidden">
        
        {/* Header Section */}
        <header className="flex justify-between items-end pb-4">
          <div>
            <h1 className="font-serif text-5xl font-light tracking-[0.3em] uppercase leading-none">CLOTHSY</h1>
            <p className="font-serif italic text-sm mt-2 text-[#474741]">Seasonless. Considered.</p>
          </div>
          <div className="text-right">
            <h2 className="font-sans text-xl font-medium tracking-widest text-[#C8742A]">INVOICE</h2>
            <div className="font-mono text-[10px] uppercase mt-1">
              <p>INV NO: #CLS-{order.id}00</p>
              <p>DATE: {orderDate}</p>
            </div>
          </div>
        </header>

        {/* Signature Rule */}
        <div className="h-[1.5px] w-full bg-[#C8742A] mb-12"></div>

        {/* Billing & Shipping Information */}
        <div className="grid grid-cols-2 gap-0 bg-[#f8f3ed] border-[0.5px] border-[#c8c7bf] mb-12">
          <div className="p-8 border-r-[0.5px] border-[#c8c7bf]">
            <h3 className="font-mono text-[10px] tracking-widest text-[#474741] mb-4 uppercase">BILL TO</h3>
            <p className="font-serif text-lg leading-tight mb-1">{order.user?.firstName} {order.user?.lastName}</p>
            <div className="font-sans text-xs text-[#474741] leading-relaxed">
              <p>{order.shippingAddress?.streetAddress}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.zipCode}</p>
              <p>India</p>
            </div>
          </div>
          <div className="p-8">
            <h3 className="font-mono text-[10px] tracking-widest text-[#474741] mb-4 uppercase">SHIP TO</h3>
            <p className="font-serif text-lg leading-tight mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <div className="font-sans text-xs text-[#474741] leading-relaxed">
              <p>{order.shippingAddress?.streetAddress}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.zipCode}</p>
              <p>Ph: {order.shippingAddress?.mobile}</p>
            </div>
          </div>
        </div>

        {/* Order Meta Info */}
        <div className="grid grid-cols-4 mb-12 border-b-[0.5px] border-[#c8c7bf] pb-6">
          <div>
            <h4 className="font-mono text-[9px] text-[#474741] tracking-widest mb-1 uppercase">ORDER #</h4>
            <p className="font-sans text-xs font-medium">CLS-WEB-{order.id}</p>
          </div>
          <div>
            <h4 className="font-mono text-[9px] text-[#474741] tracking-widest mb-1 uppercase">DATE</h4>
            <p className="font-sans text-xs font-medium">{shortDate}</p>
          </div>
          <div>
            <h4 className="font-mono text-[9px] text-[#474741] tracking-widest mb-1 uppercase">PAYMENT</h4>
            <p className="font-sans text-xs font-medium">Prepaid / Card</p>
          </div>
          <div>
            <h4 className="font-mono text-[9px] text-[#474741] tracking-widest mb-1 uppercase">TRACKING</h4>
            <p className="font-sans text-xs font-medium">{order.trackingNumber || "Pending"}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f3ed] border-b-[0.5px] border-[#c8c7bf]">
                <th className="py-3 px-4 font-mono text-[9px] tracking-widest uppercase">#</th>
                <th className="py-3 px-4 font-mono text-[9px] tracking-widest uppercase">Product</th>
                <th className="py-3 px-4 font-mono text-[9px] tracking-widest uppercase">SKU</th>
                <th className="py-3 px-4 font-mono text-[9px] tracking-widest uppercase">Size</th>
                <th className="py-3 px-4 font-mono text-[9px] tracking-widest uppercase">Qty</th>
                <th className="py-3 px-4 font-mono text-[9px] tracking-widest uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {order.orderItems?.map((item, index) => (
                <tr key={item.id} className="border-b-[0.5px] border-[#c8c7bf]">
                  <td className="py-6 px-4 font-mono">0{index + 1}</td>
                  <td className="py-6 px-4 font-serif text-base italic">{item.product?.title}</td>
                  <td className="py-6 px-4 font-mono text-[10px]">PRD-{item.product?.id}</td>
                  <td className="py-6 px-4 uppercase">{item.size}</td>
                  <td className="py-6 px-4 font-mono">{item.quantity}</td>
                  <td className="py-6 px-4 font-mono text-right">₹{item.discountedPrice?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Status */}
        <div className="mt-12 flex justify-between items-start">
          <div>
            <div className="inline-block bg-[#010100] text-white font-mono text-[10px] tracking-[0.2em] px-6 py-2 uppercase">
              {order.orderStatus === "CANCELLED" ? "VOIDED" : "PAID"}
            </div>
          </div>
          <div className="w-64">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-[#474741] uppercase">Subtotal</span>
              <span className="font-mono text-xs">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-[#C8742A]">
              <span className="font-mono text-[10px] uppercase">Discount</span>
              <span className="font-mono text-xs">-₹{(order.totalPrice - order.totalDiscountedPrice)?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-[#474741] uppercase">Shipping</span>
              <span className="font-mono text-xs">{shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b-[0.5px] border-[#c8c7bf]">
              <span className="font-mono text-[10px] text-[#474741] uppercase">GST Included</span>
              <span className="font-mono text-xs">₹{gstAmount}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-sans font-bold text-sm tracking-widest uppercase">TOTAL</span>
              <span className="font-mono text-2xl font-bold leading-none">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-20">
          <div className="flex justify-between items-baseline mb-6">
            <p className="font-serif italic text-lg text-[#474741]">Thank you for shopping with Clothsy</p>
            <p className="font-sans text-[9px] uppercase tracking-widest opacity-60">Returns accepted within 7 days</p>
          </div>
          <div className="h-[0.5px] w-full bg-[#c8c7bf] mb-4"></div>
          <div className="flex justify-between font-mono text-[8px] tracking-[0.1em] text-[#474741] uppercase">
            <div>CLOTHSY RETAIL | HYDERABAD, IN 500081</div>
            <div>CONTACT: ASSISTANCE@CLOTHSY.COM</div>
          </div>
        </footer>

      </div>

      {/* Floating Print Button */}
      <button 
        className="no-print fixed bottom-8 right-8 bg-[#010100] text-white px-8 py-4 font-sans font-bold text-xs tracking-widest uppercase shadow-xl hover:bg-[#474741] transition-colors flex items-center gap-2 disabled:opacity-50" 
        onClick={handleDownloadPdf}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>sync</span>
            GENERATING PDF...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>download</span>
            DOWNLOAD PDF
          </>
        )}
      </button>

    </div>
  );
}