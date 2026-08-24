package com.example.data

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CintilloData(
    val texto: String = "",
    val color: String = "verde", // verde, amarillo, rojo, azul, blanco, negro
    val actualizadoEn: String = ""
)

@JsonClass(generateAdapter = true)
data class PromocionItem(
    val id: String,
    val titulo: String,
    val subtitulo: String = "",
    val textoBoton: String,
    val colorFondo: String, // hex
    val colorTexto: String, // hex
    val contenido: String, // HTML
    val activa: Boolean = true,
    val orden: Int = 1,
    val creadaEn: String = "",
    val actualizadaEn: String = ""
)

@JsonClass(generateAdapter = true)
data class PromocionesData(
    val promociones: List<PromocionItem> = emptyList()
)

@JsonClass(generateAdapter = true)
data class CalculadoraTramite(
    val id: String,
    val nombre: String,
    val tiempoResolucion: Int // días
)

@JsonClass(generateAdapter = true)
data class CalculadoraData(
    val tramites: List<CalculadoraTramite> = emptyList()
)

@JsonClass(generateAdapter = true)
data class SubtramiteItem(
    val id: String,
    val nombre: String,
    val tiempo: Int // días
)

@JsonClass(generateAdapter = true)
data class TramiteItem(
    val id: String,
    val titulo: String,
    val plazoResolucion: Int, // días
    val subtramites: List<SubtramiteItem> = emptyList()
)

@JsonClass(generateAdapter = true)
data class CategoriaItem(
    val id: String,
    val nombre: String,
    val color: String, // hex
    val tramites: List<TramiteItem> = emptyList()
)

@JsonClass(generateAdapter = true)
data class TramitesData(
    val categorias: List<CategoriaItem> = emptyList()
)

data class VersionRecord(
    val key: String,
    val timestamp: String,
    val autor: String,
    val modulo: String,
    val jsonSummary: String
)

data class R2StatusInfo(
    val connected: Boolean = true,
    val bucketName: String = "destino-espana-data",
    val lastSync: String = "",
    val lastChangeModulo: String = "Cintillo",
    val lastChangeTime: String = "",
    val promocionesCount: Int = 0,
    val promocionesActivas: Int = 0,
    val calculadoraCount: Int = 0,
    val categoriasCount: Int = 0,
    val tramitesCount: Int = 0
)
