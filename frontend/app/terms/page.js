export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>Terms & Conditions & Refund Policy</h1>
      
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>1. Booking & Payment Policy</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>All bookings made with Creta Tours OPC Pvt. Ltd. shall be considered confirmed only upon receipt of advance/full payment.</li>
          <li style={{ marginBottom: 8 }}>Payment once made shall be deemed acceptance of all terms and conditions mentioned herein.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>2. Strict No Refund Policy</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>No refund request shall be entertained after 30 (Thirty) days from the date of receipt of funds under any circumstances.</li>
          <li style={{ marginBottom: 8 }}>After completion of 30 days, all transactions shall be treated as final, binding, and non-refundable.</li>
          <li style={{ marginBottom: 8 }}>This policy applies irrespective of reasons including but not limited to personal issues, change of plans, medical emergencies, or any unforeseen circumstances.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>3. Cancellation Policy (Within 30 Days)</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>Cancellation requests must be made in writing via registered email or official communication channel.</li>
          <li style={{ marginBottom: 8 }}>
            Refund (if applicable) within 30 days shall be processed after deducting:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Administrative charges</li>
              <li>Vendor cancellation charges</li>
              <li>Taxes and processing fees</li>
            </ul>
          </li>
          <li style={{ marginBottom: 8 }}>Refund processing time: 7–15 working days</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>4. No Show / Last Minute Cancellation</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>In case of no show or cancellation close to departure date, no refund shall be applicable.</li>
          <li style={{ marginBottom: 8 }}>Any unused services during the trip will not be refunded.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>5. Change / Modification Policy</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>Any changes in booking (date, destination, passenger details) are subject to availability and additional charges.</li>
          <li style={{ marginBottom: 8 }}>Company reserves the right to approve or deny modification requests.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>6. Third Party Services</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>Creta Tours OPC Pvt. Ltd. acts as an intermediary for airlines, hotels, transport providers, etc.</li>
          <li style={{ marginBottom: 8 }}>
            The company shall not be responsible for:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Delay, cancellation, or failure of services by third-party vendors</li>
              <li>Natural calamities, government restrictions, or force majeure events</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>7. Liability Disclaimer</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>The company shall not be liable for any loss, injury, accident, or damage incurred during travel.</li>
          <li style={{ marginBottom: 8 }}>Travelers are advised to obtain appropriate travel insurance.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>8. Force Majeure</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            No refund or compensation shall be provided in case of events beyond control such as:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Natural disasters</li>
              <li>Political disturbances</li>
              <li>Pandemic / government restrictions</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>9. Jurisdiction</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>All disputes shall be subject to the jurisdiction of courts in [Mumbai] only.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>10. Acceptance of Terms</h3>
        <ul style={{ color: 'var(--text-light)', paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>By making payment, the customer acknowledges and agrees to all terms and conditions stated above.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: 24, border: '2px solid rgba(255, 68, 68, 0.3)', backgroundColor: 'rgba(255, 68, 68, 0.05)' }}>
        <h3 style={{ fontSize: 20, marginBottom: 12, color: 'var(--error-color, #ff4444)' }}>⚠️ IMPORTANT NOTICE</h3>
        <p style={{ color: 'var(--error-color, #ff4444)', fontWeight: 'bold' }}>
          STRICTLY NO REFUND WILL BE ENTERTAINED AFTER 30 DAYS FROM THE DATE OF PAYMENT UNDER ANY CIRCUMSTANCES.
        </p>
      </div>

    </div>
  );
}
