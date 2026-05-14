package com.murocf.gestion.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.murocf.gestion.data.AppDatabase
import com.murocf.gestion.data.MonthlyCalculation
import com.murocf.gestion.data.Player
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AppViewModel(app: Application) : AndroidViewModel(app) {
    private val db = AppDatabase.get(app)
    private val playerDao = db.playerDao()
    private val calcDao = db.calculationDao()

    val players = playerDao.observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val calculations = calcDao.observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    suspend fun getPlayer(id: Long): Player? = withContext(Dispatchers.IO) {
        playerDao.getById(id)
    }

    fun savePlayer(p: Player, onSaved: (Long) -> Unit = {}) {
        viewModelScope.launch {
            val id = if (p.id == 0L) playerDao.insert(p) else {
                playerDao.update(p); p.id
            }
            onSaved(id)
        }
    }

    fun deletePlayer(p: Player) {
        viewModelScope.launch { playerDao.delete(p) }
    }

    fun saveCalculation(c: MonthlyCalculation, onSaved: (Long) -> Unit = {}) {
        viewModelScope.launch {
            val id = calcDao.insert(c)
            onSaved(id)
        }
    }

    fun deleteCalculation(c: MonthlyCalculation) {
        viewModelScope.launch { calcDao.delete(c) }
    }
}
