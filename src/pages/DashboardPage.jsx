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
        pagos_mes: { pagados: 0, pendientes: 0 },
        socios_inactivos: { total: 0 }
    });
    const [stockData, setStockData] = useState([]);
    const [pagosData, setPagosData] = useState([]);
    const [sociosPendientes, setSociosPendientes] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchAllProducts = async () => {
        try {
            let allProducts = [];
            let currentUrl = 'productos/';
            
            do {
                const response = await apiClient.get(currentUrl);
                if (response.data.results) {
                    allProducts = [...allProducts, ...response.data.results];
                }
                currentUrl = response.data.next ? 
                    response.data.next.split('/api/')[1] : null;
            } while (currentUrl);
            
            return allProducts;
        } catch (error) {
            console.error("Error fetching all products:", error);
            return [];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, sociosRes, pagosRes] = await Promise.all([
                    apiClient.get('/dashboard-stats/'),
                    apiClient.get('/socios/?limit=1000'),
                    apiClient.get('/pagos/?limit=10000')
                ]);

                // Fetch all products with pagination
                const productos = await fetchAllProducts();
                
                const todosLosSocios = sociosRes.data.results ? sociosRes.data.results : sociosRes.data;
                const sociosActivos = todosLosSocios.filter(socio => 
                    !SOCIOS_SIN_PAGO.includes(socio.nombre) && socio.activo
                );
                const sociosInactivos = todosLosSocios.filter(socio => !socio.activo);
                
                const now = new Date();
                const mesActual = now.getMonth() + 1;
                const añoActual = now.getFullYear();
                const pagos = pagosRes.data.results ? pagosRes.data.results : pagosRes.data;
                const pagosMesActual = pagos.filter(p => 
                    p.mes === mesActual && p.año === añoActual
                );
                const sociosPagados = pagosMesActual.map(p => p.socio);
                const sociosPendientesList = sociosActivos.filter(s => !sociosPagados.includes(s.ci) && s.activo);
                setSociosPendientes(sociosPendientesList);

                // Actualizar stats con el conteo correcto de productos
                const productosConStock = productos.filter(p => p.stock > 0);
                setStats({
                    ...statsRes.data,
                    socios_activos: sociosActivos.length,
                    productos_en_inventario: productosConStock.length,
                    pagos_mes: {
                        pagados: sociosPagados.length,
                        pendientes: sociosPendientesList.length
                    },
                    socios_inactivos: {
                        total: sociosInactivos.length
                    }
                });

                setPagosData([
                    { name: 'Pagados', value: sociosPagados.length },
                    { name: 'Pendientes', value: sociosPendientesList.length }
                ]);

                // Actualizar datos de stock
                const stock = productosConStock
                    .map(p => ({ 
                        nombre: p.nombre, 
                        stock: parseInt(p.stock) 
                    }))
                    .sort((a, b) => b.stock - a.stock); // Ordenar por stock descendente
                console.log('Datos de stock procesados:', stock);
                setStockData(stock);
            } catch (error) {
                console.error("Error al cargar el dashboard:", error);
            }
        };
        fetchData();
    }, []);

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
                                    <span className="icon icon-lg bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <PeopleFill size={32} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Socios Inactivos</Card.Title>
                                    <h2 className="text-danger fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{stats.socios_inactivos.total}</h2>
                                    <Card.Text className="text-muted small mb-0">
                                        (Vacaciones o ausencia temporal)
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
                                    <h2 className="text-success fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{stockData.length}</h2>
                                    <Card.Text className="text-muted small mb-0">
                                        (Con stock disponible)
                                    </Card.Text>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3} className="d-flex align-items-stretch">
                            <Card className="shadow border-0 w-100 bg-white text-center p-3" style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <CreditCard2FrontFill size={32} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Estado de Pagos</Card.Title>
                                    <div className="d-flex align-items-center gap-3">
                                        <h2 className="text-success fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{stats.pagos_mes.pagados}</h2>
                                        <h2 className="text-warning fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{stats.pagos_mes.pendientes}</h2>
                                    </div>
                                    <Card.Text className="text-muted small mb-0">
                                        Pagados / Pendientes
                                    </Card.Text>
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
                                <div style={{ height: '320px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={stockData} 
                                            layout="vertical" 
                                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis 
                                                dataKey="nombre" 
                                                type="category" 
                                                width={150}
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                scale="point"
                                                padding={{ top: 10, bottom: 10 }}
                                            />
                                            <Tooltip />
                                            <Bar 
                                                dataKey="stock" 
                                                fill="#4CAF50"
                                                label={{ position: 'right', fontSize: 12 }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
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
                                    <ListGroup.Item key={socio.ci} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0">{socio.nombre}</h6>
                                        </div>
                                        <div>
                                            <Button variant="outline-primary" size="sm" className="me-2">
                                                Registrar Pago
                                            </Button>
                                            {socio.celular && (
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm"
                                                    onClick={() => window.open(`https://wa.me/${socio.celular.replace(/\D/g, '')}`)}
                                                >
                                                    <Whatsapp />
                                                </Button>
                                            )}
                                        </div>
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