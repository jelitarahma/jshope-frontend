
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const linkStyle = { textDecoration: 'none' };

  return (
    <footer style={{ backgroundColor: '#114a26ff', color: 'white', padding: '48px 0 0 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px 48px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px' }}>
          <div>
            <Link href="/" style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #ffffffff, #ffffffff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '18px' }}>JS</span>
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 'bold',color: '#ffffffff', display: 'block' }}>JShope</span>
                <span style={{ fontSize: '12px', color: '#ffffffff', marginTop: '-4px', display: 'block' }}>by Jelita Rahma</span>
              </div>
            </Link>
            <p style={{ color: '#ffffffff', fontSize: '14px', lineHeight: '1.6', marginTop: '16px' }}>
              Your one-stop destination for quality products at unbeatable prices.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: '600', fontSize: '16px',color: '#ffffffff', marginBottom: '20px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="/" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>Home</Link></li>
              <li><Link href="/products" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>All Products</Link></li>
              <li><Link href="/cart" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>Shopping Cart</Link></li>
              <li><a href="#" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: '600', fontSize: '16px',color: '#ffffffff', marginBottom: '20px' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>Contact Us</a></li>
              <li><a href="#" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>FAQs</a></li>
              <li><a href="#" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>Shipping Info</a></li>
              <li><a href="#" style={{ ...linkStyle, color: '#ffffffff', fontSize: '14px' }}>Return Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: '600', fontSize: '16px',color: '#ffffffff', marginBottom: '20px' }}>Stay Updated</h4>
            <p style={{ color: '#ffffffff', fontSize: '14px', marginBottom: '16px' }}>
              Subscribe for special offers and updates.
            </p>
            <form style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Your email"
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  backgroundColor: '#e1ffecff', 
                  border: '1px solid #00270eff', 
                  borderRadius: '8px', 
                  color: '#373737ff', 
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
            © {currentYear} JShope by Jelita Rahma. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#" style={{ ...linkStyle, color: 'white', fontSize: '14px' }}>Privacy</a>
            <a href="#" style={{ ...linkStyle, color: 'white', fontSize: '14px' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
