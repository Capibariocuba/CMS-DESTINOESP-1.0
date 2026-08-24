package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.CalculadoraTramite
import com.example.data.CategoriaItem
import com.example.data.CintilloData
import com.example.data.PromocionItem
import com.example.ui.theme.*

@Composable
fun SimulatorScreen(
    cintillo: CintilloData,
    promociones: List<PromocionItem>,
    calculadora: List<CalculadoraTramite>,
    categorias: List<CategoriaItem>
) {
    var selectedPopupPromo by remember { mutableStateOf<PromocionItem?>(null) }
    var selectedCalcTramite by remember { mutableStateOf<CalculadoraTramite?>(null) }

    if (selectedPopupPromo != null) {
        AlertDialog(
            onDismissRequest = { selectedPopupPromo = null },
            title = { Text(selectedPopupPromo!!.titulo, fontWeight = FontWeight.Bold, color = NavyPrimary) },
            text = {
                Text(
                    text = selectedPopupPromo!!.contenido.replace(Regex("<[^>]*>"), " ").trim(),
                    fontSize = 13.sp,
                    color = TextMain
                )
            },
            confirmButton = {
                Button(
                    onClick = { selectedPopupPromo = null },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                ) {
                    Text("Entendido")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight),
        contentPadding = PaddingValues(bottom = 90.dp)
    ) {
        // Banner Simulador Mode
        item {
            Surface(
                color = SpanishGold,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "📱 Simulador en Vivo: Vista de la App Pública (Lectura desde R2)",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )
                }
            }
        }

        // Cintillo móvil en vivo
        item {
            val dotColor = when (cintillo.color.lowercase()) {
                "verde" -> Color(0xFF10B981)
                "amarillo" -> Color(0xFFF59E0B)
                "rojo" -> Color(0xFFEF4444)
                "azul" -> Color(0xFF3B82F6)
                "blanco" -> Color(0xFFFFFFFF)
                else -> Color(0xFF94A3B8)
            }

            Surface(
                color = NavyPrimary,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(9.dp)
                            .clip(CircleShape)
                            .background(dotColor)
                            .border(1.dp, Color.White.copy(alpha = 0.5f), CircleShape)
                    )
                    Text(
                        text = cintillo.texto.ifBlank { "Sin avisos consulares en este momento." },
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Carrusel de Promociones
        item {
            val activePromos = promociones.filter { it.activa }
            if (activePromos.isNotEmpty()) {
                Column(modifier = Modifier.padding(top = 14.dp)) {
                    Text(
                        text = "Servicios y Novedades",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = NavyPrimary,
                        modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 8.dp)
                    )

                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(activePromos) { promo ->
                            val bgColor = try {
                                Color(android.graphics.Color.parseColor(promo.colorFondo))
                            } catch (e: Exception) {
                                NavyLight
                            }
                            val txtColor = try {
                                Color(android.graphics.Color.parseColor(promo.colorTexto))
                            } catch (e: Exception) {
                                Color.White
                            }

                            Card(
                                colors = CardDefaults.cardColors(containerColor = bgColor),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .width(260.dp)
                                    .clickable { selectedPopupPromo = promo }
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        text = promo.titulo,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = txtColor,
                                        maxLines = 2
                                    )
                                    if (promo.subtitulo.isNotBlank()) {
                                        Text(
                                            text = promo.subtitulo,
                                            fontSize = 11.5.sp,
                                            color = txtColor.copy(alpha = 0.85f),
                                            maxLines = 2,
                                            modifier = Modifier.padding(top = 4.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Surface(
                                        color = RedAccent,
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = promo.textoBoton,
                                            color = Color.White,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Calculadora de Tiempos
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
                Text(
                    text = "Calculadora de Tiempos Consulares",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = NavyPrimary,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    shape = RoundedCornerShape(12.dp),
                    border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Selecciona tu trámite para consultar el tiempo estimado:", fontSize = 12.5.sp, color = TextMuted)
                        Spacer(modifier = Modifier.height(10.dp))

                        calculadora.forEach { t ->
                            Surface(
                                color = if (selectedCalcTramite?.id == t.id) BackgroundLight else SurfaceWhite,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedCalcTramite = t }
                                    .padding(vertical = 2.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(t.nombre, fontSize = 12.5.sp, fontWeight = FontWeight.Medium, color = NavyPrimary, modifier = Modifier.weight(1f))
                                    Surface(
                                        color = NavyPrimary,
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Text(
                                            text = "~${t.tiempoResolucion} días",
                                            color = Color.White,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Explorador de Categorías
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "Guía Completa de Trámites",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = NavyPrimary,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                categorias.forEach { cat ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp),
                        border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(cat.nombre, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = NavyPrimary)
                            Spacer(modifier = Modifier.height(6.dp))

                            cat.tramites.forEach { tram ->
                                Surface(
                                    color = BackgroundLight,
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 3.dp)
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(tram.titulo, fontSize = 12.5.sp, fontWeight = FontWeight.SemiBold, color = NavyPrimary, modifier = Modifier.weight(1f))
                                            Text("${tram.plazoResolucion} días", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                        }

                                        if (tram.subtramites.isNotEmpty()) {
                                            Spacer(modifier = Modifier.height(4.dp))
                                            tram.subtramites.forEach { sub ->
                                                Text("• ${sub.nombre} (${sub.tiempo}d)", fontSize = 11.sp, color = TextMuted)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
