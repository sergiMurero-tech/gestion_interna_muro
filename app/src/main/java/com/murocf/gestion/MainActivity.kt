package com.murocf.gestion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.murocf.gestion.navigation.AppNavGraph
import com.murocf.gestion.ui.theme.GestionMuroTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GestionMuroTheme {
                AppNavGraph()
            }
        }
    }
}
