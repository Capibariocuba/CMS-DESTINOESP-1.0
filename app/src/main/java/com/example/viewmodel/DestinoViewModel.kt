package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.CalculadoraTramite
import com.example.data.CategoriaItem
import com.example.data.CintilloData
import com.example.data.DestinoRepository
import com.example.data.PromocionItem
import com.example.data.R2StatusInfo
import com.example.data.SubtramiteItem
import com.example.data.TramiteItem
import com.example.data.VersionRecord
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AdminTab(val title: String, val iconName: String) {
    DASHBOARD("Dashboard", "dashboard"),
    CINTILLO("Cintillo", "campaign"),
    PROMOCIONES("Promociones", "stars"),
    CALCULADORA("Calculadora", "calculate"),
    TRAMITES("Trámites", "account_tree"),
    CONFIG("Config", "settings")
}

enum class AppMode {
    ADMIN_CMS,
    PUBLIC_SIMULATOR
}

class DestinoViewModel(
    private val repository: DestinoRepository = DestinoRepository()
) : ViewModel() {

    val cintillo: StateFlow<CintilloData> = repository.cintillo
    val promociones: StateFlow<List<PromocionItem>> = repository.promociones
    val calculadora: StateFlow<List<CalculadoraTramite>> = repository.calculadora
    val categorias: StateFlow<List<CategoriaItem>> = repository.categorias
    val versions: StateFlow<Map<String, List<VersionRecord>>> = repository.versions

    private val _selectedTab = MutableStateFlow(AdminTab.DASHBOARD)
    val selectedTab: StateFlow<AdminTab> = _selectedTab.asStateFlow()

    private val _appMode = MutableStateFlow(AppMode.ADMIN_CMS)
    val appMode: StateFlow<AppMode> = _appMode.asStateFlow()

    private val _statusInfo = MutableStateFlow(repository.getStatusInfo())
    val statusInfo: StateFlow<R2StatusInfo> = _statusInfo.asStateFlow()

    private val _toastEvent = MutableSharedFlow<Pair<String, Boolean>>() // message, isSuccess
    val toastEvent: SharedFlow<Pair<String, Boolean>> = _toastEvent.asSharedFlow()

    private val _showVersionDialog = MutableStateFlow(false)
    val showVersionDialog: StateFlow<Boolean> = _showVersionDialog.asStateFlow()

    fun setTab(tab: AdminTab) {
        _selectedTab.value = tab
    }

    fun setAppMode(mode: AppMode) {
        _appMode.value = mode
    }

    fun openVersionDialog() {
        _showVersionDialog.value = true
    }

    fun closeVersionDialog() {
        _showVersionDialog.value = false
    }

    fun refreshStatus() {
        _statusInfo.value = repository.getStatusInfo()
        emitToast("Datos sincronizados con Cloudflare R2", true)
    }

    fun saveCintillo(texto: String, color: String) {
        val ok = repository.updateCintillo(texto, color)
        if (ok) {
            _statusInfo.value = repository.getStatusInfo()
            emitToast("✓ Cintillo guardado correctamente en R2", true)
        } else {
            emitToast("⚠ Error: El texto del cintillo es obligatorio", false)
        }
    }

    fun savePromociones(list: List<PromocionItem>) {
        repository.updatePromociones(list)
        _statusInfo.value = repository.getStatusInfo()
        emitToast("✓ Promociones guardadas correctamente en R2", true)
    }

    fun saveCalculadora(list: List<CalculadoraTramite>) {
        repository.updateCalculadora(list)
        _statusInfo.value = repository.getStatusInfo()
        emitToast("✓ Calculadora guardada correctamente en R2", true)
    }

    fun saveCategorias(list: List<CategoriaItem>) {
        repository.updateCategorias(list)
        _statusInfo.value = repository.getStatusInfo()
        emitToast("✓ Trámites guardados correctamente en R2", true)
    }

    private fun emitToast(msg: String, isSuccess: Boolean) {
        viewModelScope.launch {
            _toastEvent.emit(Pair(msg, isSuccess))
        }
    }
}
