package com.mob1.notifapp.service.FirebaseMessagingService

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.mob1.notifapp.R

class FirebaseMessaging : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "🔥 Nouveau token reçu: $token")
        sendRegistrationToServer(token)
    }

    private fun sendRegistrationToServer(token: String) {
        Log.d(TAG, "✅ Token envoyé au serveur: $token")

    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)


        remoteMessage.notification?.let {
            Log.d(TAG, "📩 Message reçu: ${it.title} - ${it.body}")
            showNotification(it.title ?: "Notification", it.body ?: "Nouveau message")
        }
    }

    private fun showNotification(title: String, message: String) {
        val channelId = "notif_channel"

        // Canal de notif
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Notifications Firebase",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Canal de notification Firebase"
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(
                    this, Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Log.w(TAG, "⚠️ Permission POST_NOTIFICATIONS non accordée")
                return
            }
        }

        NotificationManagerCompat.from(this).notify(1, notificationBuilder.build())
    }

    companion object {
        private const val TAG = "FCM_Service"
    }
}
