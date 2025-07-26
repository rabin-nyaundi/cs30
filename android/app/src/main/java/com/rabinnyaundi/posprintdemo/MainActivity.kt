package com.rabinnyaundi.posprintdemo
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper
import com.zcs.sdk.DriverManager
import com.zcs.sdk.SdkResult
import android.util.Log

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)

    // SmartPos SDK system initialization with more robust error handling
    try {
        val driverManager = DriverManager.getInstance()
        val sys = driverManager.getBaseSysDevice()


        
        // Try multiple initialization attempts
        var status = sys.sdkInit()
        Log.d("SmartPosInit", "First sdkInit status: $status")
        Log.d("SmartPosInit=>: $status", "SmartPosInit:  $sys")
        
        if (status != SdkResult.SDK_OK) {
            // Power on and wait longer
            sys.sysPowerOn()
            try {
                Thread.sleep(3000) // Wait 3 seconds
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
            status = sys.sdkInit()
            Log.d("SmartPosInit", "Second sdkInit status: $status")
        }
        
        if (status != SdkResult.SDK_OK) {
            // Try one more time with even longer delay
            try {
                Thread.sleep(2000)
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
            status = sys.sdkInit()
            Log.d("SmartPosInit", "Third sdkInit status: $status")
        }

        if (status != SdkResult.SDK_OK) {
            // Try one more time with even longer delay
            try {
                Thread.sleep(2000)
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
            status = sys.sdkInit()
            Log.d("SmartPosInit", "Four sdkInit status: $status")
        }

        if (status != SdkResult.SDK_OK) {
            // Try one more time with even longer delay
            try {
                Thread.sleep(2000)
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
            status = sys.sdkInit()
            Log.d("SmartPosInit", "Fifth sdkInit status: $status")
        }
        
        if (status != SdkResult.SDK_OK) {
            Log.e("SmartPosInit", "SDK initialization failed after multiple attempts")
        }
    } catch (e: Exception) {
        Log.e("SmartPosInit", "Exception during SDK init", e)
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
