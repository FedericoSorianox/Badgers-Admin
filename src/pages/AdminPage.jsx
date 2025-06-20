// src/pages/AdminPage.jsx
import React, { useState } from 'react';
import apiClient from '../api';
import {
  Container, Row, Col, Card, Button, Form, Alert, Spinner
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faFileCsv } from '@fortawesome/free-solid-svg-icons';

const CsvImporter = ({ title, endpoint }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo CSV primero.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const response = await apiClient.post(`/${endpoint}/import_csv/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
      setError('');
      if (response.data.errors && response.data.errors.length > 0) {
        setError('Se encontraron errores. Revisa la consola del navegador (F12) para más detalles.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error durante la importación.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title as="h5" className="mb-3 text-primary">
          <FontAwesomeIcon icon={faUpload} className="me-2" />{title}
        </Card.Title>
        <Form.Group className="mb-3 d-flex align-items-center gap-2">
          <Form.Control type="file" accept=".csv" onChange={handleFileChange} disabled={loading} style={{ maxWidth: 220 }} />
          {file && <span className="text-muted small">{file.name}</span>}
          <Button variant="primary" onClick={handleImport} disabled={!file || loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <FontAwesomeIcon icon={faUpload} className="me-2" />}
            Importar
          </Button>
        </Form.Group>
        {message && <Alert variant="success" className="mb-0">{message}</Alert>}
        {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
      </Card.Body>
    </Card>
  );
};

const AdminPage = () => {
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header =>
          JSON.stringify(row[header], (key, value) => value === null ? '' : value)
        ).join(',')
      )
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExport = async (endpoint, filename) => {
    try {
      const response = await apiClient.get(`/${endpoint}/?limit=10000`);
      const data = response.data.results || response.data;
      if (!data || data.length === 0) {
        alert('No hay datos para exportar.');
        return;
      }
      downloadCSV(data, filename);
    } catch (error) {
      alert(`Error al exportar ${filename}. Por favor, intenta nuevamente.`);
    }
  };

  return (
    <Container fluid className="px-0">
      <Row className="justify-content-center">
        <Col xl={10} lg={12}>
          <h1 className="mb-5 fw-bolder text-center w-100" style={{ color: '#1976d2', letterSpacing: 1, fontSize: '2.5rem' }}>
            <FontAwesomeIcon icon={faFileCsv} className="me-2" />Administración del Sistema
          </h1>
          <Row className="g-4 mb-4">
            <Col xs={12} md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title as="h4" className="mb-4 text-primary">
                    <FontAwesomeIcon icon={faUpload} className="me-2" />Importar Datos
                  </Card.Title>
                  <CsvImporter title="Importar Socios" endpoint="socios" />
                  <CsvImporter title="Importar Pagos" endpoint="pagos" />
                  <CsvImporter title="Importar Inventario" endpoint="productos" />
                  <CsvImporter title="Importar Ventas" endpoint="ventas" />
                  <CsvImporter title="Importar Gastos" endpoint="gastos" />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title as="h4" className="mb-4 text-primary">
                    <FontAwesomeIcon icon={faDownload} className="me-2" />Exportar Datos
                  </Card.Title>
                  <div className="d-flex flex-column gap-3">
                    <Button variant="outline-primary" onClick={() => handleExport('socios', 'socios.csv')}>
                      <FontAwesomeIcon icon={faDownload} className="me-2" />Exportar Socios
                    </Button>
                    <Button variant="outline-primary" onClick={() => handleExport('pagos', 'pagos.csv')}>
                      <FontAwesomeIcon icon={faDownload} className="me-2" />Exportar Pagos
                    </Button>
                    <Button variant="outline-primary" onClick={() => handleExport('productos', 'inventario.csv')}>
                      <FontAwesomeIcon icon={faDownload} className="me-2" />Exportar Inventario
                    </Button>
                    <Button variant="outline-primary" onClick={() => handleExport('ventas', 'ventas.csv')}>
                      <FontAwesomeIcon icon={faDownload} className="me-2" />Exportar Ventas
                    </Button>
                    <Button variant="outline-primary" onClick={() => handleExport('gastos', 'gastos.csv')}>
                      <FontAwesomeIcon icon={faDownload} className="me-2" />Exportar Gastos
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-4">
            <Col xs={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title as="h4" className="mb-4 text-primary">
                    <FontAwesomeIcon icon={faFileCsv} className="me-2" />Plantillas CSV de Ejemplo
                  </Card.Title>
                  <p className="text-muted mb-3">
                    Descarga estos archivos de ejemplo para entender el formato requerido para cada tipo de importación:
                  </p>
                  <Row className="g-3">
                    <Col xs={12} sm={6} md={4}>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => downloadCSV([
                          {ci: '1234567', nombre: 'Juan Pérez', celular: '099123456', contacto_emergencia: 'Maria Pérez', emergencia_movil: '099654321', fecha_nacimiento: '1990-05-15', tipo_cuota: 'Mensual', enfermedades: 'Diabetes', comentarios: 'Alergia a penicilina'},
                          {ci: '2345678', nombre: 'Ana García', celular: '098765432', contacto_emergencia: 'Carlos García', emergencia_movil: '097654321', fecha_nacimiento: '1985-12-03', tipo_cuota: 'Anual', enfermedades: '', comentarios: ''}
                        ], 'socios_ejemplo.csv')}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />Socios
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => downloadCSV([
                          {ci: '1234567', mes: '1', año: '2025', monto: '50000', fecha_pago: '2025-01-15', metodo_pago: 'Efectivo'},
                          {ci: '2345678', mes: '1', año: '2025', monto: '50000', fecha_pago: '2025-01-20', metodo_pago: 'Transferencia'}
                        ], 'pagos_ejemplo.csv')}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />Pagos
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => downloadCSV([
                          {nombre: 'Agua', precio_venta: '5000', precio_costo: '3000', stock: '100'},
                          {nombre: 'Proteína', precio_venta: '25000', precio_costo: '18000', stock: '50'}
                        ], 'productos_ejemplo.csv')}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />Productos
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => downloadCSV([
                          {producto_nombre: 'Agua', cantidad: '2', fecha_venta: '2025-01-15'},
                          {producto_nombre: 'Proteína', cantidad: '1', fecha_venta: '2025-01-16'}
                        ], 'ventas_ejemplo.csv')}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />Ventas
                      </Button>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => downloadCSV([
                          {concepto: 'Luz', monto: '150000', fecha: '2025-01-15', categoria: 'Servicios', descripcion: 'Factura de electricidad enero'},
                          {concepto: 'Mantenimiento', monto: '75000', fecha: '2025-01-20', categoria: 'Equipamiento', descripcion: 'Reparación de máquinas'}
                        ], 'gastos_ejemplo.csv')}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />Gastos
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPage;