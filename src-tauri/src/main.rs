// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use specta::collect_types;
use std::process::Command;
use std::sync::Mutex;
use tauri::api::dialog::FileDialogBuilder;
use tauri::State;
use tauri_specta::ts;

struct VideoFilePath(Mutex<Option<String>>);

fn format_time(seconds: f64) -> String {
    let hours = (seconds / 3600.0).floor() as u32;
    let minutes = ((seconds % 3600.0) / 60.0).floor() as u32;
    let seconds = (seconds % 60.0).floor() as u32;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

#[tauri::command]
#[specta::specta]
fn select_video(state: State<VideoFilePath>) -> Result<String, String> {
    let (sender, receiver) = std::sync::mpsc::channel();
    FileDialogBuilder::new()
        .add_filter("Video files", &["mp4", "mkv", "avi", "mov", "flv", "wmv"])
        .pick_file(move |file_path| {
            if let Some(path) = file_path {
                sender.send(path.to_string_lossy().to_string()).unwrap();
            } else {
                sender.send(String::new()).unwrap();
            }
        });

    let selected_path = receiver.recv().unwrap();
    if selected_path.is_empty() {
        return Err("No file selected".into());
    }

    *state.0.lock().unwrap() = Some(selected_path.clone());
    Ok(selected_path)
}

#[tauri::command]
#[specta::specta]
fn crop_video(
    state: State<VideoFilePath>,
    crop_start: f64,
    crop_end: f64,
) -> Result<String, String> {
    if crop_start >= crop_end {
        return Err("End time must be greater than start time.".into());
    }

    let file_path = state.0.lock().unwrap().clone();
    if file_path.is_none() {
        return Err("No file selected".into());
    }
    let file_path = file_path.unwrap();

    let (sender, receiver) = std::sync::mpsc::channel();
    FileDialogBuilder::new()
        .add_filter("video", &[&"mp4"])
        .set_title("Save Cropped Video")
        .save_file(move |save_path| {
            if let Some(path) = save_path {
                sender.send(path.to_string_lossy().to_string()).unwrap();
            } else {
                sender.send(String::new()).unwrap();
            }
        });

    let save_path = receiver.recv().unwrap();
    if save_path.is_empty() {
        return Err("No save location selected".into());
    }

    let start_time = format_time(crop_start);
    let cut_duration = format_time(crop_end - crop_start);

    let ffmpeg_status = Command::new("ffmpeg")
        .arg("-ss")
        .arg(&start_time)
        .arg("-i")
        .arg(&file_path)
        .arg("-t")
        .arg(&cut_duration)
        .arg("-c")
        .arg("copy")
        .arg(&save_path)
        .arg("-y")
        .status();

    match ffmpeg_status {
        Ok(status) if status.success() => Ok(save_path),
        Ok(status) => Err(format!("FFmpeg failed with exit code: {}", status)),
        Err(e) => Err(format!("Failed to execute FFmpeg: {}", e)),
    }
}

fn main() {
    ts::export(
        collect_types![crop_video, select_video],
        "../src/bindings.ts",
    )
    .unwrap();

    tauri::Builder::default()
        .manage(VideoFilePath(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![select_video, crop_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
