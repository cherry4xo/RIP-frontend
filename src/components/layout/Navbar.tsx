// src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container } from 'react-bootstrap';

export function Navbar() {
  const location = useLocation();
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <BSNavbar className="py-4">
      <Container fluid className="main-container">
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-3">
          <img
            src={`${baseUrl}logo.svg`}
            alt="Positive Technologies"
            height="28"
          />
          <span>Positive Tech</span>
        </BSNavbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link
            as={Link}
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Главная
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/services"
            className={location.pathname.startsWith('/services') ? 'active' : ''}
          >
            Услуги
          </Nav.Link>
        </Nav>

        <Link to="/" className="d-flex align-items-center">
          <img
            src={`${baseUrl}home.svg`}
            alt="Home"
            height="24"
            style={{ opacity: 0.8, transition: 'opacity 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
          />
        </Link>
      </Container>
    </BSNavbar>
  );
}
