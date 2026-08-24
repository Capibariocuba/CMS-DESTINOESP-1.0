package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Restore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.VersionRecord
import com.example.ui.theme.*

@Composable
fun VersionHistoryDialog(
    versionsMap: Map<String, List<VersionRecord>>,
    onDismiss: () -> Unit
) {
    var selectedModule by remember { mutableStateOf("cintillo") }
    val currentVersions = versionsMap[selectedModule] ?: emptyList()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.History, contentDescription = null, tint = NavyPrimary)
                Text("Historial de Versiones R2", fontWeight = FontWeight.Bold, color = NavyPrimary, fontSize = 16.sp)
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Tab switcher
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    listOf("cintillo", "promociones", "calculadora", "tramites").forEach { mod ->
                        FilterChip(
                            selected = selectedModule == mod,
                            onClick = { selectedModule = mod },
                            label = { Text(mod.replaceFirstChar { it.uppercase() }, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = NavyPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                if (currentVersions.isEmpty()) {
                    Text(
                        "No hay versiones archivadas en /versions/$selectedModule/ todavía. Se generan al guardar.",
                        fontSize = 12.sp,
                        color = TextMuted,
                        modifier = Modifier.padding(16.dp)
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier.heightIn(max = 350.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(currentVersions) { ver ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = BackgroundLight),
                                shape = RoundedCornerShape(8.dp),
                                border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(ver.timestamp, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = NavyPrimary)
                                        Text(ver.autor.split("@")[0], fontSize = 11.sp, color = TextMuted)
                                    }

                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = ver.jsonSummary,
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = TextMuted,
                                        maxLines = 2
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cerrar", fontWeight = FontWeight.Bold, color = NavyPrimary)
            }
        }
    )
}
