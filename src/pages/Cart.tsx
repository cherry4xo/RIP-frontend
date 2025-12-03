// src/pages/Cart.tsx
import { useEffect, useState } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBasketInfo,
  updateCartItem,
  submitCart,
  clearError,
} from '../store/cartSlice';
import { getReportDetails, deleteDraftReport } from '../services/api';
import type { AssessmentReportDetails, ProtectionLevel } from '../types/api';
import './Cart.css';

const PROTECTION_LEVEL_LABELS: Record<ProtectionLevel, string> = {
  none: 'Нет',
  basic: 'Базовая (WAF)',
  full: 'Полная',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  formed: 'Сформирована',
  completed: 'Завершена',
  cancelled: 'Отклонена',
  deleted: 'Удалена',
};

export function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { basketInfo, loading, error } = useAppSelector((state) => state.cart);

  const [cartDetails, setCartDetails] = useState<AssessmentReportDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [targetSystem, setTargetSystem] = useState('');
  const [serviceParams, setServiceParams] = useState<
    Map<number, { protectionLevel: ProtectionLevel; comment: string }>
  >(new Map());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(fetchBasketInfo());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    const loadCartDetails = async () => {
      if (basketInfo && basketInfo.report_id !== -1 && token) {
        setLoadingDetails(true);
        try {
          const details = await getReportDetails(token, basketInfo.report_id);
          setCartDetails(details);

          // Загружаем существующие данные
          if (details.target_system_info) {
            setTargetSystem(details.target_system_info);
          }

          // Инициализируем параметры для каждой услуги
          const newServiceParams = new Map();
          details.components.forEach((component) => {
            newServiceParams.set(component.vulnerability_assessment.id, {
              protectionLevel: component.protection_level,
              comment: component.comment || '',
            });
          });
          setServiceParams(newServiceParams);
        } catch (err) {
          console.error('Error loading cart details:', err);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    loadCartDetails();
  }, [basketInfo, token]);

  const updateServiceParam = (
    assessmentId: number,
    field: 'protectionLevel' | 'comment',
    value: string
  ) => {
    const newParams = new Map(serviceParams);
    const current = newParams.get(assessmentId) || { protectionLevel: 'none' as ProtectionLevel, comment: '' };
    newParams.set(assessmentId, {
      ...current,
      [field]: value,
    });
    setServiceParams(newParams);
  };

  const handleUpdateAllProtections = async () => {
    if (!cartDetails || cartDetails.components.length === 0) return;

    // Обновляем параметры для всех услуг
    for (const component of cartDetails.components) {
      const assessmentId = component.vulnerability_assessment.id;
      const params = serviceParams.get(assessmentId);

      if (params) {
        await dispatch(
          updateCartItem({
            assessmentId,
            data: { protection_level: params.protectionLevel, comment: params.comment },
          })
        );
      }
    }

    // Перезагружаем детали
    if (basketInfo && basketInfo.report_id !== -1 && token) {
      const details = await getReportDetails(token, basketInfo.report_id);
      setCartDetails(details);
    }
  };

  const handleSubmitCart = async () => {
    if (!targetSystem || targetSystem.length < 5) {
      alert('Введите информацию о целевой системе (минимум 5 символов)');
      return;
    }

    // Сначала обновляем параметры всех услуг
    await handleUpdateAllProtections();

    setSubmitting(true);
    const result = await dispatch(submitCart(targetSystem));

    if (submitCart.fulfilled.match(result)) {
      alert('Заявка успешно сформирована! Расчет risk_score начнется автоматически.');
      navigate('/my-reports');
    }
    setSubmitting(false);
  };

  const handleDeleteDraft = async () => {
    if (!basketInfo || basketInfo.report_id === -1 || !token) return;

    if (!confirm('Вы уверены, что хотите удалить черновик заявки?')) {
      return;
    }

    try {
      await deleteDraftReport(token, basketInfo.report_id);
      alert('Черновик успешно удален');
      navigate('/services');
    } catch (err) {
      alert('Ошибка при удалении черновика');
      console.error(err);
    }
  };

  const hasItems = basketInfo && basketInfo.report_id !== -1 && basketInfo.item_count > 0;
  const totalPrice = cartDetails?.components
    .reduce((sum, component) => sum + Number(component.price_at_order_time), 0)
    .toFixed(2) || '0.00';

  if (loadingDetails) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="cart-container mt-4">
      <h1 className="mb-4">Оформление заявки</h1>

      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}

      {!hasItems ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4 className="text-muted mb-3">Корзина пуста</h4>
            <p className="text-muted mb-4">
              Добавьте услугу оценки уязвимостей в корзину, чтобы сформировать заявку
            </p>
            <Link to="/services">
              <Button variant="primary">
                Перейти к услугам
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col md={8}>
            {/* Целевая система */}
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Целевая система для анализа</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Например: yandex.ru"
                    value={targetSystem}
                    onChange={(e) => setTargetSystem(e.target.value)}
                    disabled={loading || submitting}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Параметры для услуг */}
            <div className="services-list">
              {cartDetails?.components.map((component) => {
                const assessmentId = component.vulnerability_assessment.id;
                const params = serviceParams.get(assessmentId) || { protectionLevel: 'none' as ProtectionLevel, comment: '' };

                return (
                  <Card key={assessmentId} className="service-card mb-4">
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          {/* Картинка услуги */}
                          <div className="service-image-container">
                            <img
                              src={component.vulnerability_assessment.image_url || '/images/services/placeholder.png'}
                              alt={component.vulnerability_assessment.title}
                              className="service-image"
                            />
                          </div>
                        </Col>
                        <Col md={8}>
                          <Form.Group className="mb-3">
                            <Form.Label className="service-title">{component.vulnerability_assessment.title}</Form.Label>
                            {component.vulnerability_assessment.short_description && (
                              <p className="text-muted small mb-3">
                                {component.vulnerability_assessment.short_description}
                              </p>
                            )}
                            <div className="service-price mb-3">
                              {Number(component.price_at_order_time).toFixed(2)} руб.
                            </div>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Уровень вашей защиты</Form.Label>
                            <Form.Select
                              value={params.protectionLevel}
                              onChange={(e) => updateServiceParam(assessmentId, 'protectionLevel', e.target.value)}
                              disabled={loading || submitting}
                            >
                              <option value="none">{PROTECTION_LEVEL_LABELS.none}</option>
                              <option value="basic">{PROTECTION_LEVEL_LABELS.basic}</option>
                              <option value="full">{PROTECTION_LEVEL_LABELS.full}</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-0">
                            <Form.Label>Комментарий (опционально)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Например: версия ПО, WordPress 5.8"
                              value={params.comment}
                              onChange={(e) => updateServiceParam(assessmentId, 'comment', e.target.value)}
                              disabled={loading || submitting}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>

            {/* Кнопка оформления */}
            <Card className="mb-4">
              <Card.Body>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitCart}
                  disabled={loading || submitting || !targetSystem || targetSystem.length < 5}
                  className="w-100"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Формирование...
                    </>
                  ) : (
                    'Оформить и рассчитать риск'
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            {/* Детали заявки */}
            <Card className="cart-details-card">
              <Card.Body>
                <h5 className="mb-4">Детали заявки</h5>

                <div className="detail-item mb-3">
                  <span className="detail-label">Статус:</span>
                  <span className="detail-value">{STATUS_LABELS['draft']}</span>
                </div>

                <div className="detail-item mb-4">
                  <span className="detail-label">Предварительная стоимость:</span>
                  <span className="detail-value price">{totalPrice} руб.</span>
                </div>

                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={handleDeleteDraft}
                  disabled={loading || submitting}
                >
                  Удалить черновик
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
