package com.example.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DestinoRepository {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
    private val displayFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

    private val _cintillo = MutableStateFlow(
        CintilloData(
            texto = "Consulado de España operando con normalidad. Citas consulares habilitadas.",
            color = "verde",
            actualizadoEn = dateFormat.format(Date())
        )
    )
    val cintillo: StateFlow<CintilloData> = _cintillo.asStateFlow()

    private val _promociones = MutableStateFlow(
        listOf(
            PromocionItem(
                id = "promo-001",
                titulo = "Apertura de Cuenta Bancaria en España",
                subtitulo = "Sin comisiones y 100% online para no residentes",
                textoBoton = "Saber más",
                colorFondo = "#004481",
                colorTexto = "#FFFFFF",
                contenido = "<h2>Abre tu cuenta bancaria española</h2><p>Accede a todos los servicios financieros para tu proceso migratorio con total comodidad.</p><ul><li>IBAN español garantizado</li><li>Tarjeta de débito física y virtual gratuita</li><li>Transferencias SEPA sin comisiones</li></ul>",
                activa = true,
                orden = 1,
                creadaEn = dateFormat.format(Date()),
                actualizadaEn = dateFormat.format(Date())
            ),
            PromocionItem(
                id = "promo-002",
                titulo = "Seguro Médico para Visado de Extranjería",
                subtitulo = "Póliza sin copagos y repatriación según normativa consular",
                textoBoton = "Cotizar póliza",
                colorFondo = "#0B1D3A",
                colorTexto = "#FFFFFF",
                contenido = "<h2>Póliza Médica Homologada</h2><p>Cumple con el 100% de los requisitos del Consulado de España:</p><ul><li>Sin periodos de carencia</li><li>Sin copagos en todo el territorio nacional</li><li>Repatriación sanitaria incluida</li></ul>",
                activa = true,
                orden = 2,
                creadaEn = dateFormat.format(Date()),
                actualizadaEn = dateFormat.format(Date())
            )
        )
    )
    val promociones: StateFlow<List<PromocionItem>> = _promociones.asStateFlow()

    private val _calculadora = MutableStateFlow(
        listOf(
            CalculadoraTramite(id = "calc-001", nombre = "Inscripción por Ley de Memoria Democrática (LMD)", tiempoResolucion = 180),
            CalculadoraTramite(id = "calc-002", nombre = "Credenciales de Matrimonio Consular", tiempoResolucion = 60),
            CalculadoraTramite(id = "calc-003", nombre = "Expedición de Primer Pasaporte Español", tiempoResolucion = 21),
            CalculadoraTramite(id = "calc-004", nombre = "Visado de Nómada Digital (Ley de Startups)", tiempoResolucion = 45),
            CalculadoraTramite(id = "calc-005", nombre = "Visado de Estudiante y Estancia por Estudios", tiempoResolucion = 30)
        )
    )
    val calculadora: StateFlow<List<CalculadoraTramite>> = _calculadora.asStateFlow()

    private val _categorias = MutableStateFlow(
        listOf(
            CategoriaItem(
                id = "cat-1724500000",
                nombre = "Nacionalidad y Registro Civil",
                color = "#0B3C6D",
                tramites = listOf(
                    TramiteItem(
                        id = "tram-1724500001",
                        titulo = "Inscripción por LMD (Ley de Memoria Democrática)",
                        plazoResolucion = 180,
                        subtramites = listOf(
                            SubtramiteItem(id = "sub-1724500002", nombre = "Revisión preliminar y cotejo de actas apostilladas", tiempo = 15),
                            SubtramiteItem(id = "sub-1724500003", nombre = "Asignación de cita consular y presentación presencial", tiempo = 30),
                            SubtramiteItem(id = "sub-1724500004", nombre = "Calificación por el Encargado del Registro Civil Consular", tiempo = 120),
                            SubtramiteItem(id = "sub-1724500005", nombre = "Expedición de Acta literal de Nacimiento", tiempo = 15)
                        )
                    ),
                    TramiteItem(
                        id = "tram-1724500010",
                        titulo = "Transcripción de Matrimonio Consular",
                        plazoResolucion = 60,
                        subtramites = listOf(
                            SubtramiteItem(id = "sub-1724500011", nombre = "Recepción de expediente y certificado de matrimonio local", tiempo = 10),
                            SubtramiteItem(id = "sub-1724500012", nombre = "Audiencia reservada de los contrayentes", tiempo = 30),
                            SubtramiteItem(id = "sub-1724500013", nombre = "Emisión del Libro de Familia español", tiempo = 20)
                        )
                    )
                )
            ),
            CategoriaItem(
                id = "cat-1724500100",
                nombre = "Visados y Permisos de Residencia",
                color = "#8A1B1B",
                tramites = listOf(
                    TramiteItem(
                        id = "tram-1724500101",
                        titulo = "Visado de Nómada Digital",
                        plazoResolucion = 45,
                        subtramites = listOf(
                            SubtramiteItem(id = "sub-1724500102", nombre = "Acreditación de teletrabajo y solvencia", tiempo = 15),
                            SubtramiteItem(id = "sub-1724500103", nombre = "Validación de antecedentes penales y seguro médico", tiempo = 15),
                            SubtramiteItem(id = "sub-1724500104", nombre = "Estampado de visado consular", tiempo = 15)
                        )
                    )
                )
            )
        )
    )
    val categorias: StateFlow<List<CategoriaItem>> = _categorias.asStateFlow()

    private val _versions = MutableStateFlow<Map<String, List<VersionRecord>>>(
        mapOf(
            "cintillo" to listOf(
                VersionRecord(
                    key = "versions/cintillo/initial.json",
                    timestamp = displayFormat.format(Date(System.currentTimeMillis() - 3600000)),
                    autor = "eblito.lopez@gmail.com",
                    modulo = "cintillo",
                    jsonSummary = "{\"texto\": \"Consulado de España operando con normalidad\", \"color\": \"verde\"}"
                )
            )
        )
    )
    val versions: StateFlow<Map<String, List<VersionRecord>>> = _versions.asStateFlow()

    private val _lastSaveInfo = MutableStateFlow(
        Pair("Cintillo", displayFormat.format(Date()))
    )
    val lastSaveInfo: StateFlow<Pair<String, String>> = _lastSaveInfo.asStateFlow()

    fun updateCintillo(texto: String, color: String): Boolean {
        if (texto.isBlank()) return false
        val prev = _cintillo.value
        archiveVersion("cintillo", "{\"texto\":\"${prev.texto}\",\"color\":\"${prev.color}\"}")
        val now = dateFormat.format(Date())
        _cintillo.value = CintilloData(texto = texto.trim(), color = color, actualizadoEn = now)
        _lastSaveInfo.value = Pair("Cintillo", displayFormat.format(Date()))
        return true
    }

    fun updatePromociones(list: List<PromocionItem>): Boolean {
        val now = dateFormat.format(Date())
        val updated = list.mapIndexed { idx, p ->
            p.copy(orden = idx + 1, actualizadaEn = now)
        }
        archiveVersion("promociones", "${_promociones.value.size} promociones previas")
        _promociones.value = updated
        _lastSaveInfo.value = Pair("Promociones", displayFormat.format(Date()))
        return true
    }

    fun updateCalculadora(list: List<CalculadoraTramite>): Boolean {
        archiveVersion("calculadora", "${_calculadora.value.size} trámites de calculadora previos")
        _calculadora.value = list
        _lastSaveInfo.value = Pair("Calculadora", displayFormat.format(Date()))
        return true
    }

    fun updateCategorias(list: List<CategoriaItem>): Boolean {
        archiveVersion("tramites", "${_categorias.value.size} categorías previas")
        _categorias.value = list
        _lastSaveInfo.value = Pair("Trámites", displayFormat.format(Date()))
        return true
    }

    private fun archiveVersion(modulo: String, summary: String) {
        val currentMap = _versions.value.toMutableMap()
        val list = (currentMap[modulo] ?: emptyList()).toMutableList()
        val newRecord = VersionRecord(
            key = "versions/$modulo/${System.currentTimeMillis()}.json",
            timestamp = displayFormat.format(Date()),
            autor = "eblito.lopez@gmail.com",
            modulo = modulo,
            jsonSummary = summary
        )
        list.add(0, newRecord)
        if (list.size > 20) {
            list.removeLast()
        }
        currentMap[modulo] = list
        _versions.value = currentMap
    }

    fun getStatusInfo(): R2StatusInfo {
        val promos = _promociones.value
        val cats = _categorias.value
        val totalTramites = cats.sumOf { it.tramites.size }
        val (mod, time) = _lastSaveInfo.value

        return R2StatusInfo(
            connected = true,
            bucketName = "destino-espana-data",
            lastSync = displayFormat.format(Date()),
            lastChangeModulo = mod,
            lastChangeTime = time,
            promocionesCount = promos.size,
            promocionesActivas = promos.count { it.activa },
            calculadoraCount = _calculadora.value.size,
            categoriasCount = cats.size,
            tramitesCount = totalTramites
        )
    }
}
