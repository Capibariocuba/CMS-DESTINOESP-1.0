package com.example.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.components.DestinoTopBar
import com.example.ui.components.StatusToast
import com.example.ui.screens.*
import com.example.ui.theme.*
import com.example.viewmodel.AdminTab
import com.example.viewmodel.AppMode
import com.example.viewmodel.DestinoViewModel
import kotlinx.coroutines.delay

@Composable
fun DestinoAdminApp(
    viewModel: DestinoViewModel = viewModel()
) {
    val selectedTab by viewModel.selectedTab.collectAsStateWithLifecycle()
    val appMode by viewModel.appMode.collectAsStateWithLifecycle()
    val statusInfo by viewModel.statusInfo.collectAsStateWithLifecycle()
    val cintillo by viewModel.cintillo.collectAsStateWithLifecycle()
    val promociones by viewModel.promociones.collectAsStateWithLifecycle()
    val calculadora by viewModel.calculadora.collectAsStateWithLifecycle()
    val categorias by viewModel.categorias.collectAsStateWithLifecycle()
    val versions by viewModel.versions.collectAsStateWithLifecycle()
    val showVersionDialog by viewModel.showVersionDialog.collectAsStateWithLifecycle()

    var activeToast by remember { mutableStateOf<Pair<String, Boolean>?>(null) }

    LaunchedEffect(Unit) {
        viewModel.toastEvent.collect { event ->
            activeToast = event
            delay(3500)
            activeToast = null
        }
    }

    if (showVersionDialog) {
        VersionHistoryDialog(
            versionsMap = versions,
            onDismiss = { viewModel.closeVersionDialog() }
        )
    }

    Scaffold(
        topBar = {
            DestinoTopBar(
                appMode = appMode,
                onToggleMode = { viewModel.setAppMode(it) },
                onOpenVersions = { viewModel.openVersionDialog() }
            )
        },
        bottomBar = {
            if (appMode == AppMode.ADMIN_CMS) {
                NavigationBar(
                    containerColor = SurfaceWhite,
                    tonalElevation = 8.dp,
                    modifier = Modifier.testTag("admin_bottom_nav")
                ) {
                    AdminTab.values().forEach { tab ->
                        val isSelected = selectedTab == tab
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { viewModel.setTab(tab) },
                            icon = {
                                Icon(
                                    imageVector = when (tab) {
                                        AdminTab.DASHBOARD -> Icons.Default.Dashboard
                                        AdminTab.CINTILLO -> Icons.Default.Campaign
                                        AdminTab.PROMOCIONES -> Icons.Default.Stars
                                        AdminTab.CALCULADORA -> Icons.Default.Calculate
                                        AdminTab.TRAMITES -> Icons.Default.AccountTree
                                        AdminTab.CONFIG -> Icons.Default.Settings
                                    },
                                    contentDescription = tab.title
                                )
                            },
                            label = {
                                Text(
                                    text = tab.title,
                                    fontSize = 10.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = RedAccent,
                                selectedTextColor = RedAccent,
                                unselectedIconColor = TextMuted,
                                unselectedTextColor = TextMuted,
                                indicatorColor = Color(0xFFFEE2E2)
                            )
                        )
                    }
                }
            }
        },
        containerColor = BackgroundLight
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (appMode == AppMode.PUBLIC_SIMULATOR) {
                SimulatorScreen(
                    cintillo = cintillo,
                    promociones = promociones,
                    calculadora = calculadora,
                    categorias = categorias
                )
            } else {
                when (selectedTab) {
                    AdminTab.DASHBOARD -> DashboardScreen(
                        statusInfo = statusInfo,
                        onSync = { viewModel.refreshStatus() },
                        onNavigateToTab = { /* tab */ }
                    )
                    AdminTab.CINTILLO -> CintilloScreen(
                        cintillo = cintillo,
                        onSave = { txt, col -> viewModel.saveCintillo(txt, col) }
                    )
                    AdminTab.PROMOCIONES -> PromocionesScreen(
                        promociones = promociones,
                        onSave = { list -> viewModel.savePromociones(list) }
                    )
                    AdminTab.CALCULADORA -> CalculadoraScreen(
                        tramites = calculadora,
                        onSave = { list -> viewModel.saveCalculadora(list) }
                    )
                    AdminTab.TRAMITES -> TramitesScreen(
                        categorias = categorias,
                        onSave = { list -> viewModel.saveCategorias(list) }
                    )
                    AdminTab.CONFIG -> ConfigScreen()
                }
            }

            // Toast Overlay
            AnimatedVisibility(
                visible = activeToast != null,
                enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
                modifier = Modifier.align(Alignment.TopCenter)
            ) {
                activeToast?.let { (msg, isOk) ->
                    StatusToast(message = msg, isSuccess = isOk)
                }
            }
        }
    }
}
