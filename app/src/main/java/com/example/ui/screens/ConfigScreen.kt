package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun ConfigScreen() {
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
                    Text("Configuración de Acceso", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Text("Autenticación y perfil de administrador", fontSize = 12.sp, color = TextMuted)

                    Spacer(modifier = Modifier.height(14.dp))

                    Surface(
                        color = BackgroundLight,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(RedAccent),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("E", color = Color.White, fontWeight = FontWeight.Bold)
                            }

                            Column {
                                Text("Administrador Autorizado", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                                Text("eblito.lopez@gmail.com", fontSize = 12.sp, color = TextMuted)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = ColorSuccess, modifier = Modifier.size(16.dp))
                        Text("Acceso exclusivo verificado por Cloudflare Worker JWT", fontSize = 11.5.sp, color = TextMuted)
                    }
                }
            }
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Arquitectura de Almacenamiento", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Text("Rutas JSON en Cloudflare R2", fontSize = 12.sp, color = TextMuted)

                    Spacer(modifier = Modifier.height(12.dp))

                    val endpoints = listOf(
                        "Cintillo" to "/data/cintillo.json",
                        "Promociones" to "/data/promociones.json",
                        "Calculadora" to "/data/calculadora-tramites.json",
                        "Trámites" to "/data/tramites.json",
                        "Histórico" to "/versions/{modulo}/{timestamp}.json"
                    )

                    endpoints.forEach { (name, path) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(name, fontSize = 12.5.sp, fontWeight = FontWeight.Medium, color = NavyPrimary)
                            Surface(
                                color = BackgroundLight,
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = path,
                                    fontSize = 11.sp,
                                    color = TextMuted,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
