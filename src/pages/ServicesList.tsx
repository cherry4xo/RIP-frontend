// src/pages/ServicesList.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import type { VulnerabilityAssessment, VulnerabilityAssessmentType } from '../types/api';
import { VulnerabilityAssessmentType as VulnType } from '../types/api';
import { getVulnerabilityAssessments } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSearchQuery, resetFilters, selectSearchQuery } from '../store/filtersSlice';
import './ServicesList.css';

const ASSESSMENT_TYPE_LABELS: Record<VulnerabilityAssessmentType, string> = {
  [VulnType.NETWORK_SCAN]: 'Сетевое сканирование',
  [VulnType.WEB_APP_PENTEST]: 'Тестирование веб-приложений',
  [VulnType.INFRASTRUCTURE_AUDIT]: 'Аудит инфраструктуры',
};

export function ServicesList() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);

  const [services, setServices] = useState<VulnerabilityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных только при монтировании компонента
  useEffect(() => {
    loadInitialServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Начальная загрузка всех услуг без фильтров
  async function loadInitialServices() {
    setLoading(true);
    setError(null);

    try {
      const data = await getVulnerabilityAssessments({});
      setServices(data);
    } catch (err) {
      setError('Не удалось загрузить список услуг');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Загрузка услуг с применением фильтра
  async function loadServices() {
    setLoading(true);
    setError(null);

    try {
      const params: {
        title?: string;
      } = {};
      if (searchQuery) params.title = searchQuery;

      const data = await getVulnerabilityAssessments(params);
      setServices(data);
    } catch (err) {
      setError('Не удалось загрузить список услуг');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadServices();
  }

  function handleResetFilters() {
    dispatch(resetFilters());
    // После сброса фильтров загружаем все услуги
    loadInitialServices();
  }

  function formatPrice(price: string | number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(Number(price));
  }

  return (
    <div className="services-list-page">
      <div className="hero-section">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="page-title">Виды анализа</h1>
          <div style={{ opacity: 0.4, cursor: 'not-allowed' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <Form onSubmit={handleSearchSubmit} className="filters-section">
        <Row className="g-3">
          <Col md={10}>
            <Form.Label className="text-secondary">Поиск по названию</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Поиск по наименованию..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="form-control"
              />
            </InputGroup>
          </Col>

          <Col md={2} className="d-flex align-items-end gap-2">
            <Button type="submit" className="btn-primary flex-grow-1">
              Поиск
            </Button>
            <Button
              type="button"
              className="btn-outline"
              onClick={handleResetFilters}
              title="Сбросить фильтры"
            >
              ✕
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Список услуг */}
      {loading ? (
        <div className="text-center py-5">
          <div className="text-secondary">Загрузка...</div>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <div className="text-danger">{error}</div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-secondary">Услуги не найдены</div>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4 services-grid">
          {services.map((service) => (
            <Col key={service.id}>
              <Link to={`/services/${service.id}`} className="service-card-link">
                <Card className="service-card h-100">
                  <div className="service-card-image">
                    <Card.Img
                      variant="top"
                      src={service.image_url || '/images/services/placeholder.png'}
                      alt={service.title}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{service.title}</Card.Title>
                    {service.short_description && (
                      <Card.Text className="text-secondary">
                        {service.short_description}
                      </Card.Text>
                    )}
                    <div className="mt-auto">
                      <div className="price">{formatPrice(service.price)}</div>
                      <div className="service-meta">
                        <span className="badge">{ASSESSMENT_TYPE_LABELS[service.assessment_type]}</span>
                        <span className="impact-level">Уровень: {service.impact_level}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
