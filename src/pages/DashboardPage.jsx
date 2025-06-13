// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Button, Modal, ListGroup } from '@themesberg/react-bootstrap';
import { PeopleFill, BoxSeam, CreditCard2FrontFill, Whatsapp } from 'react-bootstrap-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiClient from '../api';

// Lista de socios que no pagan mensualidad
const SOCIOS_SIN_PAGO = [
    'Gonzalo Fernandez',
    'Federico Soriano',
    'Mariana Peralta',
    'Guillermo Viera',
    'Andrea Lostorto'
];

const COLORS = ['#4CAF50', '#FFC107'];

const DashboardPage = () => {
         const [stats, setStats] = useState({ 
        socios_activos: 0, 
        productos_en_inventario: 0,
        pagos_mes: { pagados: 0, pendientes: 0 }
    });
    const [stockData, setStockData] = useState([]);
    const [pagosData, setPagosData] = useState([]);
    const [sociosPendientes, setSociosPendientes] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, productosRes, sociosRes, pagosRes] = await Promise.all([
                    apiClient.get('/dashboard-stats/'),
                    apiClient.get('/productos/'),
                    apiClient.get('/socios/?limit=1000'),
                    apiClient.get('/pagos/?limit=10000')
                ]);
                const todosLosSocios = sociosRes.data.results ? sociosRes.data.results : sociosRes.data;
                const sociosActivos = todosLosSocios.filter(socio => !SOCIOS_SIN_PAGO.includes(socio.nombre));
                const now = new Date();
                const mesActual = now.getMonth() + 1;
                const añoActual = now.getFullYear();
                const pagos = pagosRes.data.results ? pagosRes.data.results : pagosRes.data;
                const pagosMesActual = pagos.filter(p => 
                    p.mes === mesActual && p.año === añoActual
                );
                const sociosPagados = pagosMesActual.map(p => p.socio);
                const sociosPendientesList = sociosActivos.filter(s => !sociosPagados.includes(s.ci));
                setSociosPendientes(sociosPendientesList);
                setStats({
                    ...statsRes.data,
                    socios_activos: sociosActivos.length,
                    pagos_mes: {
                        pagados: sociosPagados.length,
                        pendientes: sociosPendientesList.length
                    }
                });
                setPagosData([
                    { name: 'Pagados', value: sociosPagados.length },
                    { name: 'Pendientes', value: sociosPendientesList.length }
                ]);
                const productos = productosRes.data.results ? productosRes.data.results : productosRes.data;
                const stock = productos
                    .filter(p => p.stock > 0)
                    .map(p => ({ nombre: p.nombre, stock: p.stock }));
                setStockData(stock);
            } catch (error) {
                console.error("Error al cargar el dashboard:", error);
            }
        };
        fetchData();
    }, []);
//console.log("Datos de socios pendientes:", sociosPendientes); // <--- AÑADE ESTA LÍNEA
    return (
        <Container fluid className="px-0">
            <Row className="justify-content-center">
                <Col xl={10} lg={12}>
                    <h1 className="mb-5 fw-bolder text-center w-100" style={{ color: '#1976d2', letterSpacing: 1, fontSize: '2.8rem' }}>
                        Dashboard Principal
                    </h1>
                    <Row className="mb-5 g-4">
                        <Col xs={12} md={6} lg={3} className="d-flex align-items-stretch">
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <PeopleFill size={32} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Socios Activos</Card.Title>
                                    <h2 className="text-primary fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{stats.socios_activos}</h2>
                                    <Card.Text className="text-muted small mb-0">
                                        (Excluyendo socios sin pago mensual)
                                    </Card.Text>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3} className="d-flex align-items-stretch">
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <BoxSeam size={32} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Productos en Inventario</Card.Title>
                                    <h2 className="text-success fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{stats.productos_en_inventario}</h2>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3} className="d-flex align-items-stretch">
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <CreditCard2FrontFill size={32} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Estado de Pagos</Card.Title>
                                    <div className="d-flex justify-content-center gap-4 w-100 mb-1">
                                        <div>
                                            <h3 className="text-success fw-bold mb-0" style={{ fontSize: '2rem' }}>{stats.pagos_mes.pagados}</h3>
                                            <div className="text-muted small">Pagados</div>
                                        </div>
                                        <div style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
                                            <h3 className="text-warning fw-bold mb-0" style={{ fontSize: '2rem' }}>{stats.pagos_mes.pendientes}</h3>
                                            <div className="text-muted small">Pendientes</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mb-5 g-4">
                        <Col xs={12} md={6} className="d-flex align-items-stretch">
                            <Card className="shadow border-0 w-100 bg-white p-3">
                                <Card.Title as="h4" className="mb-4 text-center text-primary">Estado de Pagos del Mes</Card.Title>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={pagosData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={110}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pagosData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} className="d-flex align-items-stretch">
                            <Card className="shadow border-0 w-100 bg-white p-3">
                                <Card.Title as="h4" className="mb-4 text-center text-primary">Stock de Productos</Card.Title>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={stockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="nombre" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="stock" fill="#2196F3" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                    <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
                     
                        <Modal.Header closeButton>
                            <Modal.Title>Socios Pendientes de Pago</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ListGroup variant="flush">
                                {sociosPendientes.map((socio) => (
                                  //  console.log("Renderizando socio:", socio), // <--- Y AÑADE ESTA OTRA LÍNEA
                                    <ListGroup.Item key={socio.ci} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold">{socio.nombre}</div>                                            
                                            <div className="text-muted small">CI: {socio.ci}</div>
                                        </div>
                                        {socio.celular && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="d-flex align-items-center"
                                                onClick={() => {
                                                    const message = `Hola ${socio.nombre}! Te recordamos que tienes pendiente el pago de la cuota mensual de The Badgers. Por favor, acércate al gimnasio para regularizar tu situación. ¡Gracias!`;
                                                    const whatsappUrl = `https://wa.me/${socio.celular.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                                                    window.open(whatsappUrl, '_blank');
                                                }}
                                            >
                                                <Whatsapp className="me-2" /> Enviar Recordatorio
                                            </Button>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Modal.Body>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;