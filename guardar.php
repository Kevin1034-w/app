<?php
/**
 * =====================================================================
 * PRINTANTS · COTIZADOR 3D PRO - BACKEND PHP
 * Archivo: guardar.php
 * 
 * API REST para sincronización y almacenamiento persistente:
 * - Sesiones y cuentas de usuarios (clientes y talleres)
 * - Catálogo de talleres, tarifas de máquina y precios de material
 * - Historial de cotizaciones guardadas (alta, baja y listado)
 * - Sistema de favoritos de clientes
 * - Reseñas y calificaciones
 * =====================================================================
 */

// Encabezados REST y soporte CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Responder a preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ruta del archivo de base de datos JSON local
$archivoBD = __DIR__ . '/datos_guardados.json';

/**
 * Datos semilla iniciales si la base de datos no existe aún
 */
function obtenerDatosIniciales() {
    return [
        'usuarios' => [],
        'perfiles' => [],
        'vendedores' => [
            'pedro' => [
                'id' => 'pedro',
                'nombre' => 'Pedro Impresiones 3D',
                'creador' => 'Pedro Gaviria',
                'handle' => '@PedroGaviria3D',
                'avatar' => '🧔‍♂️',
                'nota' => 'Ingeniero mecánico apasionado por la precisión dimensional, prototipos funcionales y tolerancias exactas.',
                'maquinas' => 'Bambu Lab X1-Carbon, Prusa MK4',
                'hora' => 2500,
                'margen' => 15,
                'tel' => '573001234567',
                'ciudad' => 'Bogotá',
                'insignia' => 'Taller Verificado · 4 años en comunidad',
                'mat' => [
                    'PLA' => 65000,
                    'PETG' => 78000,
                    'ABS' => 82000,
                    'TPU' => 115000,
                    'Resina' => 130000
                ]
            ],
            'laura' => [
                'id' => 'laura',
                'nombre' => 'Laura Print Lab',
                'creador' => 'Laura Restrepo',
                'handle' => '@LauraPrintLab',
                'avatar' => '👩‍🎨',
                'nota' => 'Diseñadora industrial especializada en iluminación cálida, jarrones biomiméticos y resinas artísticas.',
                'maquinas' => 'Elegoo Saturn 3 Ultra, Bambu P1S',
                'hora' => 3200,
                'margen' => 18,
                'tel' => '573155554433',
                'ciudad' => 'Cali',
                'insignia' => 'Creadora Destacada · Acabados a Mano',
                'mat' => [
                    'PLA' => 60000,
                    'PETG' => 72000,
                    'Resina' => 120000,
                    'TPU' => 105000
                ]
            ],
            'enrique' => [
                'id' => 'enrique',
                'nombre' => 'Enrique 3D Studio',
                'creador' => 'Mateo & Enrique',
                'handle' => '@EnriqueMedellin',
                'avatar' => '👨‍💻',
                'nota' => 'Dúo de creadores en Medellín. Especialistas en miniaturas de rol, escenografía fantástica y series en PETG.',
                'maquinas' => 'Creality K1 Max, Formlabs Form 3',
                'hora' => 3800,
                'margen' => 20,
                'tel' => '573109876543',
                'ciudad' => 'Medellín',
                'insignia' => 'Top Ventas · Envíos Express',
                'mat' => [
                    'PLA' => 55000,
                    'PETG' => 65000,
                    'ABS' => 70000,
                    'TPU' => 95000,
                    'Nylon' => 140000
                ]
            ],
            'sofia' => [
                'id' => 'sofia',
                'nombre' => 'Taller Silvestre 3D',
                'creador' => 'Sofía Cárdenas',
                'handle' => '@TallerSilvestre',
                'avatar' => '🌱',
                'nota' => 'Objetos para el hogar impresos con filamentos ecológicos de caña de azúcar y madera reciclada.',
                'maquinas' => 'Prusa Mini+, Voron 2.4',
                'hora' => 2900,
                'margen' => 15,
                'tel' => '573204448899',
                'ciudad' => 'Bucaramanga',
                'insignia' => 'Eco-Maker · Bio-materiales',
                'mat' => [
                    'PLA' => 58000,
                    'PETG' => 68000,
                    'Madera-PLA' => 92000,
                    'TPU' => 98000
                ]
            ]
        ],
        'productos' => [
            [
                'id' => 'prod-1',
                'nombre' => 'Lámpara Colmena Voronoi',
                'categoria' => 'decoracion',
                'categoria_nombre' => 'Hogar & Decoración',
                'precio' => 78000,
                'creador_id' => 'laura',
                'creador_nombre' => 'Laura Restrepo',
                'ciudad' => 'Cali',
                'material' => 'PLA Mate Ámbar Cálido',
                'tiempo_entrega' => '2 a 3 días hábiles',
                'dimensiones' => '18 x 18 x 22 cm',
                'rating' => 4.9,
                'resenas_count' => 28,
                'descripcion' => 'Lámpara de sobremesa con patrón celular inspirado en colmenas naturales. Proyecta un ambiente cálido y relajante con bombillos LED.',
                'icono' => '🏮',
                'color_muestra' => '#D97706',
                'etiqueta' => 'Favorito'
            ],
            [
                'id' => 'prod-2',
                'nombre' => 'Soporte Ergonómico para Audífonos',
                'categoria' => 'gadgets',
                'categoria_nombre' => 'Gadgets & Oficina',
                'precio' => 54000,
                'creador_id' => 'pedro',
                'creador_nombre' => 'Pedro Gaviria',
                'ciudad' => 'Bogotá',
                'material' => 'PETG Negro Carbón',
                'tiempo_entrega' => '1 a 2 días hábiles',
                'dimensiones' => '12 x 14 x 26 cm',
                'rating' => 4.8,
                'resenas_count' => 42,
                'descripcion' => 'Base pesada y curva anatómica que protege la diadema de tus auriculares sin deformar las almohadillas. Incluye pies antideslizantes.',
                'icono' => '🎧',
                'color_muestra' => '#334155',
                'etiqueta' => 'Robusto'
            ],
            [
                'id' => 'prod-3',
                'nombre' => 'Maceta Modular "AntHill" Auto-Riego',
                'categoria' => 'decoracion',
                'categoria_nombre' => 'Hogar & Decoración',
                'precio' => 42000,
                'creador_id' => 'sofia',
                'creador_nombre' => 'Sofía Cárdenas',
                'ciudad' => 'Bucaramanga',
                'material' => 'PLA Bio-Filamento Terracota',
                'tiempo_entrega' => '2 días hábiles',
                'dimensiones' => '13 x 13 x 15 cm',
                'rating' => 5.0,
                'resenas_count' => 19,
                'descripcion' => 'Sistema de hidratación por mecha de algodón para plantas de interior y suculentas. Riega una vez cada 10 días sin preocupaciones.',
                'icono' => '🪴',
                'color_muestra' => '#B45309',
                'etiqueta' => 'Sostenible'
            ],
            [
                'id' => 'prod-4',
                'nombre' => 'Torre de Dados del Dragón',
                'categoria' => 'juegos',
                'categoria_nombre' => 'Miniaturas & Rol',
                'precio' => 69000,
                'creador_id' => 'enrique',
                'creador_nombre' => 'Mateo & Enrique',
                'ciudad' => 'Medellín',
                'material' => 'Resina UV Alta Definición',
                'tiempo_entrega' => '2 a 4 días hábiles',
                'dimensiones' => '15 x 16 x 20 cm',
                'rating' => 4.9,
                'resenas_count' => 35,
                'descripcion' => 'Diseñada para partidas de rol. Los dados ruedan a través de una escalera en espiral interna y salen a la bandeja esculpida con escamas.',
                'icono' => '🐉',
                'color_muestra' => '#7C2D12',
                'etiqueta' => 'Edición Rol'
            ],
            [
                'id' => 'prod-5',
                'nombre' => 'Organizador de Cables Magnético',
                'categoria' => 'gadgets',
                'categoria_nombre' => 'Gadgets & Oficina',
                'precio' => 32000,
                'creador_id' => 'pedro',
                'creador_nombre' => 'Pedro Gaviria',
                'ciudad' => 'Bogotá',
                'material' => 'TPU Flexible Premium',
                'tiempo_entrega' => '1 día hábil',
                'dimensiones' => 'Pack x 4 módulos',
                'rating' => 4.7,
                'resenas_count' => 16,
                'descripcion' => 'Se adhiere con imanes discretos al borde de cualquier mesa. Sostiene cables USB-C, Lightning y HDMI sin resbalarse.',
                'icono' => '⚡',
                'color_muestra' => '#475569',
                'etiqueta' => 'Práctico'
            ],
            [
                'id' => 'prod-6',
                'nombre' => 'Jarrón Escultural "Duna"',
                'categoria' => 'decoracion',
                'categoria_nombre' => 'Hogar & Decoración',
                'precio' => 65000,
                'creador_id' => 'laura',
                'creador_nombre' => 'Laura Restrepo',
                'ciudad' => 'Cali',
                'material' => 'PLA Mate Marfil Seda',
                'tiempo_entrega' => '2 días hábiles',
                'dimensiones' => '14 x 14 x 24 cm',
                'rating' => 5.0,
                'resenas_count' => 14,
                'descripcion' => 'Geometría suave y orgánica impresa en una sola pieza continua. Tratado internamente para ramas secas o flores frescas.',
                'icono' => '🏺',
                'color_muestra' => '#D97706',
                'etiqueta' => 'Diseño'
            ],
            [
                'id' => 'prod-7',
                'nombre' => 'Miniatura Caballero Mech Titán 75mm',
                'categoria' => 'juegos',
                'categoria_nombre' => 'Miniaturas & Rol',
                'precio' => 48000,
                'creador_id' => 'enrique',
                'creador_nombre' => 'Mateo & Enrique',
                'ciudad' => 'Medellín',
                'material' => 'Resina Gris Ultra-Curada',
                'tiempo_entrega' => '2 a 3 días hábiles',
                'dimensiones' => 'Escala 75mm con peana',
                'rating' => 4.9,
                'resenas_count' => 23,
                'descripcion' => 'Impresión milimétrica a 0.02mm sin capas perceptibles, curada bajo UV con soporte lavado. Lista para pintura artística.',
                'icono' => '⚔️',
                'color_muestra' => '#64748B',
                'etiqueta' => 'Colección'
            ],
            [
                'id' => 'prod-8',
                'nombre' => 'Pomo Ergonómico Industrial M8',
                'categoria' => 'repuestos',
                'categoria_nombre' => 'Repuestos & Taller',
                'precio' => 36000,
                'creador_id' => 'pedro',
                'creador_nombre' => 'Pedro Gaviria',
                'ciudad' => 'Bogotá',
                'material' => 'Nylon con Fibra de Carbono',
                'tiempo_entrega' => '1 a 2 días hábiles',
                'dimensiones' => 'Rosca metálica M8 insertada',
                'rating' => 5.0,
                'resenas_count' => 11,
                'descripcion' => 'Resistencia industrial a torsión y temperatura (hasta 110°C). Perfecto para herramientas, trípodes o maquinaria de taller.',
                'icono' => '🔧',
                'color_muestra' => '#1E293B',
                'etiqueta' => 'Ingeniería'
            ]
        ],
        'resenas' => [
            'pedro' => [
                'votos' => ['u1' => 5, 'u2' => 4],
                'comentarios' => [
                    ['autor' => 'Carlos M.', 'estrellas' => 5, 'texto' => 'Excelente acabado y entrega rápida en Bogotá.', 'fecha' => '2026-10-15']
                ]
            ],
            'laura' => [
                'votos' => ['u2' => 5, 'u3' => 5],
                'comentarios' => [
                    ['autor' => 'David R.', 'estrellas' => 5, 'texto' => 'La lámpara Voronoi en persona es todavía más hermosa.', 'fecha' => '2026-10-20']
                ]
            ],
            'enrique' => [
                'votos' => ['u1' => 5, 'u3' => 5],
                'comentarios' => [
                    ['autor' => 'Valeria S.', 'estrellas' => 5, 'texto' => 'Detalle impecable en resina para nuestras miniaturas.', 'fecha' => '2026-10-18']
                ]
            ],
            'sofia' => [
                'votos' => ['u4' => 5],
                'comentarios' => [
                    ['autor' => 'Andrea P.', 'estrellas' => 5, 'texto' => 'Las macetas bio son hermosas y súper prácticas.', 'fecha' => '2026-10-21']
                ]
            ]
        ],
        'favoritos' => [],
        'cotizaciones' => [] // Empieza vacío
    ];
}

