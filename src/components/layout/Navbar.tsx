// src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container } from 'react-bootstrap';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const baseUrl = import.meta.env.BASE_URL;
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(!expanded);
  const handleNavClick = () => setExpanded(false);

  return (
    <BSNavbar 
      expanded={expanded}
      onToggle={handleToggle}
      className="py-4"
      expand="md"
    >
      <Container fluid className="main-container">
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-3">
          <img
            src={`${baseUrl}logo.svg`}
            alt="Positive Technologies"
            height="28"
          />
          <span>Positive Tech</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
              onClick={handleNavClick}
            >
              Главная
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/services"
              className={location.pathname.startsWith('/services') ? 'active' : ''}
              onClick={handleNavClick}
            >
              Услуги
            </Nav.Link>
          </Nav>

          <Link 
            to="/" 
            className="d-flex align-items-center ms-3"
            onClick={handleNavClick}
          >
            <img
              src={`${baseUrl}home.svg`}
              alt="Home"
              height="24"
              style={{ opacity: 0.8, transition: 'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
            />
          </Link>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
