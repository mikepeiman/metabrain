use std::fs;
use std::path::PathBuf;
use serde_json::json;
use directories::BaseDirs;
use tauri::Manager;

fn create_native_messaging_manifest(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = tauri::api::path::app_dir(app_handle.config()).ok_or("Failed to get app directory")?;
    
    let manifest = json!({
        "name": "com.your_app.tauri",
        "description": "Tauri App Native Messaging",
        "path": app_dir.to_str().unwrap(),
        "type": "stdio",
        "allowed_origins": [
            "chrome-extension://your-extension-id/"
        ]
    });

    let manifest_filename = "com.your_app.tauri.json";
    
    if let Some(base_dirs) = BaseDirs::new() {
        let manifest_path = if cfg!(target_os = "windows") {
            base_dirs.data_local_dir()
                .join("Google")
                .join("Chrome")
                .join("User Data")
                .join("NativeMessagingHosts")
                .join(manifest_filename)
        } else if cfg!(target_os = "macos") {
            PathBuf::from(base_dirs.home_dir())
                .join("Library")
                .join("Application Support")
                .join("Google")
                .join("Chrome")
                .join("NativeMessagingHosts")
                .join(manifest_filename)
        } else {
            // Assume Linux
            PathBuf::from(base_dirs.home_dir())
                .join(".config")
                .join("google-chrome")
                .join("NativeMessagingHosts")
                .join(manifest_filename)
        };

        // Create directory if it doesn't exist
        if let Some(parent) = manifest_path.parent() {
            fs::create_dir_all(parent)?;
        }

        // Write the manifest file
        fs::write(manifest_path, serde_json::to_string_pretty(&manifest)?)?;

        Ok(())
    } else {
        Err("Unable to determine base directories".into())
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Create the native messaging manifest
            if let Err(e) = create_native_messaging_manifest(&app.handle()) {
                eprintln!("Failed to create native messaging manifest: {}", e);
            }

            // ... rest of your setup code ...

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}