package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.CategoriaItem
import com.example.data.SubtramiteItem
import com.example.data.TramiteItem
import com.example.ui.theme.*

@Composable
fun TramitesScreen(
    categorias: List<CategoriaItem>,
    onSave: (List<CategoriaItem>) -> Unit
) {
    var catList by remember(categorias) { mutableStateOf(categorias) }
    var confirmDeleteCatIndex by remember { mutableStateOf<Int?>(null) }

    if (confirmDeleteCatIndex != null) {
        val cat = catList[confirmDeleteCatIndex!!]
        AlertDialog(
            onDismissRequest = { confirmDeleteCatIndex = null },
            title = { Text("¿Eliminar Categoría?", fontWeight = FontWeight.Bold, color = ColorDanger) },
            text = { Text("Se eliminará \"${cat.nombre}\" junto con todos sus trámites y subtrámites asociados.") },
            confirmButton = {
                Button(
                    onClick = {
                        catList = catList.filterIndexed { idx, _ -> idx != confirmDeleteCatIndex }
                        confirmDeleteCatIndex = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ColorDanger)
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { confirmDeleteCatIndex = null }) {
                    Text("Cancelar")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 90.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Módulos 4 & 5: Trámites", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Text("Estructura: Categoría → Trámite → Fases", fontSize = 12.sp, color = TextMuted)
                }

                Button(
                    onClick = {
                        catList = catList + CategoriaItem(
                            id = "cat-${System.currentTimeMillis()}",
                            nombre = "Nueva Categoría",
                            color = "#0B3C6D",
                            tramites = emptyList()
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("+ Categoría", fontSize = 12.5.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(catList, key = { _, cat -> cat.id }) { catIdx, cat ->
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // Header Categoría
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = cat.nombre,
                            onValueChange = { newName ->
                                catList = catList.mapIndexed { idx, c ->
                                    if (idx == catIdx) c.copy(nombre = newName) else c
                                }
                            },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = LocalTextStyle.current.copy(fontWeight = FontWeight.Bold, color = NavyPrimary),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NavyPrimary,
                                unfocusedBorderColor = CardBorder
                            )
                        )

                        IconButton(
                            onClick = { confirmDeleteCatIndex = catIdx },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Eliminar Categoría", tint = ColorDanger, modifier = Modifier.size(20.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Trámites list
                    cat.tramites.forEachIndexed { tramIdx, tram ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = BackgroundLight),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    OutlinedTextField(
                                        value = tram.titulo,
                                        onValueChange = { newTit ->
                                            catList = updateTramite(catList, catIdx, tramIdx) { it.copy(titulo = newTit) }
                                        },
                                        modifier = Modifier.weight(1f),
                                        singleLine = true,
                                        placeholder = { Text("Título del trámite") }
                                    )

                                    IconButton(
                                        onClick = {
                                            catList = catList.mapIndexed { cIdx, c ->
                                                if (cIdx == catIdx) {
                                                    c.copy(tramites = c.tramites.filterIndexed { tIdx, _ -> tIdx != tramIdx })
                                                } else c
                                            }
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.Close, contentDescription = "Eliminar Trámite", tint = ColorDanger, modifier = Modifier.size(16.dp))
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Plazo general estimado:", fontSize = 11.5.sp, color = TextMuted)
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        OutlinedTextField(
                                            value = tram.plazoResolucion.toString(),
                                            onValueChange = { days ->
                                                val parsed = days.toIntOrNull() ?: 0
                                                catList = updateTramite(catList, catIdx, tramIdx) { it.copy(plazoResolucion = parsed) }
                                            },
                                            modifier = Modifier.width(65.dp),
                                            singleLine = true,
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("días", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Subtrámites list
                                Surface(
                                    color = SurfaceWhite,
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text("Fases y Subtrámites", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                                            TextButton(
                                                onClick = {
                                                    catList = updateTramite(catList, catIdx, tramIdx) { t ->
                                                        t.copy(subtramites = t.subtramites + SubtramiteItem(id = "sub-${System.currentTimeMillis()}", nombre = "Nueva fase", tiempo = 10))
                                                    }
                                                },
                                                contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                                            ) {
                                                Text("+ Añadir Fase", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                                            }
                                        }

                                        tram.subtramites.forEachIndexed { subIdx, sub ->
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(vertical = 2.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                Text("${subIdx + 1}.", fontSize = 10.sp, color = TextMuted)
                                                OutlinedTextField(
                                                    value = sub.nombre,
                                                    onValueChange = { newSubName ->
                                                        catList = updateSubtramite(catList, catIdx, tramIdx, subIdx) { it.copy(nombre = newSubName) }
                                                    },
                                                    modifier = Modifier.weight(1f),
                                                    singleLine = true,
                                                    placeholder = { Text("Fase") }
                                                )
                                                OutlinedTextField(
                                                    value = sub.tiempo.toString(),
                                                    onValueChange = { newDays ->
                                                        val p = newDays.toIntOrNull() ?: 0
                                                        catList = updateSubtramite(catList, catIdx, tramIdx, subIdx) { it.copy(tiempo = p) }
                                                    },
                                                    modifier = Modifier.width(55.dp),
                                                    singleLine = true,
                                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                                                )
                                                IconButton(
                                                    onClick = {
                                                        catList = updateTramite(catList, catIdx, tramIdx) { t ->
                                                            t.copy(subtramites = t.subtramites.filterIndexed { sIdx, _ -> sIdx != subIdx })
                                                        }
                                                    },
                                                    modifier = Modifier.size(26.dp)
                                                ) {
                                                    Icon(Icons.Default.Delete, contentDescription = null, tint = ColorDanger, modifier = Modifier.size(14.dp))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedButton(
                        onClick = {
                            catList = catList.mapIndexed { cIdx, c ->
                                if (cIdx == catIdx) {
                                    c.copy(
                                        tramites = c.tramites + TramiteItem(
                                            id = "tram-${System.currentTimeMillis()}",
                                            titulo = "Nuevo Trámite",
                                            plazoResolucion = 30,
                                            subtramites = emptyList()
                                        )
                                    )
                                } else c
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("+ Añadir Trámite a ${cat.nombre}", fontSize = 12.sp, color = NavyPrimary)
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = { onSave(catList) },
                colors = ButtonDefaults.buttonColors(containerColor = RedAccent),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("save_tramites_btn")
            ) {
                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Guardar cambios en Trámites", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

private fun updateTramite(
    list: List<CategoriaItem>,
    catIdx: Int,
    tramIdx: Int,
    updater: (TramiteItem) -> TramiteItem
): List<CategoriaItem> {
    return list.mapIndexed { cIdx, cat ->
        if (cIdx == catIdx) {
            cat.copy(tramites = cat.tramites.mapIndexed { tIdx, tram ->
                if (tIdx == tramIdx) updater(tram) else tram
            })
        } else cat
    }
}

private fun updateSubtramite(
    list: List<CategoriaItem>,
    catIdx: Int,
    tramIdx: Int,
    subIdx: Int,
    updater: (SubtramiteItem) -> SubtramiteItem
): List<CategoriaItem> {
    return updateTramite(list, catIdx, tramIdx) { tram ->
        tram.copy(subtramites = tram.subtramites.mapIndexed { sIdx, sub ->
            if (sIdx == subIdx) updater(sub) else sub
        })
    }
}
