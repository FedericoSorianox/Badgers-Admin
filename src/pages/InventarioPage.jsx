import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api';
import {
    Card, Row, Col, Container, Button, Form, Table,
    Modal, ListGroup, FormGroup, FormLabel, FormControl,
    Nav, NavItem, NavLink, TabContent, TabPane
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, faEdit, faTrash, faArrowUp, 
    faArrowDown, faTimes, faMoneyBill,
    faImage
} from '@fortawesome/free-solid-svg-icons';

// --- Componente de Formulario para Productos (con fotos y modo vista) ---
const ProductForm = ({ show, onHide, onSave, product, isViewOnly = false }) => {
    const [formData, setFormData] = useState({ nombre: '', precio_costo: '', precio_venta: '', stock: '' });
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        setFormData(product || { nombre: '', precio_costo: '0', precio_venta: '0', stock: '0' });
        setFotoFile(null);
    }, [product]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFotoFile(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        
        // Agregar todos los campos del formulario excepto la foto
        Object.keys(formData).forEach(key => {
            if (key !== 'foto') {
                data.append(key, formData[key]);
            }
        });
        
        // Agregar la foto solo si hay un archivo
        if (fotoFile) {
            data.append('foto', fotoFile);
        }
        
        onSave(data, fotoFile, product?.id);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isViewOnly ? 'Detalles del Producto' : (product ? 'Editar Producto' : 'Agregar Producto')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {product && product.foto && (
                    <div className="text-center mb-3">
                        <img 
                            src={product.foto} 
                            alt={formData.nombre}
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px' }}
                        />
                    </div>
                )}
                <Form onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                        <FormLabel>Nombre</FormLabel>
                        <FormControl
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            disabled={isViewOnly}
                            required
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormLabel>Precio de Costo</FormLabel>
                        <FormControl
                            name="precio_costo"
                            type="number"
                            value={formData.precio_costo}
                            onChange={handleChange}
                            disabled={isViewOnly}
                            required
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormLabel>Precio de Venta</FormLabel>
                        <FormControl
                            name="precio_venta"
                            type="number"
                            value={formData.precio_venta}
                            onChange={handleChange}
                            disabled={isViewOnly}
                            required
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormLabel>Stock</FormLabel>
                        <FormControl
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            disabled={isViewOnly}
                            required
                        />
                    </FormGroup>
                    {!isViewOnly && (
                        <FormGroup className="mb-3">
                            <FormLabel>Foto del Producto</FormLabel>
                            <FormControl
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </FormGroup>
                    )}
                    {fotoFile && (
                        <p className="text-muted small">{fotoFile.name}</p>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    {isViewOnly ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!isViewOnly && (
                    <Button variant="primary" onClick={handleSubmit}>
                        Guardar
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

// --- Componente para el Panel de Detalles del Producto ---
const ProductDetailPanel = ({ product, show, onHide, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData(product);
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'foto') {
                    data.append(key, formData[key]);
                }
            });
            
            if (fotoFile) {
                data.append('foto', fotoFile);
            }

            const response = await apiClient.patch(`/productos/${product.id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setIsEditing(false);
            if (typeof onEdit === 'function') {
                onEdit(response.data);
            }
            onHide();
        } catch (error) {
            console.error("Error al guardar producto:", error);
            alert("Error al guardar los cambios");
        }
    };

    if (!product) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                        {isEditing ? 'Editar Producto' : 'Detalles del Producto'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-4">
                    <img 
                            src={product.foto} 
                        alt={product.nombre}
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                    />
                </div>

                <Form>
                    <FormGroup className="mb-3">
                        <FormLabel>Nombre</FormLabel>
                        <FormControl
                        name="nombre"
                        value={formData.nombre || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormLabel>Precio de Costo</FormLabel>
                        <FormControl
                        name="precio_costo"
                        type="number"
                        value={formData.precio_costo || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormLabel>Precio de Venta</FormLabel>
                        <FormControl
                        name="precio_venta"
                        type="number"
                        value={formData.precio_venta || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormLabel>Stock</FormLabel>
                        <FormControl
                        name="stock"
                        type="number"
                        value={formData.stock || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        />
                    </FormGroup>

                    {isEditing && (
                        <FormGroup className="mb-3">
                            <FormLabel>Cambiar Foto</FormLabel>
                            <FormControl
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </FormGroup>
                    )}

                    <Card className="mt-3 p-3 bg-light">
                        <p className="mb-1 text-muted">Ganancia por unidad:</p>
                        <h4 className="text-success mb-0">
                            ${(formData.precio_venta - formData.precio_costo).toFixed(2)}
                        </h4>
                    </Card>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                        {isEditing ? (
                            <>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Cancelar
                                </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Guardar Cambios
                        </Button>
                            </>
                        ) : (
                            <>
                        <Button variant="secondary" onClick={onHide}>
                            Cerrar
                        </Button>
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                                    Editar
                                </Button>
                        <Button variant="danger" onClick={() => onDelete(product.id)}>
                                    Eliminar
                                </Button>
                            </>
                        )}
            </Modal.Footer>
        </Modal>
    );
};

// --- Componente de Lista de Productos ---
const ProductListComponent = ({ onProductUpdate, onEdit }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProductView, setSelectedProductView] = useState(null);
    
    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/productos/');
            setProducts(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            try {
                await apiClient.delete(`/productos/${id}/`);
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Error al eliminar el producto");
            }
        }
    };

    const handleSave = async (formData, file, id) => {
        try {
            let response;
            
            if (id) {
                response = await apiClient.patch(`/productos/${id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await apiClient.post('/productos/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowForm(false);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            if (error.response && error.response.data) {
                alert("Error al guardar el producto: " + JSON.stringify(error.response.data));
            } else {
                alert("Error al guardar el producto");
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Lista de Productos</h4>
                <Button 
                    variant="primary"
                    onClick={() => {
                        setSelectedProduct(null);
                        setShowForm(true);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Agregar Producto
                </Button>
            </div>

            <Table responsive hover className="user-table align-items-center">
                <thead className="bg-light">
                    <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Precio Costo</th>
                        <th>Precio Venta</th>
                        <th>Stock</th>
                        <th>Ganancia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} onClick={() => { setSelectedProductView(product); setShowViewModal(true); }} style={{ cursor: 'pointer' }}>
                            <td>
                                {product.foto ? (
                                    <img 
                                        src={product.foto} 
                                        alt={product.nombre}
                                        className="rounded"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                        <FontAwesomeIcon icon={faImage} className="text-muted" />
                                    </div>
                                )}
                            </td>
                            <td>{product.nombre}</td>
                            <td>${product.precio_costo}</td>
                            <td>${product.precio_venta}</td>
                            <td>{product.stock}</td>
                            <td className={product.precio_venta - product.precio_costo >= 0 ? 'text-success' : 'text-danger'}>
                                ${(product.precio_venta - product.precio_costo).toFixed(2)}
                            </td>
                            <td>
                                <Button 
                                    variant="link" 
                                    className="p-0 me-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProduct(product);
                                        setShowDetail(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button 
                                    variant="link" 
                                    className="p-0 text-danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(product.id);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </Table>

            <ProductForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSave={handleSave}
                product={selectedProduct}
            />

            <ProductDetailPanel
                show={showDetail}
                onHide={() => setShowDetail(false)}
                onEdit={onEdit}
                onDelete={handleDelete}
                product={selectedProduct}
            />

            <ProductForm
                show={showViewModal}
                onHide={() => setShowViewModal(false)}
                onSave={() => {}}
                product={selectedProductView}
                isViewOnly={true}
            />
        </div>
    );
};

// --- Componente de Formulario de Venta ---
const VentaFormComponent = ({ productos, onVentaSuccess, ventas }) => {
    const [venta, setVenta] = useState({
        producto: '',
        cantidad: 1,
        fecha_venta: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => setVenta({ ...venta, [e.target.name]: e.target.value });

    const handleDelete = async (ventaId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
            try {
                await apiClient.delete(`/ventas/${ventaId}/`);
                onVentaSuccess(); // Recargar los datos
            } catch (error) {
                console.error("Error al eliminar la venta:", error);
                alert("Error al eliminar la venta");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const producto = productos.find(p => p.id === parseInt(venta.producto));
            if (!producto) {
                alert('Producto no encontrado');
                return;
            }

            if (producto.stock < parseInt(venta.cantidad)) {
                alert('No hay suficiente stock disponible');
                return;
            }

            const total_venta = producto.precio_venta * parseInt(venta.cantidad);
            const payload = {
                ...venta,
                total_venta,
                producto: producto.id
            };

            await apiClient.post('/ventas/', payload);
            setVenta({
                producto: '',
                cantidad: 1,
                fecha_venta: new Date().toISOString().split('T')[0]
            });
            onVentaSuccess();
        } catch (error) {
            console.error("Error al registrar venta:", error);
            alert("Error al registrar la venta");
        }
    };

    // --- Historial de Ventas ---
    const ventasConNombre = ventas.map(v => {
        const prod = productos.find(p => p.id === v.producto);
        return {
            ...v,
            nombre_producto: prod ? prod.nombre : 'Desconocido',
            precio_venta: prod ? prod.precio_venta : 0
        };
    }).sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta)); // Ordenar por fecha más reciente

    return (
        <>
        <Card className="shadow border-0 w-100 bg-white p-3 mb-4">
            <Card.Title as="h4" className="mb-4 text-center text-primary">Registrar Nueva Venta</Card.Title>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={4}>
                        <FormGroup className="mb-3">
                            <FormLabel>Producto</FormLabel>
                            <Form.Select
                                name="producto"
                                value={venta.producto}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar producto...</option>
                                {productos.map(producto => (
                                    <option key={producto.id} value={producto.id}>
                                        {producto.nombre} - Stock: {producto.stock}
                                    </option>
                                ))}
                            </Form.Select>
                        </FormGroup>
                    </Col>
                    <Col md={2}>
                        <FormGroup className="mb-3">
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl
                                type="number"
                                name="cantidad"
                                value={venta.cantidad}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup className="mb-3">
                            <FormLabel>Fecha de Venta</FormLabel>
                            <FormControl
                                type="date"
                                name="fecha_venta"
                                value={venta.fecha_venta}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                        <Button type="submit" variant="primary" className="w-100">
                            Registrar Venta
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
        <Card className="shadow border-0 w-100 bg-white p-3">
            <Card.Title as="h5" className="mb-4 text-center text-secondary">Historial de Ventas</Card.Title>
            <Table responsive hover className="user-table align-items-center">
                <thead className="bg-light">
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ventasConNombre.length === 0 ? (
                        <tr><td colSpan="5" className="text-center">No hay ventas registradas.</td></tr>
                    ) : ventasConNombre.map((venta) => (
                        <tr key={venta.id}>
                            <td>{venta.nombre_producto}</td>
                            <td>{venta.cantidad}</td>
                            <td>${venta.total_venta}</td>
                            <td>{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                            <td>
                                <Button 
                                    variant="link" 
                                    className="p-0 text-danger"
                                    onClick={() => handleDelete(venta.id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
        </>
    );
};

// --- Componente de Stock Semanal ---
const StockSemanalComponent = ({ productos, ventas }) => {
    const [selectedWeek, setSelectedWeek] = useState(null);
    
    const getWednesdays = () => {
        const wednesdays = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        
        for (let month = 0; month < 12; month++) {
            for (let day = 1; day <= 31; day++) {
                const date = new Date(currentYear, month, day);
                if (date.getDay() === 3) { // 3 es miércoles
                    wednesdays.push(new Date(date));
                }
            }
        }
        
        return wednesdays;
    };
    
    const getWeekDates = (wednesdayDate) => {
        const dates = [];
        const startDate = new Date(wednesdayDate);
        startDate.setDate(startDate.getDate() - 3); // Comienza el domingo
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const wednesdays = getWednesdays();
    const weekDates = selectedWeek ? getWeekDates(selectedWeek) : [];

    return (
        <Card className="shadow border-0 w-100 bg-white p-3">
            <Card.Title as="h4" className="mb-4 text-center text-primary">Stock Semanal</Card.Title>
            
            <FormGroup className="mb-4">
                <FormLabel>Seleccionar Semana</FormLabel>
                <Form.Select
                    value={selectedWeek ? selectedWeek.toISOString() : ''}
                    onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                >
                    <option value="">Seleccionar semana...</option>
                        {wednesdays.map((wednesday, index) => (
                        <option key={index} value={wednesday.toISOString()}>
                                Semana del {formatDate(wednesday)}
                        </option>
                    ))}
                </Form.Select>
            </FormGroup>

            {selectedWeek && (
                <Table responsive hover className="user-table align-items-center">
                    <thead className="bg-light">
                        <tr>
                            <th>Producto</th>
                            {weekDates.map((date, index) => (
                                <th key={index} className="text-center">
                                    {formatDate(date)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map(producto => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                {weekDates.map((date, index) => {
                                    const ventasDelDia = ventas.filter(v => {
                                        const ventaDate = new Date(v.fecha_venta);
                                        return ventaDate.toDateString() === date.toDateString() &&
                                               v.producto === producto.id;
                                    });
                                    const stockVendido = ventasDelDia.reduce((acc, v) => acc + v.cantidad, 0);
                                    const stockInicial = producto.stock + stockVendido;
                                    
                                    return (
                                        <td key={index} className="text-center">
                                            {stockInicial}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
                        </Card>
    );
};

// --- Componente Principal de Inventario ---
const InventarioPage = () => {
    const [activeTab, setActiveTab] = useState('productos');
    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);

    const fetchData = async () => {
        try {
            const [productosRes, ventasRes] = await Promise.all([
                apiClient.get('/productos/'),
                apiClient.get('/ventas/')
            ]);
            setProductos(productosRes.data.results || productosRes.data);
            setVentas(ventasRes.data.results || ventasRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleProductUpdate = () => {
        fetchData();
    };

    return (
        <Container fluid className="px-0">
            <Row className="justify-content-center">
                <Col xl={10} lg={12}>
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                        <h1 className="h2 mb-0 text-center w-100">Gestión de Inventario</h1>
                    </div>

                    <Nav variant="pills" className="mb-4">
                        <NavItem>
                            <NavLink 
                                active={activeTab === 'productos'} 
                                onClick={() => setActiveTab('productos')}
                            >
                                Productos
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink 
                                active={activeTab === 'ventas'} 
                                onClick={() => setActiveTab('ventas')}
                            >
                                Ventas
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink 
                                active={activeTab === 'stock'} 
                                onClick={() => setActiveTab('stock')}
                            >
                                Stock Semanal
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent>
                        <TabPane active={activeTab === 'productos'}>
                            <ProductListComponent 
                                onProductUpdate={handleProductUpdate}
                            />
                        </TabPane>
                        <TabPane active={activeTab === 'ventas'}>
                            <VentaFormComponent 
                                productos={productos}
                                ventas={ventas}
                                onVentaSuccess={handleProductUpdate}
                            />
                        </TabPane>
                        <TabPane active={activeTab === 'stock'}>
                            <StockSemanalComponent 
                                productos={productos}
                                ventas={ventas}
                            />
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
            </Container>
    );
};

export default InventarioPage;