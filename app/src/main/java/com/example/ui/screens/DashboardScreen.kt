package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.R2StatusInfo
import com.example.ui.theme.*

@Composable
fun DashboardScreen(
    statusInfo: R2StatusInfo,
    onSync: () -> Unit,
    onNavigateToTab: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 90.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Estado de Cloudflare R2",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = NavyPrimary
                            )
                            Text(
                                text = "Almacenamiento de objetos JSON",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        }

                        Surface(
                            color = if (statusInfo.connected) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(if (statusInfo.connected) ColorSuccess else ColorDanger)
                                )
                                Text(
                                    text = if (statusInfo.connected) "Conectado" else "Desconectado",
                                    color = if (statusInfo.connected) Color(0xFF166534) else Color(0xFF991B1B),
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(BackgroundLight, RoundedCornerShape(8.dp))
                                .border(1.dp, CardBorder, RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Text("BUCKET PRINCIPAL", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                            Text(statusInfo.bucketName, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                        }

                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(BackgroundLight, RoundedCornerShape(8.dp))
                                .border(1.dp, CardBorder, RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Text("ÚLTIMA SYNC", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                            Text(statusInfo.lastSync, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Surface(
                        color = Color(0xFFEEF2F6),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Último cambio: ${statusInfo.lastChangeModulo} (${statusInfo.lastChangeTime})",
                            modifier = Modifier.padding(10.dp),
                            fontSize = 12.sp,
                            color = NavyPrimary,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = onSync,
                        colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("dashboard_sync_btn")
                    ) {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Sincronizar / Recargar datos", fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        item {
            Text(
                text = "Resumen de Módulos Activos",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = NavyPrimary
            )
        }

        item {
            StatRowCard(
                title = "Promociones",
                subtitle = "Banners interactivos en carrusel",
                badgeText = "${statusInfo.promocionesActivas} activas / ${statusInfo.promocionesCount} total",
                badgeBg = Color(0xFFE0E7FF),
                badgeColor = Color(0xFF3730A3),
                icon = Icons.Default.Stars
            )
        }

        item {
            StatRowCard(
                title = "Calculadora de Trámites",
                subtitle = "Tiempos de resolución estimados",
                badgeText = "${statusInfo.calculadoraCount} trámites",
                badgeBg = Color(0xFFFEF3C7),
                badgeColor = Color(0xFF92400E),
                icon = Icons.Default.Calculate
            )
        }

        item {
            StatRowCard(
                title = "Categorías y Trámites",
                subtitle = "Estructura jerárquica con subtrámites",
                badgeText = "${statusInfo.categoriasCount} cat / ${statusInfo.tramitesCount} trámites",
                badgeBg = Color(0xFFDCFCE7),
                badgeColor = Color(0xFF166534),
                icon = Icons.Default.AccountTree
            )
        }
    }
}

@Composable
private fun StatRowCard(
    title: String,
    subtitle: String,
    badgeText: String,
    badgeBg: Color,
    badgeColor: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        shape = RoundedCornerShape(10.dp),
        border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(BackgroundLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = NavyPrimary, modifier = Modifier.size(20.dp))
                }

                Column {
                    Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = NavyPrimary)
                    Text(subtitle, fontSize = 12.sp, color = TextMuted)
                }
            }

            Surface(
                color = badgeBg,
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(
                    text = badgeText,
                    color = badgeColor,
                    fontSize = 11.5.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}
