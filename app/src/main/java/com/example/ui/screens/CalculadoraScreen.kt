package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Save
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
import com.example.data.CalculadoraTramite
import com.example.ui.theme.*

@Composable
fun CalculadoraScreen(
    tramites: List<CalculadoraTramite>,
    onSave: (List<CalculadoraTramite>) -> Unit
) {
    var itemList by remember(tramites) { mutableStateOf(tramites) }

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
                    Text("Módulo 3: Calculadora", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Text("Tiempos de resolución estimados (en días)", fontSize = 12.sp, color = TextMuted)
                }

                Button(
                    onClick = {
                        itemList = itemList + CalculadoraTramite(
                            id = "calc-${System.currentTimeMillis()}",
                            nombre = "Nuevo Trámite",
                            tiempoResolucion = 30
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("+ Añadir", fontSize = 12.5.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        itemsIndexed(itemList, key = { _, item -> item.id }) { index, item ->
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                shape = RoundedCornerShape(10.dp),
                border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(color = BackgroundLight, shape = RoundedCornerShape(4.dp)) {
                            Text("#${index + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted, modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp))
                        }

                        OutlinedTextField(
                            value = item.nombre,
                            onValueChange = { newName ->
                                itemList = itemList.mapIndexed { idx, t ->
                                    if (idx == index) t.copy(nombre = newName) else t
                                }
                            },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            placeholder = { Text("Nombre del trámite") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NavyPrimary,
                                unfocusedBorderColor = CardBorder
                            )
                        )

                        IconButton(
                            onClick = {
                                itemList = itemList.filterIndexed { idx, _ -> idx != index }
                            },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = ColorDanger, modifier = Modifier.size(18.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Tiempo estimado:", fontSize = 12.sp, color = TextMuted)
                        Spacer(modifier = Modifier.width(6.dp))
                        OutlinedTextField(
                            value = item.tiempoResolucion.toString(),
                            onValueChange = { newDays ->
                                val parsed = newDays.toIntOrNull() ?: 0
                                itemList = itemList.mapIndexed { idx, t ->
                                    if (idx == index) t.copy(tiempoResolucion = parsed) else t
                                }
                            },
                            modifier = Modifier.width(80.dp),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NavyPrimary,
                                unfocusedBorderColor = CardBorder
                            )
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("días", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = { onSave(itemList) },
                colors = ButtonDefaults.buttonColors(containerColor = RedAccent),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("save_calculadora_btn")
            ) {
                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Guardar cambios en Calculadora", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
