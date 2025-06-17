// src/pages/PagosPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Card, Row, Col, Container, Button, Form, Table,
    Modal, ListGroup, FormGroup, FormLabel, FormControl, InputGroup, Alert
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, faTimesCircle, faMinusCircle, 
    faInfoCircle, faStar, faMoneyBill
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// Lista de socios que no pagan mensualidad
const SOCIOS_SIN_PAGO = [
    'Gonzalo Fernandez',
    'Federico Soriano',
    'Mariana Peralta',
    'Guillermo Viera',
    'Andrea Lostorto'
];

const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Componente para el diálogo de confirmación de pago
const ConfirmPagoDialog = ({ show, onHide, onConfirm, socio, mes, año }) => {
    const [monto, setMonto] = useState(2000.0);

    const handleConfirm = () => {
        onConfirm(socio, mes, año, monto);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Registrar Pago</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <h5>{socio?.nombre}</h5>
                    <p className="text-muted mb-2">
                        Registrando pago para {mesesNombres[mes - 1]} de {año}
                    </p>
                </div>
                <Form.Group className="mb-3">
                    <Form.Label>Monto</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(parseFloat(e.target.value))}
                        />
                    </InputGroup>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    {socio?.celular && (
                        <Button 
                            variant="outline-success" 
                            onClick={() => window.open(`https://wa.me/${socio.celular.replace(/\D/g, '')}`)}
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                            WhatsApp
                        </Button>
                    )}
                </div>
                <div>
                    <Button variant="secondary" onClick={onHide} className="me-2">
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Registrar Pago
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

// Componente para el diálogo informativo
const InfoDialog = ({ show, onHide, onConfirm, socio, mes, año, isSocioSinPago }) => {
    const [monto, setMonto] = useState(2000.0);
    const fechaRegistro = new Date(socio?.fecha_registro);
    const fechaMesActual = new Date(año, mes - 1, 2);
    const diasDiferencia = Math.floor((fechaMesActual - fechaRegistro) / (1000 * 60 * 60 * 24));

    const handleConfirm = () => {
        onConfirm(socio, mes, año, monto);
        onHide();
    };

    if (isSocioSinPago) {
        return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Información del Socio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{socio?.nombre} es un socio sin pago mensual.</p>
                    <p className="text-muted">
                        Este socio tiene acceso completo al gimnasio sin necesidad de realizar pagos mensuales.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Registrar Pago</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <h5>{socio?.nombre}</h5>
                    <p className="text-muted mb-2">
                        Registrando pago para {mesesNombres[mes - 1]} de {año}
                    </p>
                    {diasDiferencia < 30 && (
                        <Alert variant="info">
                            Este socio se registró hace menos de un mes.
                        </Alert>
                    )}
                </div>
                <Form.Group className="mb-3">
                    <Form.Label>Monto</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(parseFloat(e.target.value))}
                        />
                    </InputGroup>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    {socio?.celular && (
                        <Button 
                            variant="outline-success" 
                            onClick={() => window.open(`https://wa.me/${socio.celular.replace(/\D/g, '')}`)}
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                            WhatsApp
                        </Button>
                    )}
                </div>
                <div>
                    <Button variant="secondary" onClick={onHide} className="me-2">
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Registrar Pago
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const PagosPage = () => {
    const [socios, setSocios] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [newPago, setNewPago] = useState({ socio: '', mes: new Date().getMonth() + 1, año: selectedYear, monto: 2000.0 });
    const [confirmDialog, setConfirmDialog] = useState({ show: false, socio: null, mes: null });
    const [infoDialog, setInfoDialog] = useState({ show: false, socio: null, mes: null });

    const fetchSociosAndPagos = async () => {
        try {
            const [sociosRes, pagosRes] = await Promise.all([
                apiClient.get('/socios/?limit=1000'), 
                apiClient.get(`/pagos/?año=${selectedYear}&limit=10000`)
            ]);
            
            // Filtrar los socios que no pagan mensualidad y que están activos
            const sociosFiltrados = (sociosRes.data.results ? sociosRes.data.results : sociosRes.data)
                .filter(socio => !SOCIOS_SIN_PAGO.includes(socio.nombre) && socio.activo);
            
            setSocios(sociosFiltrados);
            setPagos(pagosRes.data.results ? pagosRes.data.results : pagosRes.data);

        } catch (error) {
            console.error("Error al cargar datos:", error);
            setSocios([]);
            setPagos([]);
        }
    };
    
    useEffect(() => {
        fetchSociosAndPagos();
    }, [selectedYear]);

    const handleNewPagoChange = (e) => {
        const { name, value } = e.target;
        setNewPago(prev => ({...prev, [name]: value}));
    };
    
    const handleRegistrarPago = async (socio, mes, año, monto) => {
        const id_pago = `${socio.ci}_${mes}_${año}`;
        const payload = {
            id: id_pago,
            socio: socio.ci,
            mes: parseInt(mes),
            año: parseInt(año),
            monto: parseFloat(monto),
            fecha_pago: new Date().toISOString().split('T')[0]
        };
        try {
            await apiClient.post('/pagos/', payload);
            fetchSociosAndPagos();
        } catch (error) {
            console.error("Error al registrar pago:", error.response?.data || error.message);
            alert("Error al registrar el pago. Es posible que ya exista un pago para ese socio en ese mes y año.");
        }
    };

    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

    const getStatus = (socio, mes) => {
        // Si el socio está en la lista de socios sin pago
        if (SOCIOS_SIN_PAGO.includes(socio.nombre)) {
            return (
                <Button 
                    variant="link" 
                    className="p-0 text-warning"
                    onClick={() => setInfoDialog({ show: true, socio, mes, isSocioSinPago: true })}
                >
                    <FontAwesomeIcon icon={faStar} />
                </Button>
            );
        }

        // Corregir interpretación de fecha de registro (mm/dd/yyyy)
        // Si la fecha viene como '6/8/2025', debe ser 6 (mes), 8 (día), 2025 (año)
        let fechaRegistro;
        if (typeof socio.fecha_registro === 'string' && socio.fecha_registro.includes('/')) {
            const parts = socio.fecha_registro.split('/');
            if (parts.length === 3) {
                // mm/dd/yyyy
                fechaRegistro = new Date(parts[2], parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
            } else {
                fechaRegistro = new Date(socio.fecha_registro);
            }
        } else {
            fechaRegistro = new Date(socio.fecha_registro);
        }
        const fechaMesActual = new Date(selectedYear, mes - 1, 2);

        // Buscar el pago correspondiente (comparación robusta)
        const pago = pagos.find(p => 
            (p.socio === socio.ci || p.socio?.ci === socio.ci) &&
            Number(p.mes) === Number(mes) &&
            Number(p.año) === Number(selectedYear)
        );

        // Si el mes no aplica pero existe un pago, mostrar el check verde
        if (fechaRegistro > fechaMesActual && pago) {
            return (
                <Button 
                    variant="link" 
                    className="p-0 text-success"
                    onClick={() => setInfoDialog({ show: true, socio, mes })}
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                </Button>
            );
        }

        // Si el mes no aplica y no hay pago, mostrar info
        if (fechaRegistro > fechaMesActual) {
            return (
                <Button 
                    variant="link" 
                    className="p-0 text-muted"
                    onClick={() => setInfoDialog({ show: true, socio, mes })}
                >
                    <FontAwesomeIcon icon={faInfoCircle} />
                </Button>
            );
        }

        if (pago) {
            return (
                <Button 
                    variant="link" 
                    className="p-0 text-success"
                    onClick={() => setInfoDialog({ show: true, socio, mes })}
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                </Button>
            );
        }

        return (
            <Button 
                variant="link" 
                className="p-0 text-danger"
                onClick={() => setConfirmDialog({ show: true, socio, mes })}
            >
                <FontAwesomeIcon icon={faTimesCircle} />
            </Button>
        );
    };

    return (
        <Container fluid className="px-0">
            <Row className="justify-content-center">
                <Col xl={10} lg={12}>
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                        <h1 className="h2 mb-0 text-center w-100">Gestión de Pagos</h1>
                    </div>

                    <Card className="shadow border-0 w-100 bg-white p-3 mb-4">
                        <Card.Title as="h4" className="mb-4 text-center text-primary">Registrar Nuevo Pago</Card.Title>
                        <Form>
                            <Row>
                                <Col md={4}>
                                    <FormGroup className="mb-3">
                                        <FormLabel>Socio</FormLabel>
                                        <Form.Select
                                            name="socio"
                                            value={newPago.socio}
                                            onChange={handleNewPagoChange}
                                        >
                                            <option value="">Seleccionar socio...</option>
                                            {socios.map(socio => (
                                                <option key={socio.ci} value={socio.ci}>
                                                    {socio.nombre}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup className="mb-3">
                                        <FormLabel>Mes</FormLabel>
                                        <Form.Select
                                            name="mes"
                                            value={newPago.mes}
                                            onChange={handleNewPagoChange}
                                        >
                                            {mesesNombres.map((mes, index) => (
                                                <option key={index + 1} value={index + 1}>
                                                    {mes}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup className="mb-3">
                                        <FormLabel>Año</FormLabel>
                                        <Form.Select
                                            name="año"
                                            value={newPago.año}
                                            onChange={handleNewPagoChange}
                                        >
                                            {years.map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup className="mb-3">
                                        <FormLabel>Monto</FormLabel>
                                        <FormControl
                                            type="number"
                                            name="monto"
                                            value={newPago.monto}
                                            onChange={handleNewPagoChange}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={2} className="d-flex align-items-end">
                                    <Button 
                                        variant="primary" 
                                        className="w-100"
                                        onClick={() => {
                                            const socio = socios.find(s => s.ci === newPago.socio);
                                            if (socio) {
                                                handleRegistrarPago(socio, newPago.mes, newPago.año, newPago.monto);
                                            }
                                        }}
                                    >
                                        Registrar
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    <Card className="shadow border-0 w-100 bg-white p-3">
                        <Card.Title as="h4" className="mb-4 text-center text-primary">Estado de Pagos {selectedYear}</Card.Title>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Form.Select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                style={{ width: '200px' }}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', scrollbarGutter: 'stable' }} className="tabla-scroll-oculta">
                            <Table responsive hover className="user-table align-items-center">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Socio</th>
                                        {mesesNombres.map((mes, index) => (
                                            <th key={index} className="text-center">{mes}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {socios.map(socio => (
                                        <tr key={socio.ci}>
                                            <td>{socio.nombre}</td>
                                            {mesesNombres.map((_, index) => (
                                                <td key={index} className="text-center">
                                                    {getStatus(socio, index + 1)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>

                    <ConfirmPagoDialog
                        show={confirmDialog.show}
                        onHide={() => setConfirmDialog({ show: false, socio: null, mes: null })}
                        onConfirm={handleRegistrarPago}
                        socio={confirmDialog.socio}
                        mes={confirmDialog.mes}
                        año={selectedYear}
                    />

                    <InfoDialog
                        show={infoDialog.show}
                        onHide={() => setInfoDialog({ show: false, socio: null, mes: null })}
                        onConfirm={handleRegistrarPago}
                        socio={infoDialog.socio}
                        mes={infoDialog.mes}
                        año={selectedYear}
                        isSocioSinPago={infoDialog.isSocioSinPago}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default PagosPage;