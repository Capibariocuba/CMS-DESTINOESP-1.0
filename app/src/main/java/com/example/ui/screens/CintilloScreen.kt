package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Save
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
import com.example.data.CintilloData
import com.example.ui.theme.*

@Composable
fun CintilloScreen(
    cintillo: CintilloData,
    onSave: (texto: String, color: String) -> Unit
) {
    var textoInput by remember(cintillo.texto) { mutableStateOf(cintillo.texto) }
    var selectedColor by remember(cintillo.color) { mutableStateOf(cintillo.color) }
    var hasError by remember { mutableStateOf(false) }

    val colorOptions = listOf(
        "verde" to Color(0xFF10B981),
        "amarillo" to Color(0xFFF59E0B),
        "rojo" to Color(0xFFEF4444),
        "azul" to Color(0xFF3B82F6),
        "blanco" to Color(0xFFFFFFFF),
        "negro" to Color(0xFF1A202C)
    )

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
                    Text(
                        text = "Módulo 1: Cintillo Informativo",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = NavyPrimary
                    )
                    Text(
                        text = "Barra de avisos móviles para la app pública (/data/cintillo.json)",
                        fontSize = 12.sp,
                        color = TextMuted
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Vista previa en tiempo real
                    Text("VISTA PREVIA EN TIEMPO REAL", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                    Spacer(modifier = Modifier.height(6.dp))
                    
                    Surface(
                        color = NavyPrimary,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            val dotColor = when (selectedColor.lowercase()) {
                                "verde" -> Color(0xFF10B981)
                                "amarillo" -> Color(0xFFF59E0B)
                                "rojo" -> Color(0xFFEF4444)
                                "azul" -> Color(0xFF3B82F6)
                                "blanco" -> Color(0xFFFFFFFF)
                                else -> Color(0xFF94A3B8)
                            }
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(dotColor)
                                    .border(1.dp, Color.White.copy(alpha = 0.4f), CircleShape)
                            )
                            Text(
                                text = if (textoInput.isBlank()) "Escribe el texto del cintillo..." else textoInput,
                                color = Color.White,
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.Medium,
                                maxLines = 2
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Input Form
                    Text("Texto del cintillo *", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = textoInput,
                        onValueChange = {
                            textoInput = it
                            if (it.isNotBlank()) hasError = false
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("cintillo_text_input"),
                        minLines = 3,
                        maxLines = 5,
                        placeholder = { Text("Ej: Consulado operando con normalidad. Citas habilitadas este jueves.") },
                        isError = hasError,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = NavyPrimary,
                            unfocusedBorderColor = CardBorder
                        )
                    )
                    if (hasError) {
                        Text("El texto del cintillo es obligatorio", color = ColorDanger, fontSize = 11.5.sp, modifier = Modifier.padding(top = 4.dp))
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("Color del indicador *", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyPrimary)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        colorOptions.take(3).forEach { (name, col) ->
                            ColorSelectorButton(
                                name = name,
                                color = col,
                                isSelected = selectedColor.equals(name, ignoreCase = true),
                                modifier = Modifier.weight(1f),
                                onClick = { selectedColor = name }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        colorOptions.drop(3).forEach { (name, col) ->
                            ColorSelectorButton(
                                name = name,
                                color = col,
                                isSelected = selectedColor.equals(name, ignoreCase = true),
                                modifier = Modifier.weight(1f),
                                onClick = { selectedColor = name }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (textoInput.isBlank()) {
                                hasError = true
                            } else {
                                onSave(textoInput, selectedColor)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = RedAccent),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("save_cintillo_btn")
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Guardar cambios en Cintillo", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun ColorSelectorButton(
    name: String,
    color: Color,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier
            .height(40.dp)
            .clickable { onClick() },
        color = if (isSelected) NavyLight else BackgroundLight,
        shape = RoundedCornerShape(8.dp),
        border = if (isSelected) {
            androidx.compose.foundation.BorderStroke(2.dp, RedAccent)
        } else {
            androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
        }
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .clip(CircleShape)
                    .background(color)
                    .border(1.dp, Color.Gray.copy(alpha = 0.5f), CircleShape)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = name.replaceFirstChar { it.uppercase() },
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else NavyPrimary
            )
        }
    }
}