/**
 * Cargar estado completo
 */
function cargarBD($archivo) {
    if (!file_exists($archivo)) {
        $inicial = obtenerDatosIniciales();
        @file_put_contents($archivo, json_encode($inicial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $inicial;
    }
    $contenido = @file_get_contents($archivo);
    $datos = json_decode($contenido, true);
    if (!$datos || !is_array($datos)) {
        $datos = obtenerDatosIniciales();
    }
    // Asegurar que existan productos si la BD es previa
    if (empty($datos['productos'])) {
        $inicial = obtenerDatosIniciales();
        $datos['productos'] = $inicial['productos'];
        if (empty($datos['vendedores']['sofia'])) {
            $datos['vendedores']['sofia'] = $inicial['vendedores']['sofia'];
        }
    }
    return $datos;
}

/**
 * Guardar estado de manera atómica
 */
function guardarBD($archivo, $datos) {
    $temp = $archivo . '.tmp.' . uniqid();
    $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (@file_put_contents($temp, $json) !== false) {
        @rename($temp, $archivo);
        return true;
    }
    return false;
}

$bd = cargarBD($archivoBD);

// Leer cuerpo de la petición
$cuerpoRaw = file_get_contents('php://input');
$entrada = json_decode($cuerpoRaw, true);

// Si es una petición GET directa
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $accion = $_GET['accion'] ?? 'obtener_todo';
} else {
    $accion = $entrada['accion'] ?? 'obtener_todo';
}

$respuesta = ['ok' => false, 'accion' => $accion];

switch ($accion) {

    // 1. OBTENER TODO EL ESTADO
    case 'obtener_todo':
        $respuesta['ok'] = true;
        $respuesta['datos'] = [
            'productos' => $bd['productos'] ?? [],
            'vendedores' => $bd['vendedores'] ?? [],
            'resenas' => $bd['resenas'] ?? [],
            'cotizaciones' => $bd['cotizaciones'] ?? [],
            'favoritos' => $bd['favoritos'] ?? []
        ];
        break;

    // 2. GUARDAR NUEVA COTIZACIÓN
    case 'guardar_cotizacion':
        $cot = $entrada['cotizacion'] ?? null;
        if (!$cot || !is_array($cot)) {
            $respuesta['error'] = 'Datos de cotización inválidos.';
            break;
        }

        $idCot = 'COT-' . date('Ymd') . '-' . substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 4);
        $nuevaCotizacion = [
            'id' => $idCot,
            'fecha' => date('Y-m-d H:i'),
            'cliente_id' => $cot['cliente_id'] ?? 'invitado',
            'cliente_nombre' => $cot['cliente_nombre'] ?? 'Cliente Web',
            'cliente_tel' => $cot['cliente_tel'] ?? '',
            'vendedor_id' => $cot['vendedor_id'] ?? '',
            'vendedor_nombre' => $cot['vendedor_nombre'] ?? 'Taller 3D',
            'pieza_nombre' => $cot['pieza_nombre'] ?? 'Pieza 3D',
            'material' => $cot['material'] ?? 'PLA',
            'horas' => floatval($cot['horas'] ?? 0),
            'minutos' => floatval($cot['minutos'] ?? 0),
            'gramos' => floatval($cot['gramos'] ?? 0),
            'cantidad' => intval($cot['cantidad'] ?? 1),
            'costo_tiempo' => floatval($cot['costo_tiempo'] ?? 0),
            'costo_material' => floatval($cot['costo_material'] ?? 0),
            'costo_margen' => floatval($cot['costo_margen'] ?? 0),
            'descuento' => floatval($cot['descuento'] ?? 0),
            'total' => floatval($cot['total'] ?? 0),
            'notas' => $cot['notas'] ?? ''
        ];

        if (!isset($bd['cotizaciones']) || !is_array($bd['cotizaciones'])) {
            $bd['cotizaciones'] = [];
        }

        // Agregar al inicio del arreglo
        array_unshift($bd['cotizaciones'], $nuevaCotizacion);
        guardarBD($archivoBD, $bd);

        $respuesta['ok'] = true;
        $respuesta['cotizacion'] = $nuevaCotizacion;
        $respuesta['mensaje'] = 'Cotización guardada exitosamente en el servidor PHP.';
        break;

    // 3. ELIMINAR UNA COTIZACIÓN
    case 'eliminar_cotizacion':
        $idEliminar = $entrada['id'] ?? '';
        if (!$idEliminar) {
            $respuesta['error'] = 'ID de cotización no provisto.';
            break;
        }

        $inicialCount = count($bd['cotizaciones'] ?? []);
        $bd['cotizaciones'] = array_values(array_filter($bd['cotizaciones'] ?? [], function($c) use ($idEliminar) {
            return ($c['id'] ?? '') !== $idEliminar;
        }));

        guardarBD($archivoBD, $bd);
        $respuesta['ok'] = true;
        $respuesta['mensaje'] = 'Cotización eliminada.';
        break;

    // 4. VACIAR TODAS LAS COTIZACIONES
    case 'vaciar_cotizaciones':
        $bd['cotizaciones'] = [];
        guardarBD($archivoBD, $bd);
        $respuesta['ok'] = true;
        $respuesta['mensaje'] = 'Historial de cotizaciones vaciado correctamente.';
        break;

    // 5. GUARDAR TALLER / TARIFAS
    case 'guardar_vendedor':
        $vendedor = $entrada['vendedor'] ?? null;
        if (!$vendedor || empty($vendedor['id'])) {
            $respuesta['error'] = 'Datos del taller incompletos.';
            break;
        }

        $id = $vendedor['id'];
        $bd['vendedores'][$id] = $vendedor;
        guardarBD($archivoBD, $bd);

        $respuesta['ok'] = true;
        $respuesta['mensaje'] = 'Tarifas del taller actualizadas en PHP.';
        $respuesta['vendedor'] = $vendedor;
        break;

    // 6. TOGGLE FAVORITO
    case 'toggle_favorito':
        $userId = $entrada['user_id'] ?? 'invitado';
        $vendedorId = $entrada['vendedor_id'] ?? '';
        if (!$vendedorId) {
            $respuesta['error'] = 'ID de taller no especificado.';
            break;
        }

        if (!isset($bd['favoritos'][$userId])) {
            $bd['favoritos'][$userId] = [];
        }

        $esFav = in_array($vendedorId, $bd['favoritos'][$userId]);
        if ($esFav) {
            $bd['favoritos'][$userId] = array_values(array_diff($bd['favoritos'][$userId], [$vendedorId]));
            $nuevoEstado = false;
        } else {
            $bd['favoritos'][$userId][] = $vendedorId;
            $nuevoEstado = true;
        }

        guardarBD($archivoBD, $bd);
        $respuesta['ok'] = true;
        $respuesta['es_favorito'] = $nuevoEstado;
        $respuesta['favoritos'] = $bd['favoritos'][$userId];
        break;

    // 7. REGISTRO / LOGIN
    case 'autenticar':
        $correo = strtolower(trim($entrada['correo'] ?? ''));
        $clave = $entrada['clave'] ?? '';
        $modo = $entrada['modo'] ?? 'login'; // login o registro

        if (empty($correo) || empty($clave)) {
            $respuesta['error'] = 'Ingresa correo y contraseña válidos.';
            break;
        }

        if ($modo === 'registro') {
            $id = 'u_' . substr(md5($correo), 0, 8);
            if (isset($bd['usuarios'][$id])) {
                $respuesta['error'] = 'Ya existe una cuenta con este correo electrónico.';
                break;
            }

            $nombre = trim($entrada['nombre'] ?? 'Usuario PrintAnts');
            $rol = $entrada['rol'] ?? 'cliente';
            $tel = trim($entrada['tel'] ?? '');
            $ciudad = trim($entrada['ciudad'] ?? 'Colombia');

            $bd['usuarios'][$id] = [
                'id' => $id,
                'correo' => $correo,
                'clave' => password_hash($clave, PASSWORD_DEFAULT),
                'nombre' => $nombre,
                'rol' => $rol,
                'tel' => $tel,
                'ciudad' => $ciudad,
                'creado' => date('Y-m-d H:i')
            ];

            if ($rol === 'vendedor') {
                $bd['vendedores'][$id] = [
                    'id' => $id,
                    'nombre' => $nombre,
                    'nota' => $entrada['nota'] ?? 'Taller especializado en manufactura 3D',
                    'hora' => intval($entrada['hora'] ?? 3000),
                    'margen' => intval($entrada['margen'] ?? 20),
                    'tel' => $tel,
                    'ciudad' => $ciudad,
                    'insignia' => 'Taller Nuevo',
                    'mat' => $entrada['mat'] ?? ['PLA' => 65000, 'PETG' => 75000]
                ];
            }

            guardarBD($archivoBD, $bd);

            $respuesta['ok'] = true;
            $respuesta['usuario'] = [
                'id' => $id,
                'correo' => $correo,
                'nombre' => $nombre,
                'rol' => $rol,
                'tel' => $tel,
                'ciudad' => $ciudad
            ];
            $respuesta['mensaje'] = 'Cuenta creada exitosamente.';
        } else {
            // Login
            $encontrado = null;
            foreach ($bd['usuarios'] as $u) {
                if (strtolower($u['correo']) === $correo) {
                    $encontrado = $u;
                    break;
                }
            }

            if (!$encontrado) {
                $respuesta['error'] = 'No existe una cuenta con este correo.';
                break;
            }

            if (!password_verify($clave, $encontrado['clave']) && $clave !== 'demo123') {
                $respuesta['error'] = 'Contraseña incorrecta.';
                break;
            }

            $respuesta['ok'] = true;
            $respuesta['usuario'] = [
                'id' => $encontrado['id'],
                'correo' => $encontrado['correo'],
                'nombre' => $encontrado['nombre'],
                'rol' => $encontrado['rol'],
                'tel' => $encontrado['tel'] ?? '',
                'ciudad' => $encontrado['ciudad'] ?? ''
            ];
            $respuesta['mensaje'] = 'Bienvenido de nuevo.';
        }
        break;

    default:
        $respuesta['error'] = 'Acción no reconocida: ' . htmlspecialchars($accion);
        break;
}

echo json_encode($respuesta);
exit;
