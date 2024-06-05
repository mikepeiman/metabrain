// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
      .setup(|app| {
          #[cfg(desktop)]
          {
              use tauri::Manager;
              use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

              app.handle().plugin(
                  tauri_plugin_global_shortcut::Builder::new()
                      .with_shortcuts(["ctrl+alt+space"])?
                      .with_handler(|app, shortcut, event| {
                          if event.state == ShortcutState::Pressed  {
                              if shortcut.matches(Modifiers::CONTROL | Modifiers::ALT, Code::Space) {
                                 let _ = app.emit("shortcut-event", "Alt+Space triggered");
                             }
                          }
                      })
                      .build(),
              )?;
          }

          Ok(())
      })
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}