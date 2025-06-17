// src/pages/SociosPage.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { Container, Row, Col, Card, Button, Modal, Form, Table, Alert, InputGroup, FormControl as BSFormControl } from '@themesberg/react-bootstrap';
import { PersonPlus, Whatsapp, PencilSquare, Trash, Eye } from 'react-bootstrap-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// Componente de Formulario para Crear, Editar y Ver Socios
const SocioForm = ({ show, onHide, onSave, socio, isViewOnly = false, sociosList = [] }) => {
    const [formData, setFormData] = useState({});
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        setFormData(socio || {
            ci: '', 
            nombre: '', 
            celular: '', 
            contacto_emergencia: '', 
            emergencia_movil: '',
            fecha_nacimiento: '', 
            tipo_cuota: 'Libre - $2000', 
            enfermedades: '', 
            comentarios: '',
            activo: true,
            inactive_status: '',
            inactive_reason: '',
            inactive_since: ''
        });
        setFotoFile(null);
    }, [socio]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.ci || formData.ci.trim() === '') {
            alert('El campo CI es obligatorio.');
            return;
        }
        if (Array.isArray(sociosList)) {
            const ciExiste = sociosList.some(s => s.ci === formData.ci && (!socio || s.ci !== socio.ci));
            if (ciExiste) {
                alert('El CI ingresado ya existe. Debe ser único.');
                return;
            }
        }
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'foto') {
                if (key === 'activo') {
                    data.append(key, formData[key] ? 'true' : 'false');
                } else {
                    data.append(key, formData[key] || '');
                }
            }
        });
        if (fotoFile) {
            data.append('foto', fotoFile);
        }
        onSave(data, socio?.ci);
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            centered 
            size="md"
            style={{ zIndex: 1050 }}
            className="modal-socio"
        >
            <Modal.Header closeButton>
                <Modal.Title>{isViewOnly ? 'Detalles del Socio' : (socio ? 'Editar Socio' : 'Agregar Nuevo Socio')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {socio && socio.foto && (
                    <div className="d-flex justify-content-center mb-3">
                        <img src={socio.foto} alt={formData.nombre} style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid #ddd' }} />
                    </div>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-2">
                        <Form.Label>CI</Form.Label>
                        <BSFormControl name="ci" value={formData.ci || ''} onChange={handleChange} disabled={isViewOnly} required />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Nombre Completo</Form.Label>
                        <BSFormControl name="nombre" value={formData.nombre || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Celular</Form.Label>
                        <BSFormControl name="celular" value={formData.celular || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Fecha de Nacimiento</Form.Label>
                        <BSFormControl type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Tipo de Cuota</Form.Label>
                        <BSFormControl name="tipo_cuota" value={formData.tipo_cuota || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Contacto de Emergencia</Form.Label>
                        <BSFormControl name="contacto_emergencia" value={formData.contacto_emergencia || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Teléfono de Emergencia</Form.Label>
                        <BSFormControl name="emergencia_movil" value={formData.emergencia_movil || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Enfermedades</Form.Label>
                        <BSFormControl as="textarea" name="enfermedades" value={formData.enfermedades || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Comentarios</Form.Label>
                        <BSFormControl as="textarea" name="comentarios" value={formData.comentarios || ''} onChange={handleChange} disabled={isViewOnly} />
                    </Form.Group>

                    {!isViewOnly && (
                        <>
                            <hr className="my-4" />
                            <h6 className="mb-3">Estado del Socio</h6>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="activo-switch"
                                    label={formData.activo ? "Socio Activo" : "Socio Inactivo"}
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {!formData.activo && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Motivo de Inactividad</Form.Label>
                                        <Form.Select
                                            name="inactive_status"
                                            value={formData.inactive_status || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccionar motivo...</option>
                                            <option value="vacaciones">Vacaciones</option>
                                            <option value="temporal">Ausencia Temporal</option>
                                            <option value="otro">Otro</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Inactividad</Form.Label>
                                        <BSFormControl
                                            type="date"
                                            name="inactive_since"
                                            value={formData.inactive_since || ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Razón Detallada</Form.Label>
                                        <BSFormControl
                                            as="textarea"
                                            name="inactive_reason"
                                            value={formData.inactive_reason || ''}
                                            onChange={handleChange}
                                            placeholder="Detalles adicionales sobre la inactividad..."
                                        />
                                    </Form.Group>
                                </>
                            )}

                            <hr className="my-4" />
                            <Form.Group className="mb-3">
                                <Form.Label>Foto (opcional)</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} />
                                {fotoFile && <div className="small mt-1">Archivo seleccionado: {fotoFile.name}</div>}
                            </Form.Group>
                        </>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button variant="secondary" onClick={onHide}>{isViewOnly ? 'Cerrar' : 'Cancelar'}</Button>
                        {!isViewOnly && <Button type="submit" variant="primary">Guardar</Button>}
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

const SociosPage = () => {
    const [socios, setSocios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingSocio, setEditingSocio] = useState(null);
    const [viewingSocio, setViewingSocio] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

    const fetchSocios = async () => {
        try {
            const response = await apiClient.get(`socios/?search=${searchTerm}`);
            setSocios(response.data.results ? response.data.results : response.data);
        } catch (error) {
            setSocios([]);
        }
    };

    useEffect(() => {
        fetchSocios();
    }, [searchTerm]);

    const handleSaveSocio = async (formData, ci) => {
        try {
            if (ci) {
                await apiClient.put(`/socios/${ci}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            } else {
                await apiClient.post('/socios/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            }
            fetchSocios();
            setFormOpen(false);
            setEditingSocio(null);
            setAlert({ show: true, message: 'Socio guardado correctamente', variant: 'success' });
        } catch (error) {
            setAlert({ show: true, message: 'Error al guardar socio', variant: 'danger' });
        }
    };

    const handleDeleteSocio = async (ci) => {
        if (!ci) {
            alert("No se puede eliminar un socio sin CI. Por favor, edita el socio y asigna un CI válido o elimínalo manualmente desde la base de datos.");
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar a este socio?')) {
            try {
                await apiClient.delete(`/socios/${ci}/`);
                fetchSocios();
                setAlert({ show: true, message: 'Socio eliminado correctamente', variant: 'success' });
            } catch (error) {
                setAlert({ show: true, message: 'Error al eliminar socio', variant: 'danger' });
            }
        }
    };

    return (
        <div className="bg-light min-vh-100 py-5">
            <Container fluid className="px-0">
                <Row className="justify-content-center">
                    <Col xl={10} lg={12}>
                        <Row className="mb-4 align-items-center">
                            <Col><h2 className="fw-bolder text-primary text-center w-100">Socios</h2></Col>
                            <Col xs="auto">
                                <Button variant="primary" onClick={() => { setFormOpen(true); setEditingSocio(null); }}>
                                    <PersonPlus className="me-2" /> Agregar Socio
                                </Button>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <InputGroup>
                                    <BSFormControl
                                        placeholder="Buscar por nombre o CI..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                        {alert.show && <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>{alert.message}</Alert>}
                        <Card className="shadow border-0 w-100">
                            <Card.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: 0, scrollbarGutter: 'stable' }} className="tabla-scroll-oculta">
                                <Table responsive hover className="align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>CI</th>
                                            <th>Nombre</th>
                                            <th>Celular</th>
                                            <th>Tipo de Cuota</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {socios.map(socio => (
                                            <tr key={socio.ci}>
                                                <td>{socio.ci}</td>
                                                <td>{socio.nombre}</td>
                                                <td>{socio.celular}</td>
                                                <td>{socio.tipo_cuota}</td>
                                                <td>
                                                    {socio.activo ? (
                                                        <span className="badge bg-success">Activo</span>
                                                    ) : (
                                                        <span className="badge bg-danger" title={socio.inactive_reason}>
                                                            {socio.inactive_status === 'vacaciones' ? 'Vacaciones' :
                                                             socio.inactive_status === 'temporal' ? 'Ausencia Temporal' : 'Inactivo'}
                                                            {socio.inactive_since && ` (desde ${new Date(socio.inactive_since).toLocaleDateString()})`}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setViewingSocio(socio)}><Eye /></Button>
                                                    <Button variant="outline-success" size="sm" className="me-2" onClick={() => { setEditingSocio(socio); setFormOpen(true); }}><PencilSquare /></Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSocio(socio.ci)}><Trash /></Button>
                                                    {socio.celular && (
                                                        <Button variant="outline-success" size="sm" className="ms-2" onClick={() => window.open(`https://wa.me/${socio.celular.replace(/\D/g, '')}`)}><Whatsapp /></Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        {/* Formulario para crear/editar socio */}
                        <SocioForm
                            show={formOpen}
                            onHide={() => { setFormOpen(false); setEditingSocio(null); }}
                            onSave={handleSaveSocio}
                            socio={editingSocio}
                            sociosList={socios}
                        />
                        {/* Modal de solo lectura */}
                        <Modal show={!!viewingSocio} onHide={() => setViewingSocio(null)} centered size="md">
                            <Modal.Header closeButton>
                                <Modal.Title>Detalles del Socio</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {viewingSocio && (
                                    <>
                                        {viewingSocio.foto && (
                                            <div className="d-flex justify-content-center mb-3">
                                                <img src={viewingSocio.foto} alt={viewingSocio.nombre} style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid #ddd' }} />
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <h5 className="mb-3">Información Personal</h5>
                                            <p><strong>CI:</strong> {viewingSocio.ci}</p>
                                            <p><strong>Nombre:</strong> {viewingSocio.nombre}</p>
                                            <p><strong>Celular:</strong> {viewingSocio.celular || 'No especificado'}</p>
                                            <p><strong>Fecha de Nacimiento:</strong> {viewingSocio.fecha_nacimiento || 'No especificada'}</p>
                                            <p><strong>Tipo de Cuota:</strong> {viewingSocio.tipo_cuota || 'No especificado'}</p>
                                        </div>

                                        <div className="mb-3">
                                            <h5 className="mb-3">Contacto de Emergencia</h5>
                                            <p><strong>Nombre:</strong> {viewingSocio.contacto_emergencia || 'No especificado'}</p>
                                            <p><strong>Teléfono:</strong> {viewingSocio.emergencia_movil || 'No especificado'}</p>
                                        </div>

                                        <div className="mb-3">
                                            <h5 className="mb-3">Estado Actual</h5>
                                            {viewingSocio.activo ? (
                                                <p><span className="badge bg-success">Activo</span></p>
                                            ) : (
                                                <div>
                                                    <p>
                                                        <span className="badge bg-danger">
                                                            {viewingSocio.inactive_status === 'vacaciones' ? 'Vacaciones' :
                                                             viewingSocio.inactive_status === 'temporal' ? 'Ausencia Temporal' : 'Inactivo'}
                                                        </span>
                                                    </p>
                                                    {viewingSocio.inactive_since && (
                                                        <p><strong>Inactivo desde:</strong> {new Date(viewingSocio.inactive_since).toLocaleDateString()}</p>
                                                    )}
                                                    {viewingSocio.inactive_reason && (
                                                        <p><strong>Razón:</strong> {viewingSocio.inactive_reason}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {(viewingSocio.enfermedades || viewingSocio.comentarios) && (
                                            <div className="mb-3">
                                                <h5 className="mb-3">Información Adicional</h5>
                                                {viewingSocio.enfermedades && (
                                                    <p><strong>Enfermedades:</strong> {viewingSocio.enfermedades}</p>
                                                )}
                                                {viewingSocio.comentarios && (
                                                    <p><strong>Comentarios:</strong> {viewingSocio.comentarios}</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setViewingSocio(null)}>Cerrar</Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SociosPage;