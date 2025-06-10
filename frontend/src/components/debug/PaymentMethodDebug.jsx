import React from 'react';

/**
 * Debug component to show current payment method configuration
 */
const PaymentMethodDebug = ({ currentMethod, availableMethods }) => {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  const methods = availableMethods || [
    { value: 'razorpay', label: 'Razorpay - Online Payment', enabled: true },
    { value: 'cash_on_delivery', label: 'Cash on Delivery', enabled: true },
    { value: 'paypal', label: 'PayPal (Deprecated)', enabled: false },
    { value: 'credit_card', label: 'Credit Card (Deprecated)', enabled: false }
  ];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        🔧 Payment Method Debug Info
      </h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <div><strong>Current Method:</strong> {currentMethod}</div>
        <div><strong>Available Methods:</strong></div>
        <ul className="ml-4 space-y-1">
          {methods.map(method => (
            <li key={method.value} className={method.enabled ? 'text-green-700' : 'text-red-700'}>
              {method.enabled ? '✅' : '❌'} {method.label}
            </li>
          ))}
        </ul>
        <div className="mt-2 pt-2 border-t border-yellow-300">
          <strong>Razorpay Status:</strong> 
          <span className="text-green-700 ml-1">✅ Implemented & Active</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodDebug;
