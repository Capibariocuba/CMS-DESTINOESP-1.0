package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PromocionItem
import com.example.ui.theme.*

@Composable
fun PromocionesScreen(
    promociones: List<PromocionItem>,
    onSave: (List<PromocionItem>) -> Unit
) {
    var promoList by remember(promociones) { mutableStateOf(promociones) }
    var editingPromo by remember { mutableStateOf<PromocionItem?>(null) }
    var previewPopupPromo by remember { mutableStateOf<PromocionItem?>(null) }

    if (editingPromo != null) {
        PromoEditorDialog(
            promo = editingPromo!!,
            onDismiss = { editingPromo = null },
            onSavePromo = { updated ->
                val index = promoList.indexOfFirst { it.id == updated.id }
                promoList = if (index >= 0) {
                    promoList.toMutableList().apply { set(index, updated) }
                } else {
                    promoList + updated
                }
                editingPromo = null
            }
        )
    }

    if (previewPopupPromo != null) {
        AlertDialog(
            onDismissRequest = { previewPopupPromo = null },
            title = { Text(previewPopupPromo!!.titulo, fontWeight = FontWeight.Bold, color = NavyPrimary) },
            text = {
                Text(
                    text = previewPopupPromo!!.contenido.replace(Regex("<[^>]*>"), " ").trim(),
                    fontSize = 13.5.sp,
                    color = TextMain
                )
            },
            confirmButton = {
                TextButton(onClick = { previewPopupPromo = null }) {
                    Text("Cerrar", color = NavyPrimary, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 90.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Módulo 2: Promociones", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Text("Banners en carrusel y popups", fontSize = 12.sp, color = TextMuted)
                }

                Button(
                    onClick = {
                        editingPromo = PromocionItem(
                            id = "promo-${System.currentTimeMillis()}",
                            titulo = "Nueva Promoción",
                            subtitulo = "Subtítulo descriptivo",
                            textoBoton = "Saber más",
                            colorFondo = "#004481",
                            colorTexto = "#FFFFFF",
                            contenido = "<h2>Título del Popup</h2><p>Describe el servicio aquí.</p>",
                            activa = true,
                            orden = promoList.size + 1
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("+ Nueva", fontSize = 12.5.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(promoList, key = { _, item -> item.id }) { index, item ->
            PromoCardItem(
                item = item,
                index = index,
                totalCount = promoList.size,
                onEdit = { editingPromo = item },
                onPreviewPopup = { previewPopupPromo = item },
                onToggleActive = {
                    promoList = promoList.mapIndexed { idx, p ->
                        if (idx == index) p.copy(activa = !p.activa) else p
                    }
                },
                onMoveUp = {
                    if (index > 0) {
                        val list = promoList.toMutableList()
                        val temp = list[index]
                        list[index] = list[index - 1]
                        list[index - 1] = temp
                        promoList = list
                    }
                },
                onMoveDown = {
                    if (index < promoList.size - 1) {
                        val list = promoList.toMutableList()
                        val temp = list[index]
                        list[index] = list[index + 1]
                        list[index + 1] = temp
                        promoList = list
                    }
                },
                onDelete = {
                    promoList = promoList.filterIndexed { idx, _ -> idx != index }
                }
            )
        }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = { onSave(promoList) },
                colors = ButtonDefaults.buttonColors(containerColor = RedAccent),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("save_promociones_btn")
            ) {
                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Guardar cambios en Promociones", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun PromoCardItem(
    item: PromocionItem,
    index: Int,
    totalCount: Int,
    onEdit: () -> Unit,
    onPreviewPopup: () -> Unit,
    onToggleActive: () -> Unit,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        shape = RoundedCornerShape(10.dp),
        border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Surface(color = BackgroundLight, shape = RoundedCornerShape(4.dp)) {
                            Text("#${index + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted, modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp))
                        }
                        Text(item.titulo, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = NavyPrimary)
                    }
                    if (item.subtitulo.isNotBlank()) {
                        Text(item.subtitulo, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(top = 2.dp))
                    }
                    Row(
                        modifier = Modifier.padding(top = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            color = if (item.activa) Color(0xFFDCFCE7) else BackgroundLight,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.clickable { onToggleActive() }
                        ) {
                            Text(
                                text = if (item.activa) "● Activa" else "○ Inactiva",
                                color = if (item.activa) Color(0xFF166534) else TextMuted,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        Text("Botón: \"${item.textoBoton}\"", fontSize = 11.5.sp, color = TextMuted)
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    IconButton(onClick = onMoveUp, enabled = index > 0, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.ArrowUpward, contentDescription = "Subir", modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onMoveDown, enabled = index < totalCount - 1, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.ArrowDownward, contentDescription = "Bajar", modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Divider(color = CardBorder)
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onEdit,
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.weight(1f).height(36.dp)
                ) {
                    Text("Editar", fontSize = 12.sp, color = NavyPrimary)
                }

                OutlinedButton(
                    onClick = onPreviewPopup,
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text("Popup", fontSize = 12.sp, color = NavyPrimary)
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = ColorDanger, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
private fun PromoEditorDialog(
    promo: PromocionItem,
    onDismiss: () -> Unit,
    onSavePromo: (PromocionItem) -> Unit
) {
    var titulo by remember { mutableStateOf(promo.titulo) }
    var subtitulo by remember { mutableStateOf(promo.subtitulo) }
    var textoBoton by remember { mutableStateOf(promo.textoBoton) }
    var contenido by remember { mutableStateOf(promo.contenido) }
    var activa by remember { mutableStateOf(promo.activa) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar Promoción", fontWeight = FontWeight.Bold, color = NavyPrimary) },
        text = {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    Text("Título *", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    OutlinedTextField(
                        value = titulo,
                        onValueChange = { titulo = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                item {
                    Text("Subtítulo", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    OutlinedTextField(
                        value = subtitulo,
                        onValueChange = { subtitulo = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                item {
                    Text("Texto del botón *", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    OutlinedTextField(
                        value = textoBoton,
                        onValueChange = { textoBoton = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                item {
                    Text("Contenido HTML del Popup", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    OutlinedTextField(
                        value = contenido,
                        onValueChange = { contenido = it },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                }
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Promoción Activa", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        Switch(checked = activa, onCheckedChange = { activa = it })
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (titulo.isNotBlank() && textoBoton.isNotBlank()) {
                        onSavePromo(
                            promo.copy(
                                titulo = titulo.trim(),
                                subtitulo = subtitulo.trim(),
                                textoBoton = textoBoton.trim(),
                                contenido = contenido,
                                activa = activa
                            )
                        )
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
            ) {
                Text("Aplicar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
