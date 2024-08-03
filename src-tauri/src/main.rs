// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri::Emitter; // Add this line

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Tauri.", name)
}

fn main() {
  tauri::Builder::default()
      .setup(|app| {
          #[cfg(desktop)]
          {
              use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

              app.handle().plugin(
                  tauri_plugin_global_shortcut::Builder::new()
                      .with_shortcuts(["ctrl+alt+space"])?
                      .with_handler(|app, shortcut, event| {
                          if event.state == ShortcutState::Pressed  {
                              if shortcut.matches(Modifiers::CONTROL | Modifiers::ALT, Code::Space) {
                                 let _ = app.emit("shortcut-event", "Ctrl+Alt+Space triggered");
                             }
                          }
                      })
                      .build(),
              )?;
          }

          Ok(())
      })
      .invoke_handler(tauri::generate_handler![greet]) // Add this line if you want to use the greet function
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}