package com.tawasol.app.presentation.home.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Block
import androidx.compose.material.icons.rounded.ChevronLeft
import androidx.compose.material.icons.rounded.DataUsage
import androidx.compose.material.icons.rounded.Devices
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Logout
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tawasol.app.core.theme.ErrorRed
import com.tawasol.app.core.theme.TealPrimary
import com.tawasol.app.domain.model.User
import com.tawasol.app.presentation.components.UserAvatar

@Composable
fun SettingsTab(
    currentUser: User?,
    onLogoutClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // User Profile Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                UserAvatar(
                    name = currentUser?.displayName ?: "مستخدم تواصل",
                    size = 64,
                    isOnline = true
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = currentUser?.displayName ?: "مستخدم تواصل",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "@${currentUser?.username ?: "tawasol_user"}",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = TealPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    Text(
                        text = "متاح على تواصل",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Settings items section
        SettingsGroup(title = "الحساب والخصوصية") {
            SettingsRow(
                icon = Icons.Rounded.Lock,
                title = "الخصوصية",
                subtitle = "آخر ظهور، الصورة الشخصية، من يمكنه مراسلتي"
            )
            SettingsRow(
                icon = Icons.Rounded.Security,
                title = "الأمان والتشفير",
                subtitle = "مفاتيح التشفير، الجلسات النشطة، حماية الحساب"
            )
            SettingsRow(
                icon = Icons.Rounded.Devices,
                title = "الأجهزة المتصلة",
                subtitle = "إدارة أجهزتك وجلسات الدخول المعتمدة"
            )
            SettingsRow(
                icon = Icons.Rounded.Block,
                title = "المستخدمون المحظورون",
                subtitle = "قائمة الحسابات المحظورة"
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        SettingsGroup(title = "التطبيق والبيانات") {
            SettingsRow(
                icon = Icons.Rounded.Notifications,
                title = "الإشعارات والأصوات",
                subtitle = "نغمات الرسائل والمكالمات والتنبيهات"
            )
            SettingsRow(
                icon = Icons.Rounded.DataUsage,
                title = "التخزين والبيانات",
                subtitle = "سياسة حفظ الملفات المحلية وتقليل الاستهلاك"
            )
            SettingsRow(
                icon = Icons.Rounded.Info,
                title = "حول تواصل",
                subtitle = "الإصدار 1.0.0 (Native Kotlin & Jetpack Compose)"
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Logout Button
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onLogoutClick),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(
                containerColor = ErrorRed.copy(alpha = 0.1f)
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Rounded.Logout,
                    contentDescription = null,
                    tint = ErrorRed
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "تسجيل الخروج من الحساب",
                    style = MaterialTheme.typography.titleMedium.copy(
                        color = ErrorRed,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun SettingsGroup(
    title: String,
    content: @Composable () -> Unit
) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.labelLarge.copy(
                color = TealPrimary,
                fontWeight = FontWeight.Bold
            ),
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
        )
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                content()
            }
        }
    }
}

@Composable
fun SettingsRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit = {}
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(TealPrimary.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = TealPrimary,
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )
        }

        Icon(
            imageVector = Icons.Rounded.ChevronLeft,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
