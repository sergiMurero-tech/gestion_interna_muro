package com.murocf.gestion.ui.components

import android.graphics.Bitmap
import android.graphics.Canvas as AndroidCanvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.Path as AndroidPath
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp

class SignatureState {
    val strokes = mutableStateListOf<MutableList<Offset>>()
    val canvasSize = mutableStateOf(Pair(0, 0))

    fun clear() {
        strokes.clear()
    }

    fun isEmpty(): Boolean = strokes.all { it.size < 2 }

    fun toBitmap(width: Int = 1000, height: Int = 300): Bitmap? {
        if (isEmpty()) return null
        val (cw, ch) = canvasSize.value
        if (cw == 0 || ch == 0) return null
        val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = AndroidCanvas(bmp)
        canvas.drawColor(AndroidColor.TRANSPARENT)
        val paint = Paint().apply {
            color = AndroidColor.BLACK
            isAntiAlias = true
            style = Paint.Style.STROKE
            strokeWidth = 4f
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        }
        val sx = width.toFloat() / cw.toFloat()
        val sy = height.toFloat() / ch.toFloat()
        for (stroke in strokes) {
            if (stroke.size < 2) continue
            val path = AndroidPath()
            path.moveTo(stroke[0].x * sx, stroke[0].y * sy)
            for (i in 1 until stroke.size) {
                path.lineTo(stroke[i].x * sx, stroke[i].y * sy)
            }
            canvas.drawPath(path, paint)
        }
        return bmp
    }
}

@Composable
fun rememberSignatureState(): SignatureState = remember { SignatureState() }

@Composable
fun SignaturePad(
    state: SignatureState,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(Color.White)
                .border(1.dp, Color.Gray)
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            state.strokes.add(mutableListOf(offset))
                        },
                        onDrag = { change, _ ->
                            val current = state.strokes.lastOrNull() ?: return@detectDragGestures
                            current.add(change.position)
                            state.strokes[state.strokes.size - 1] = current.toMutableList()
                            change.consume()
                        }
                    )
                }
        ) {
            state.canvasSize.value = Pair(size.width.toInt(), size.height.toInt())
            for (stroke in state.strokes) {
                if (stroke.size < 2) continue
                val path = Path()
                path.moveTo(stroke[0].x, stroke[0].y)
                for (i in 1 until stroke.size) {
                    path.lineTo(stroke[i].x, stroke[i].y)
                }
                drawPath(
                    path = path,
                    color = Color.Black,
                    style = androidx.compose.ui.graphics.drawscope.Stroke(
                        width = 4f,
                        cap = androidx.compose.ui.graphics.StrokeCap.Round,
                        join = androidx.compose.ui.graphics.StrokeJoin.Round
                    )
                )
            }
        }
    }
}

@Composable
fun SignatureControls(state: SignatureState, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.End
    ) {
        OutlinedButton(onClick = { state.clear() }) {
            Text("Borrar firma")
        }
    }
}
