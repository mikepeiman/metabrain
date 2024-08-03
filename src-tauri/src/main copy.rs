// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use directories::BaseDirs;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{Emitter, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri_plugin_global_shortcut::{ShortcutManager, ShortcutState, Code, Modifiers};

#[derive(Debug, Deserialize)]
struct ChromeMessage {
    action: String,
    page: String,
}

#[derive(Serialize)]
struct ChromeResponse {
    success: bool,
    message: String,
}

fn create_native_messaging_manifest(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let manifest = json!({
        "name": "com.your_app.tauri",
        "description": "Tauri App Native Messaging",
        "path": app_handle.path().app_exe()?.to_string_lossy(),
        "type": "stdio",
        "allowed_origins": [
            "chrome-extension://ipjfamokledlemhjhpbomddhenglmoea/"
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
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("toggle".to_string(), "Toggle"))
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::init())
        .setup(|app| {
            let app_handle = app.handle();
            let window = app.get_webview_window("main").unwrap();

            // Create the native messaging manifest
            if let Err(e) = create_native_messaging_manifest(&app_handle) {
                eprintln!("Failed to create native messaging manifest: {}", e);
            }

            app.listen("chrome-message", move |event| {
                if let Some(payload) = event.payload() {
                    let chrome_message: ChromeMessage = serde_json::from_str(payload).unwrap();
                    if chrome_message.action == "open" {
                        // Navigate to the specific page in your SvelteKit app
                        window.emit("navigate", chrome_message.page).unwrap();
                    }
                }
            });

            let shortcut_manager = ShortcutManager::new(&app_handle);
            let shortcut = shortcut_manager.register("ctrl+alt+space", move |app, _, event| {
                if event.state == ShortcutState::Pressed {
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
            })?;

            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let item_handle = app.tray_handle().get_item(&id);
                match id.as_str() {
                    "toggle" => {
                        let window = app.get_window("main").unwrap();
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}