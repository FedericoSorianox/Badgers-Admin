// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Button, Modal, ListGroup, Image, Table } from '@themesberg/react-bootstrap';
import { PeopleFill, BoxSeam, CreditCard2FrontFill, Whatsapp } from 'react-bootstrap-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
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

// Función para determinar el color del fondo basado en el stock
const getStockColor = (stock) => {
    if (stock <= 3) return '#ffebee'; // Rojo claro
    if (stock <= 7) return '#fff3e0'; // Amarillo claro
    return '#e8f5e9'; // Verde claro
};

// Función para determinar el color del texto basado en el stock
const getStockTextColor = (stock) => {
    if (stock <= 3) return '#d32f2f'; // Rojo oscuro
    if (stock <= 7) return '#f57c00'; // Naranja oscuro
    return '#2e7d32'; // Verde oscuro
};

// Función para construir la URL completa de las imágenes
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseURL = isDevelopment 
        ? 'http://127.0.0.1:8000'
        : 'https://thebadgersadmin.onrender.com';
    
    // Si la imagen ya tiene una URL completa, la devolvemos tal como está
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Si es una ruta relativa, la combinamos con la URL base
    return `${baseURL}${imagePath}`;
};

const DashboardPage = () => {
    const navigate = useNavigate();
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
    const [showInactivosModal, setShowInactivosModal] = useState(false);
    const [showProductosModal, setShowProductosModal] = useState(false);
    const [sociosInactivos, setSociosInactivos] = useState([]);
    const [productos, setProductos] = useState([]);

    const fetchAllProducts = async () => {
        try {
            let allProducts = [];
            let currentUrl = '/productos/';
            
            do {
                const response = await apiClient.get(currentUrl);
                // Manejar tanto respuestas paginadas como no paginadas
                const data = response.data.results || response.data;
                allProducts = [...allProducts, ...Array.isArray(data) ? data : [data]];
                
                // Solo intentar paginación si hay un campo 'next'
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
                const now = new Date();
                const mesActual = now.getMonth() + 1;
                const añoActual = now.getFullYear();

                const [statsRes, sociosRes, pagosRes] = await Promise.all([
                    apiClient.get('/dashboard-stats/'),
                    apiClient.get('/socios/?limit=1000'),
                    apiClient.get('/pagos/?limit=10000')
                ]);

                const todosLosSocios = sociosRes.data.results ? sociosRes.data.results : sociosRes.data;
                const sociosActivos = todosLosSocios.filter(socio => 
                    !SOCIOS_SIN_PAGO.includes(socio.nombre) && socio.activo
                );
                const sociosInactivosList = todosLosSocios.filter(socio => !socio.activo);
                setSociosInactivos(sociosInactivosList);
                
                const pagos = pagosRes.data.results ? pagosRes.data.results : pagosRes.data;
                const pagosMesActual = pagos.filter(p => 
                    p.mes === mesActual && p.año === añoActual
                );
                const sociosPagados = pagosMesActual.map(p => p.socio);
                const sociosPendientesList = sociosActivos.filter(s => !sociosPagados.includes(s.ci) && s.activo);
                setSociosPendientes(sociosPendientesList);

                // Usar los productos que vienen del dashboard
                const productosConStock = statsRes.data.productos || [];
                setProductos(productosConStock);
                
                setStats({
                    ...statsRes.data,
                    socios_activos: sociosActivos.length,
                    productos_en_inventario: productosConStock.length,
                    pagos_mes: {
                        pagados: sociosPagados.length,
                        pendientes: sociosPendientesList.length
                    },
                    socios_inactivos: {
                        total: sociosInactivosList.length
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
                    .sort((a, b) => b.stock - a.stock);
                setStockData(stock);
            } catch (error) {
                console.error("Error al cargar el dashboard:", error);
            }
        };
        fetchData();
    }, []);

    const handleRegistrarPago = (socioId) => {
        setShowModal(false); // Close the modal
        navigate('/pagos', { state: { selectedSocioId: socioId } }); // Navigate to pagos page with socio ID
    };

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
                            <Card 
                                className="shadow border-0 w-100 bg-white text-center p-3" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowInactivosModal(true)}
                            >
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
                            <Card 
                                className="shadow border-0 w-100 bg-white text-center p-3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowProductosModal(true)}
                            >
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <BoxSeam size={32} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Productos en Inventario</Card.Title>
                                    <h2 className="text-success fw-bolder mb-1" style={{ fontSize: '2.5rem' }}>{productos.length}</h2>
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
                                <div style={{ height: '320px', overflowY: 'auto' }}>
                                    <Table hover className="align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Producto</th>
                                                <th className="text-end">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockData
                                                .sort((a, b) => a.stock - b.stock) // Ordenar por stock ascendente
                                                .map((producto, index) => (
                                                    <tr key={index}>
                                                        <td>{producto.nombre}</td>
                                                        <td 
                                                            className="text-end" 
                                                            style={{ 
                                                                backgroundColor: getStockColor(producto.stock),
                                                                color: getStockTextColor(producto.stock),
                                                                fontWeight: 'bold',
                                                                width: '100px'
                                                            }}
                                                        >
                                                            {producto.stock}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="mt-3 pt-3 border-top">
                                    <div className="d-flex justify-content-between align-items-center small text-muted">
                                        <div className="d-flex align-items-center">
                                            <span className="d-inline-block me-2" style={{ width: '12px', height: '12px', backgroundColor: '#ffebee', border: '1px solid #d32f2f' }}></span>
                                            Stock crítico (≤ 3)
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="d-inline-block me-2" style={{ width: '12px', height: '12px', backgroundColor: '#fff3e0', border: '1px solid #f57c00' }}></span>
                                            Stock bajo (≤ 7)
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="d-inline-block me-2" style={{ width: '12px', height: '12px', backgroundColor: '#e8f5e9', border: '1px solid #2e7d32' }}></span>
                                            Stock normal (&gt; 7)
                                        </div>
                                    </div>
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
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="me-2"
                                                onClick={() => handleRegistrarPago(socio.ci)}
                                            >
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

                    <Modal show={showInactivosModal} onHide={() => setShowInactivosModal(false)} centered size="md">
                        <Modal.Header closeButton>
                            <Modal.Title>Socios Inactivos</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ListGroup variant="flush">
                                {sociosInactivos.map((socio) => (
                                    <ListGroup.Item key={socio.ci} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0">{socio.nombre}</h6>
                                            <small className="text-muted">
                                                {socio.inactive_status === 'vacaciones' ? 'En Vacaciones' : 
                                                 socio.inactive_status === 'temporal' ? 'Ausencia Temporal' : 
                                                 'Inactivo'}
                                                {socio.inactive_since && ` desde ${new Date(socio.inactive_since).toLocaleDateString()}`}
                                            </small>
                                            {socio.inactive_reason && (
                                                <small className="d-block text-muted">
                                                    Razón: {socio.inactive_reason}
                                                </small>
                                            )}
                                        </div>
                                        <div>
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

                    <Modal show={showProductosModal} onHide={() => setShowProductosModal(false)} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Productos en Inventario</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <ListGroup variant="flush">
                                {productos.map((producto) => (
                                    <ListGroup.Item key={producto.id} className="d-flex align-items-center">
                                        <div className="me-3">
                                            {producto.foto && (
                                                <Image 
                                                    src={getImageUrl(producto.foto)} 
                                                    alt={producto.nombre}
                                                    style={{ 
                                                        width: '50px', 
                                                        height: '50px', 
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-0">{producto.nombre}</h6>
                                            <small className="text-muted">
                                                Precio: ${producto.precio}
                                            </small>
                                        </div>
                                        <div className="text-end">
                                            <h5 className="mb-0 text-success">
                                                Stock: {producto.stock}
                                            </h5>
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