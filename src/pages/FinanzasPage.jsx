import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';
import { 
    Card, Row, Col, Container, Button, Form, Table,
    Modal, ListGroup
} from '@themesberg/react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMoneyBill } from '@fortawesome/free-solid-svg-icons';

const FinanzasPage = () => {
    const [pagos, setPagos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filterType, setFilterType] = useState('todos');
    const [gananciaBruta, setGananciaBruta] = useState('');
    const [resultados, setResultados] = useState(null);
    const [horasFede, setHorasFede] = useState(40);
    const [horasGuille, setHorasGuille] = useState(16);
    const [horasGonza, setHorasGonza] = useState(8);
    
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [pagosRes, ventasRes, gastosRes] = await Promise.all([
                    apiClient.get('/pagos/?limit=10000'),
                    apiClient.get('/ventas/?limit=10000'),
                    apiClient.get('/gastos/?limit=10000'),
                ]);
                setPagos(pagosRes.data.results || pagosRes.data);
                setVentas(ventasRes.data.results || ventasRes.data);
                setGastos(gastosRes.data.results || gastosRes.data);
            } catch (error) {
                console.error("Error fetching financial data:", error);
                setPagos([]);
                setVentas([]);
                setGastos([]);
            }
        };
        fetchAllData();
    }, []);

    const filteredData = useMemo(() => {
        const filterByDate = (items, dateField) => items.filter(item => {
            const itemDate = new Date(item[dateField]);
            const sameYear = itemDate.getFullYear() === year;
            const sameMonth = month === 0 || itemDate.getMonth() + 1 === month;
            return sameYear && sameMonth;
        });

        const pagosFiltrados = filterByDate(pagos, 'fecha_pago');
        const ventasFiltradas = filterByDate(ventas, 'fecha_venta');
        const gastosFiltrados = filterByDate(gastos, 'fecha');
        
        const ingresosCuotas = pagosFiltrados.reduce((acc, p) => acc + parseFloat(p.monto), 0);
        const ingresosVentas = ventasFiltradas.reduce((acc, v) => acc + parseFloat(v.total_venta), 0);
        const totalGastos = gastosFiltrados.reduce((acc, g) => acc + parseFloat(g.monto), 0);
        
        return {
            ingresosCuotas,
            ingresosVentas,
            totalIngresos: ingresosCuotas + ingresosVentas,
            totalGastos,
            gananciaNeta: (ingresosCuotas + ingresosVentas) - totalGastos
        };
    }, [pagos, ventas, gastos, year, month]);

    useEffect(() => {
        setGananciaBruta(filteredData.gananciaNeta.toFixed(2));
    }, [filteredData.gananciaNeta]);

    useEffect(() => {
        if (!isNaN(parseFloat(gananciaBruta)) && parseFloat(gananciaBruta) >= 0) {
            calcularReparto();
        }
        // eslint-disable-next-line
    }, [gananciaBruta, horasFede, horasGuille, horasGonza]);

    const handleAddGasto = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newGasto = {
            concepto: formData.get('concepto'),
            monto: parseFloat(formData.get('monto')),
            fecha: formData.get('fecha'),
            categoria: formData.get('categoria'),
        };
        try {
            const res = await apiClient.post('/gastos/', newGasto);
            setGastos(prev => [...prev, res.data]);
            e.target.reset();
        } catch (error) {
            console.error("Error adding gasto:", error);
        }
    };
    
    const years = Array.from({length: 10}, (_, i) => today.getFullYear() - i);
    const months = ["Todos", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handleDeleteRecord = async (type, id) => {
        try {
            await apiClient.delete(`/${type}/${id}/`);
            if (type === 'pagos') {
                setPagos(prev => prev.filter(p => p.id !== id));
            } else if (type === 'ventas') {
                setVentas(prev => prev.filter(v => v.id !== id));
            } else if (type === 'gastos') {
                setGastos(prev => prev.filter(g => g.id !== id));
            }
            setDeleteDialogOpen(false);
            setSelectedRecord(null);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const openDeleteDialog = (record, type) => {
        setSelectedRecord({ ...record, type });
        setDeleteDialogOpen(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFilteredRecords = () => {
        const allRecords = [...pagos, ...ventas, ...gastos];
        if (filterType === 'todos') return allRecords;
        
        return allRecords.filter(record => {
            if (filterType === 'pagos') return 'fecha_pago' in record;
            if (filterType === 'ventas') return 'fecha_venta' in record;
            if (filterType === 'gastos') return 'fecha' in record;
            return true;
        });
    };

    const calcularReparto = () => {
        const ganancia = parseFloat(gananciaBruta);
        if (isNaN(ganancia) || ganancia < 0) {
            alert('Por favor, ingrese un valor válido para la ganancia bruta.');
            return;
        }
        const PORCENTAJE_PARA_SALARIOS = 0.60;
        const semanas_por_mes = 4;
        const horas_socio_1 = horasFede;
        const horas_socio_2 = horasGuille;
        const horas_socio_3 = horasGonza;
        const numero_de_socios = 3;
        const pool_de_salarios = ganancia * PORCENTAJE_PARA_SALARIOS;
        const total_horas_mensuales = (horas_socio_1 + horas_socio_2 + horas_socio_3);
        let valor_hora_variable = 0;
        let salario_socio_1 = 0, salario_socio_2 = 0, salario_socio_3 = 0;
        if (total_horas_mensuales > 0) {
            valor_hora_variable = pool_de_salarios / total_horas_mensuales;
            salario_socio_1 = horas_socio_1 * valor_hora_variable;
            salario_socio_2 = horas_socio_2 * valor_hora_variable;
            salario_socio_3 = horas_socio_3 * valor_hora_variable;
        }
        const ganancia_remanente = ganancia - pool_de_salarios;
        const ganancia_por_inversion = ganancia_remanente / numero_de_socios;
        const total_socio_1 = salario_socio_1 + ganancia_por_inversion;
        const total_socio_2 = salario_socio_2 + ganancia_por_inversion;
        const total_socio_3 = salario_socio_3 + ganancia_por_inversion;
        setResultados({
            pool_de_salarios,
            valor_hora_variable,
            ganancia_remanente,
            ganancia_por_inversion,
            total_socio_1,
            total_socio_2,
            total_socio_3
        });
    };

    return (
        <Container fluid className="px-0">
            <Row className="justify-content-center">
                <Col xl={10} lg={12}>
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                        <h1 className="h2 mb-0 text-center w-100">Gestión de Finanzas</h1>
                    </div>

                    <Row className="mb-4 g-4">
                        <Col xs={12} md={6} lg={3}>
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Ingresos por Cuotas</Card.Title>
                                    <h3 className="text-success fw-bold mb-0" style={{ fontSize: '2rem' }}>${filteredData.ingresosCuotas.toFixed(2)}</h3>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3}>
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Ingresos por Ventas</Card.Title>
                                    <h3 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>${filteredData.ingresosVentas.toFixed(2)}</h3>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3}>
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Gastos Totales</Card.Title>
                                    <h3 className="text-danger fw-bold mb-0" style={{ fontSize: '2rem' }}>${filteredData.totalGastos.toFixed(2)}</h3>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={3}>
                            <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <span className="icon icon-lg bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56, fontSize: 32 }}>
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </span>
                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Ganancia Neta</Card.Title>
                                    <h3 className={`${filteredData.gananciaNeta >= 0 ? 'text-success' : 'text-danger'} fw-bold mb-0`} style={{ fontSize: '2rem' }}>
                                        ${filteredData.gananciaNeta.toFixed(2)}
                                    </h3>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mb-4 g-4">
                        <Col xs={12} md={6}>
                            <Card className="shadow border-0 w-100 bg-white p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form.Group className="mb-0 d-flex align-items-center gap-2">
                                        <Form.Label className="mb-0">Mes</Form.Label>
                                        <Form.Select
                                            value={month}
                                            onChange={e => setMonth(Number(e.target.value))}
                                            style={{ width: '120px' }}
                                        >
                                            {months.map((mes, idx) => (
                                                <option key={idx} value={idx}>{mes}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-0 d-flex align-items-center gap-2">
                                        <Form.Label className="mb-0">Año</Form.Label>
                                        <Form.Select
                                            value={year}
                                            onChange={e => setYear(Number(e.target.value))}
                                            style={{ width: '100px' }}
                                        >
                                            {years.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <Card.Title as="h4" className="mb-4 text-center text-primary">Resumen Gráfico</Card.Title>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[{ name: 'Resumen', Ingresos: filteredData.totalIngresos, Gastos: filteredData.totalGastos }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="Ingresos" fill="green" />
                                <Bar dataKey="Gastos" fill="red" />
                            </BarChart>
                        </ResponsiveContainer>
                            </Card>
                        </Col>
                        <Col xs={12} md={6}>
                            <Card className="shadow border-0 w-100 bg-white p-3">
                                <Card.Title as="h4" className="mb-4 text-center text-primary">Registrar Nuevo Gasto</Card.Title>
                                <Form onSubmit={handleAddGasto}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Concepto</Form.Label>
                                        <Form.Control name="concepto" type="text" required />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Monto</Form.Label>
                                        <Form.Control name="monto" type="number" step="0.01" required />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha</Form.Label>
                                        <Form.Control name="fecha" type="date" defaultValue={today.toISOString().split('T')[0]} required />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Categoría</Form.Label>
                                        <Form.Select name="categoria" defaultValue="Otros">
                                            <option value="Alquiler">Alquiler</option>
                                            <option value="Servicios">Servicios</option>
                                            <option value="Sueldos">Sueldos</option>
                                            <option value="Equipamiento">Equipamiento</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Otros">Otros</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Button type="submit" variant="primary" className="w-100">Registrar Gasto</Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={12}>
                            <Card className="shadow border-0 w-100 bg-white p-3">
                                <Card.Title as="h4" className="mb-4 text-center text-primary">Calculadora de Reparto para The Badgers</Card.Title>
                                <Form.Group className="mb-4">
                                    <Form.Label>Ganancia Bruta Mensual</Form.Label>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faMoneyBill} />
                                        </span>
                                        <Form.Control
                                            type="number"
                                            value={gananciaBruta}
                                            onChange={(e) => setGananciaBruta(e.target.value)}
                                        />
                                    </div>
                                    <Row className="mb-3">
                                        <Col xs={12} md={4} className="mb-2 mb-md-0">
                                            <Form.Label>Horas Fede</Form.Label>
                                            <Form.Control type="number" value={horasFede} min={0} onChange={e => setHorasFede(Number(e.target.value))} />
                                        </Col>
                                        <Col xs={12} md={4} className="mb-2 mb-md-0">
                                            <Form.Label>Horas Guille</Form.Label>
                                            <Form.Control type="number" value={horasGuille} min={0} onChange={e => setHorasGuille(Number(e.target.value))} />
                                        </Col>
                                        <Col xs={12} md={4}>
                                            <Form.Label>Horas Gonza</Form.Label>
                                            <Form.Control type="number" value={horasGonza} min={0} onChange={e => setHorasGonza(Number(e.target.value))} />
                                        </Col>
                                    </Row>
                                    {resultados && (
                                        <div className="mb-4 text-center">
                                            <span className="fw-bold">Valor por hora de clase: </span>
                                            <span>${resultados.valor_hora_variable.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </Form.Group>
                                <Button 
                                    variant="primary" 
                                    onClick={calcularReparto}
                                    className="w-100 mb-4"
                                >
                                    Calcular Reparto
                                </Button>

                                {resultados && (
                                    <>
                                        <Row>
                                            <Col xs={12} md={4}>
                                                <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Fede ({horasFede}hs/mes)</Card.Title>
                                                    <h3 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                                                        ${resultados.total_socio_1.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </h3>
                                                </Card>
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Guille ({horasGuille}hs/mes)</Card.Title>
                                                    <h3 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                                                        ${resultados.total_socio_2.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </h3>
                                                </Card>
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <Card className="shadow border-0 w-100 bg-white text-center p-3">
                                                    <Card.Title as="h6" className="mb-2 text-uppercase text-muted small">Gonza ({horasGonza}hs/mes)</Card.Title>
                                                    <h3 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                                                        ${resultados.total_socio_3.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </h3>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={12}>
                            <Card className="shadow border-0 w-100 bg-white p-3">
                                <Card.Title as="h4" className="mb-4 text-center text-primary">Historial Financiero</Card.Title>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form.Select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                        style={{ width: '200px' }}
                                    >
                                        <option value="todos">Todos los registros</option>
                                        <option value="pagos">Pagos</option>
                                        <option value="ventas">Ventas</option>
                                        <option value="gastos">Gastos</option>
                                    </Form.Select>
                                </div>
                                <Table responsive hover className="user-table align-items-center">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Concepto</th>
                                            <th>Monto</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                {getFilteredRecords()
                                    .sort((a, b) => new Date(b.fecha_pago || b.fecha_venta || b.fecha) - new Date(a.fecha_pago || a.fecha_venta || a.fecha))
                                    .map((record) => {
                                        const isPago = 'fecha_pago' in record;
                                        const isVenta = 'fecha_venta' in record;
                                        const type = isPago ? 'pagos' : isVenta ? 'ventas' : 'gastos';
                                        const date = isPago ? record.fecha_pago : isVenta ? record.fecha_venta : record.fecha;
                                        const monto = isPago ? record.monto : isVenta ? record.total_venta : record.monto;
                                        const concepto = isPago ? 'Pago de Cuota' : isVenta ? 'Venta' : record.concepto;

                                        return (
                                                    <tr key={`${type}-${record.id}`}>
                                                        <td>{formatDate(date)}</td>
                                                        <td>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
                                                        <td>{concepto}</td>
                                                        <td>${parseFloat(monto).toFixed(2)}</td>
                                                        <td>
                                                            <Button 
                                                                variant="danger" 
                                                                size="sm"
                                                        onClick={() => openDeleteDialog(record, type)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                        );
                                    })}
                                    </tbody>
                        </Table>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Modal show={deleteDialogOpen} onHide={() => setDeleteDialogOpen(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        ¿Está seguro que desea eliminar este registro?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                        Cancelar
                    </Button>
                        <Button 
                        variant="danger"
                            onClick={() => selectedRecord && handleDeleteRecord(selectedRecord.type, selectedRecord.id)}
                        >
                            Eliminar
                        </Button>
                </Modal.Footer>
            </Modal>
            </Container>
    );
};

export default FinanzasPage;