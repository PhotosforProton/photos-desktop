/*
 * Photos for Proton
 * Copyright (C) 2026 Akoos <https://akoos.eu>
 *
 * Source:  https://github.com/PhotosforProton/photos-desktop
 * Website: https://www.photosforproton.eu
 *
 * This file is part of Photos for Proton.
 *
 * Photos for Proton is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// A picture of a file the sidecar's own thumbnailer cannot open.
//
// The upload makes its two thumbnails with sharp, which is a still-image library: handed
// a video it can do nothing, so every video reached Proton with no thumbnail at all and
// showed as a blank tile in every client that reads the stored one. The web client looks
// fine because it decodes the video itself, which is why this went unnoticed.
//
// The frame is asked of Windows rather than decoded here, the same trade `local_file`
// already makes for HEIC: whatever the machine can open, this can use, and whatever it
// cannot is reported as nothing rather than answered by a decoder shipped in this app.
// `IShellItemImageFactory` is the way in, so what gets uploaded is the picture Explorer
// itself shows for that file, which also makes the result predictable to the person who
// dragged it in.
//
// Media Foundation was the alternative and was not taken. It would allow seeking past a
// black opening frame, which the shell cannot do, but it reaches only its own registered
// decoders, where the shell also honours whatever thumbnail providers the machine has, so
// it covers strictly less. It is several hundred lines of unsafe against forty, and it
// would answer differently from Explorer for the same file. If black opening frames turn
// out to be a real problem in practice, that is the moment to reach for it, and this
// module is where it would go.
//
// Why the host and not the sidecar: the RPC channel runs one way, host to sidecar, one
// request at a time. Rather than reverse it, the frontend asks for the frames before it
// asks for the upload and passes them along with it, so Windows-specific code stays in
// Rust, Proton-specific code stays in the sidecar, and no new channel exists.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use tauri::AppHandle;

use crate::local_file;

/// The staging folder, a sibling of the viewer's own rather than the same one: `pfp-view`
/// is the single folder the webview's asset protocol is scoped to, and a frame has no
/// business being reachable from there. Swept at startup by `reap_temp_leftovers`.
pub(crate) const FRAME_DIR: &str = "pfp-frame";

/// What Windows knows about one file that this app cannot work out for itself.
///
/// A duration exists only once something has opened the container, and no decoder ships
/// here, so this is the same trade the frame above makes: ask the shell, and report
/// nothing rather than guess when the machine cannot answer.
///
/// Every field is optional and absence is the honest answer. A zero is never written in
/// place of a missing value, because a zero reads downstream as a real measurement: a
/// video would claim to be no time long rather than of unknown length.
#[derive(Default, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaInfo {
    width: Option<u32>,
    height: Option<u32>,
    /// SECONDS, fractional. Drive stores this unit and the readers here scale it by a
    /// thousand, so anything else is a 1000x error in whatever displays it.
    duration_sec: Option<f64>,
}

impl MediaInfo {
    fn is_empty(&self) -> bool {
        self.width.is_none() && self.height.is_none() && self.duration_sec.is_none()
    }
}

/// What one call yields: the pictures, and what the shell knew about the same files.
///
/// Both come off a single shell item per file, so the metadata costs no extra pass and
/// no second round of shell extensions.
#[derive(Default, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FramePrep {
    frames: HashMap<String, String>,
    media: HashMap<String, MediaInfo>,
}

/// `System.Media.Duration` counts 100-nanosecond units. Drive's `Media.Duration` is in
/// SECONDS, so this is the one conversion that matters: taking the raw value for
/// milliseconds renders a clip a ten-thousandth of its length, and this project has
/// already paid for a 1000x mistake in this exact field once.
///
/// A zero means the shell had no answer, which is not a duration of nothing.
/// Rounded to the millisecond, which is every bit of precision anything here displays.
fn duration_seconds(hundred_ns: u64) -> Option<f64> {
    if hundred_ns == 0 {
        return None;
    }
    Some((hundred_ns as f64 / 10_000.0).round() / 1_000.0)
}

/// The extensions worth asking Windows about.
///
/// The sidecar's own tables are the authority here, not this list: these are exactly the
/// types it accepts for upload and cannot open itself, which is every video it takes
/// plus the three stills sharp has no decoder for. That makes it the right list for the
/// metadata too: the files sharp can decode have their dimensions read off the decode
/// the sidecar already does, and only these need asking about. Drift is not dangerous in
/// either direction, which is why one list can be kept here rather than plumbed across
/// the channel: a type named here that the sidecar will not upload costs one wasted frame
/// that the sweep collects, and one missing from here uploads with no thumbnail, which is
/// what every video did before this module existed.
const NEEDS_WINDOWS_FRAME: &[&str] = &[
    // Video, all of it: sharp decodes stills only.
    "mp4", "mov", "m4v", "webm", "mkv", "3gp",
    // Stills sharp cannot decode either, which had the same blank tile for the same
    // reason and are fixed by the same call.
    "heic", "heif", "dng",
];

/// The longest edge asked of Windows.
///
/// The larger of the two thumbnails the upload makes is 1920, so carrying more pixels
/// than this to the resize buys nothing. It is a ceiling and never a stretch: the flag
/// that would scale a small picture up is deliberately not passed, so a file whose only
/// stored thumbnail is smaller comes back at its own size rather than blurred up to this.
const FRAME_EDGE: i32 = 1920;

/// How many frames are pulled at once.
///
/// Also the memory ceiling, and that is the reason for a bound rather than a thread per
/// file: each worker holds one decoded bitmap while it encodes, so a drop of two hundred
/// videos costs four of those at a time and not two hundred. Extraction is mostly waiting
/// on a decoder, so a handful of threads shortens a large drop considerably and more would
/// only contend.
const FRAME_WORKERS: usize = 4;

/// Whether Windows should be asked for a picture of this one.
fn needs_windows_frame(ext: &str) -> bool {
    NEEDS_WINDOWS_FRAME.contains(&ext)
}

/// One file to fetch a frame for.
struct FrameJob {
    /// The path the sidecar will know this file by, which is the dropped spelling rather
    /// than the resolved one. The two can differ in case, and the map is looked up by
    /// what the sidecar has in hand.
    key: String,
    /// The same file, resolved and vetted, which is what actually gets read.
    src: PathBuf,
    /// Where the JPEG goes.
    dest: PathBuf,
}

fn frame_dir() -> PathBuf {
    std::env::temp_dir().join(FRAME_DIR)
}

/// A name no other staged frame can collide with, from the same source of randomness the
/// store's keys come from.
fn frame_name() -> String {
    use aes_gcm::aead::rand_core::RngCore;
    let mut raw = [0u8; 16];
    aes_gcm::aead::OsRng.fill_bytes(&mut raw);
    let hex: String = raw.iter().map(|b| format!("{b:02x}")).collect();
    format!("frame-{hex}.jpg")
}

/// Every dropped path that wants a frame, a dropped folder's own files included.
///
/// A folder becomes an album and its contents are uploaded individually, so a mixed
/// folder has to yield its videos here while its photos are left to sharp. Not recursive,
/// because the sidecar's own listing is not either: one level is what becomes the album.
///
/// The spelling is what matters as much as the set. A folder's files are joined the way
/// the sidecar joins them, onto the dropped path exactly as it was given, so that the key
/// this produces is the path the sidecar will be holding when it looks one up.
fn frame_candidates(paths: &[String]) -> Vec<String> {
    let mut out = Vec::new();
    for path in paths {
        let Ok(info) = std::fs::metadata(path) else {
            continue;
        };
        if info.is_dir() {
            let Ok(entries) = std::fs::read_dir(path) else {
                continue;
            };
            for entry in entries.flatten() {
                if !entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
                    continue;
                }
                let name = entry.file_name();
                let name = name.to_string_lossy();
                if needs_windows_frame(&local_file::extension_of(&name)) {
                    out.push(Path::new(path).join(name.as_ref()).to_string_lossy().into_owned());
                }
            }
        } else if needs_windows_frame(&local_file::extension_of(path)) {
            out.push(path.clone());
        }
    }
    out
}

/// The candidates that survive the same vetting every other caller-named path here gets,
/// each with the staged file it will be written to.
fn plan_frames(app: &AppHandle, paths: &[String]) -> Vec<FrameJob> {
    let dir = frame_dir();
    frame_candidates(paths)
        .into_iter()
        .filter_map(|key| {
            let src = local_file::checked_media_path(app, &key).ok()?;
            Some(FrameJob {
                key,
                // The shell parses a path rather than opening one, and it does not
                // understand the verbatim prefix canonicalising leaves behind.
                src: crate::strip_verbatim(src),
                dest: dir.join(frame_name()),
            })
        })
        .collect()
}

/// The shell's handle on one file, which both the picture and the properties come off.
///
/// `IShellItem2` rather than `IShellItemImageFactory` because it is the one that answers
/// properties; the imaging interface is cast from it below. The same underlying item
/// serves both, so a file is parsed and bound once however much is asked of it.
#[cfg(windows)]
fn shell_item(src: &Path) -> Result<windows::Win32::UI::Shell::IShellItem2, String> {
    use windows::core::HSTRING;
    use windows::Win32::UI::Shell::SHCreateItemFromParsingName;

    unsafe {
        SHCreateItemFromParsingName(&HSTRING::from(src), None)
            .map_err(|_| "the shell does not recognise this file".to_string())
    }
}

/// The property keys read below, which the `windows` crate does not generate: `propkey.h`
/// defines them as macros, so they are written out here. The formats are Windows' own
/// long-standing ones (Media, Video and Image), and the pids are the documented members.
#[cfg(windows)]
mod pkey {
    use windows::core::GUID;
    use windows::Win32::Foundation::PROPERTYKEY;

    const FMTID_MEDIA: GUID = GUID::from_u128(0x64440490_4C8B_11D1_8B70_080036B11A03);
    const FMTID_VIDEO: GUID = GUID::from_u128(0x64440491_4C8B_11D1_8B70_080036B11A03);
    const FMTID_IMAGE: GUID = GUID::from_u128(0x6444048F_4C8B_11D1_8B70_080036B11A03);

    /// System.Media.Duration, in 100-nanosecond units.
    pub const MEDIA_DURATION: PROPERTYKEY = PROPERTYKEY { fmtid: FMTID_MEDIA, pid: 3 };
    /// System.Video.FrameWidth / FrameHeight, in pixels.
    pub const VIDEO_WIDTH: PROPERTYKEY = PROPERTYKEY { fmtid: FMTID_VIDEO, pid: 3 };
    pub const VIDEO_HEIGHT: PROPERTYKEY = PROPERTYKEY { fmtid: FMTID_VIDEO, pid: 4 };
    /// System.Image.HorizontalSize / VerticalSize, in pixels.
    pub const IMAGE_WIDTH: PROPERTYKEY = PROPERTYKEY { fmtid: FMTID_IMAGE, pid: 3 };
    pub const IMAGE_HEIGHT: PROPERTYKEY = PROPERTYKEY { fmtid: FMTID_IMAGE, pid: 4 };
}

/// What the shell can say about one file's media, as far as it knows anything.
///
/// Every read is allowed to fail on its own: a machine with no decoder for this container
/// answers nothing, an audio file has no frame size, and a still has no duration. None of
/// those is an error, and none of them stops the others being asked.
///
/// The video frame size is asked for first and the image size second, because a file here
/// is either a video or one of the three stills sharp cannot decode, and the two property
/// sets do not overlap. The shell reports both as already-oriented display dimensions,
/// which is what has to be stored: a photo turned by its EXIF tag must report the turned
/// size or it will not match what the viewer draws.
#[cfg(windows)]
fn probe_media(item: &windows::Win32::UI::Shell::IShellItem2) -> MediaInfo {
    let mut info = MediaInfo::default();
    unsafe {
        info.duration_sec = item
            .GetUInt64(&pkey::MEDIA_DURATION)
            .ok()
            .and_then(duration_seconds);

        let dimension = |key| item.GetUInt32(key).ok().filter(|px| *px > 0);
        info.width = dimension(&pkey::VIDEO_WIDTH).or_else(|| dimension(&pkey::IMAGE_WIDTH));
        info.height = dimension(&pkey::VIDEO_HEIGHT).or_else(|| dimension(&pkey::IMAGE_HEIGHT));
    }
    // A pair is worth nothing by halves: whatever writes these needs both edges, and one
    // alone would be recorded as a dimension the file does not have.
    if info.width.is_none() || info.height.is_none() {
        info.width = None;
        info.height = None;
    }
    info
}

/// Ask the shell for one file's picture and write it out as a JPEG.
#[cfg(windows)]
fn grab_one(
    factory: &windows::Win32::Graphics::Imaging::IWICImagingFactory,
    item: &windows::Win32::UI::Shell::IShellItem2,
    dest: &Path,
) -> Result<(), String> {
    use windows::core::Interface;
    use windows::Win32::Foundation::SIZE;
    use windows::Win32::Graphics::Gdi::{DeleteObject, HPALETTE};
    use windows::Win32::Graphics::Imaging::{IWICBitmapSource, WICBitmapIgnoreAlpha};
    use windows::Win32::UI::Shell::{IShellItemImageFactory, SIIGBF_THUMBNAILONLY};

    unsafe {
        let item: IShellItemImageFactory = item
            .cast()
            .map_err(|_| "the shell offers no picture of this file".to_string())?;

        // THUMBNAILONLY is the whole guard against the thing that would otherwise make
        // this worse than useless: without it a file the machine cannot decode comes back
        // as the generic icon for its type, and that icon would upload as the photo's
        // thumbnail and look deliberate. With it, no real picture is an error, and an
        // error is a file that uploads exactly as it does today.
        //
        // A cached picture is welcome and is usually what arrives, because the folder was
        // just been browsed to find these files. It is not a lesser answer: the cache
        // holds what the same extractor produced for the same unchanged bytes.
        let bitmap = item
            .GetImage(SIZE { cx: FRAME_EDGE, cy: FRAME_EDGE }, SIIGBF_THUMBNAILONLY)
            .map_err(|_| "windows has no picture for this file".to_string())?;

        let encoded = (|| {
            // Alpha ignored rather than used: a shell thumbnail is opaque, but some
            // providers hand back a zeroed alpha channel they never meant as
            // transparency, and honouring that would composite the whole frame away to
            // black. The encoder drops the channel a line later regardless.
            let source: IWICBitmapSource = factory
                .CreateBitmapFromHBITMAP(bitmap, HPALETTE(std::ptr::null_mut()), WICBitmapIgnoreAlpha)
                .map_err(|_| "that picture could not be read".to_string())?
                .cast()
                .map_err(|_| "that picture could not be read".to_string())?;
            // Not turned upright on the way through, unlike the viewer's decode: the
            // shell applies orientation itself, so the picture arrives the right way up
            // and rotating it again would lay it on its side.
            local_file::encode_jpeg(factory, &source, dest)
        })();

        let _ = DeleteObject(bitmap.into());
        encoded
    }
}

/// One worker's share. COM is set up once for the thread rather than once per file, and
/// so is the imaging factory.
///
/// The thread is this module's own rather than one borrowed from the runtime's blocking
/// pool, and that is deliberate: a fresh thread has no apartment yet, so it can be put in
/// the single-threaded one that shell extensions expect. A pooled thread may already have
/// been placed in the multi-threaded apartment by an earlier decode, which never undoes
/// its own initialisation, and every thumbnail provider on the machine would then be
/// marshalled across apartments for no reason.
#[cfg(windows)]
fn grab_chunk(jobs: &[FrameJob], out: &mut [(bool, MediaInfo)]) {
    use windows::Win32::Foundation::RPC_E_CHANGED_MODE;
    use windows::Win32::Graphics::Imaging::{CLSID_WICImagingFactory, IWICImagingFactory};
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
        COINIT_APARTMENTTHREADED,
    };

    let hr = unsafe { CoInitializeEx(None, COINIT_APARTMENTTHREADED) };
    if hr.is_err() && hr != RPC_E_CHANGED_MODE {
        return;
    }

    let factory: Result<IWICImagingFactory, _> =
        unsafe { CoCreateInstance(&CLSID_WICImagingFactory, None, CLSCTX_INPROC_SERVER) };
    if let Ok(factory) = factory {
        for (job, (made, info)) in jobs.iter().zip(out.iter_mut()) {
            let Ok(item) = shell_item(&job.src) else {
                continue;
            };
            // Asked for first and kept whatever the picture does: the two answers are
            // independent, and a container the machine can describe but not draw still
            // knows how long it is.
            *info = probe_media(&item);
            *made = grab_one(&factory, &item, &job.dest).is_ok();
            if !*made {
                // A half-written file would otherwise sit in the folder until the next
                // start, and the sidecar would hand sharp a truncated JPEG.
                let _ = std::fs::remove_file(&job.dest);
            }
        }
    }

    // Owned here, unlike the viewer's decode, because this thread is about to end and
    // nothing else will ever run on it.
    if hr.is_ok() {
        unsafe { CoUninitialize() };
    }
}

/// Which jobs produced a file and what the shell said about each, in the order given.
#[cfg(windows)]
fn run_jobs(jobs: &[FrameJob]) -> Vec<(bool, MediaInfo)> {
    // `chunks` panics on a zero size, which is what an empty job list would compute.
    if jobs.is_empty() {
        return Vec::new();
    }
    let mut out = vec![(false, MediaInfo::default()); jobs.len()];
    let chunk = jobs.len().div_ceil(FRAME_WORKERS.min(jobs.len()).max(1));
    std::thread::scope(|scope| {
        for (jobs, out) in jobs.chunks(chunk).zip(out.chunks_mut(chunk)) {
            scope.spawn(move || grab_chunk(jobs, out));
        }
    });
    out
}

#[cfg(not(windows))]
fn run_jobs(jobs: &[FrameJob]) -> Vec<(bool, MediaInfo)> {
    jobs.iter().map(|_| (false, MediaInfo::default())).collect()
}

/// A JPEG of every dropped video, keyed by the path it was made from, and whatever the
/// shell knew about the same files.
///
/// Called by the frontend just before it starts an upload, and both maps are passed along
/// with it. A file that produced nothing is simply absent from either, and the sidecar
/// uploads it the way it always has: neither a thumbnail nor a duration is ever worth
/// failing an upload over.
///
/// The wait is the honest cost of having no reverse channel. It falls only on drops that
/// contain video, since nothing else is asked for, and it is usually short because
/// Explorer has generally cached these already while the files were being found.
#[tauri::command]
pub async fn upload_frames(app: AppHandle, paths: Vec<String>) -> Result<FramePrep, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let jobs = plan_frames(&app, &paths);
        if jobs.is_empty() {
            return FramePrep::default();
        }
        if std::fs::create_dir_all(frame_dir()).is_err() {
            return FramePrep::default();
        }

        let outcomes = run_jobs(&jobs);
        let mut prep = FramePrep::default();
        for (job, (made, info)) in jobs.iter().zip(outcomes) {
            if made {
                prep.frames
                    .insert(job.key.clone(), job.dest.to_string_lossy().into_owned());
            }
            // An empty entry would only be a key the other side has to test for.
            if !info.is_empty() {
                prep.media.insert(job.key.clone(), info);
            }
        }

        // Counts only. A path or a file name here would be the user's own photo library
        // written to a log that gets pasted into bug reports.
        crate::note(
            &app,
            &format!(
                "[frames] wanted {} made {} described {}",
                jobs.len(),
                prep.frames.len(),
                prep.media.len()
            ),
        );
        prep
    })
    .await
    .map_err(|e| format!("preparing those frames failed: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A directory holding the named empty files, removed when the guard drops.
    struct TempTree(PathBuf);

    impl TempTree {
        fn new(tag: &str, names: &[&str]) -> Self {
            let dir = std::env::temp_dir().join(format!("pfp-frame-test-{tag}-{}", frame_name()));
            std::fs::create_dir_all(&dir).unwrap();
            for name in names {
                std::fs::write(dir.join(name), b"not really a video").unwrap();
            }
            TempTree(dir)
        }
        fn path(&self) -> String {
            self.0.to_string_lossy().into_owned()
        }
    }

    impl Drop for TempTree {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn only_what_the_sidecar_cannot_thumbnail_itself_is_asked_of_windows() {
        // Every video the sidecar accepts for upload.
        for ext in ["mp4", "mov", "m4v", "webm", "mkv", "3gp"] {
            assert!(needs_windows_frame(ext), "{ext} uploads with no thumbnail");
        }
        // And the three stills sharp has no decoder for.
        for ext in ["heic", "heif", "dng"] {
            assert!(needs_windows_frame(ext), "{ext} uploads with no thumbnail");
        }
        // What sharp handles itself must never come here: that path already produces
        // correct thumbnails and a frame would only displace one.
        for ext in ["jpg", "jpeg", "png", "webp", "gif", "avif", "tif", "tiff"] {
            assert!(!needs_windows_frame(ext), "{ext} belongs to sharp");
        }
        // The caller lowercases, as everywhere else here.
        assert!(!needs_windows_frame("MP4"));
        assert!(!needs_windows_frame(""));
        assert!(!needs_windows_frame("exe"));
    }

    #[test]
    fn a_dropped_file_is_a_candidate_only_when_it_needs_one() {
        let tree = TempTree::new("loose", &["clip.mp4", "photo.jpg"]);
        let video = Path::new(&tree.path()).join("clip.mp4").to_string_lossy().into_owned();
        let photo = Path::new(&tree.path()).join("photo.jpg").to_string_lossy().into_owned();

        assert_eq!(frame_candidates(&[video.clone()]), vec![video.clone()]);
        assert!(frame_candidates(&[photo.clone()]).is_empty(), "sharp handles this one");
        // Mixed, and the photo is left behind rather than the whole drop refused.
        assert_eq!(frame_candidates(&[photo, video.clone()]), vec![video]);
    }

    #[test]
    fn a_mixed_folder_yields_its_videos_and_leaves_its_photos_to_sharp() {
        // The album case: a folder becomes one, and its contents upload individually.
        let tree = TempTree::new("album", &["a.jpg", "b.mp4", "c.png", "d.mov", "e.heic"]);
        let mut found = frame_candidates(&[tree.path()]);
        found.sort();

        let expect = |name: &str| Path::new(&tree.path()).join(name).to_string_lossy().into_owned();
        assert_eq!(found, vec![expect("b.mp4"), expect("d.mov"), expect("e.heic")]);
    }

    #[test]
    fn a_folder_candidate_is_spelled_the_way_the_sidecar_will_spell_it() {
        // The key is looked up by a path the sidecar built by joining the dropped folder
        // to the file's own name. A key that does not match is a thumbnail thrown away.
        let tree = TempTree::new("spelling", &["clip.mp4"]);
        let found = frame_candidates(&[tree.path()]);
        assert_eq!(found.len(), 1);
        assert!(found[0].starts_with(&tree.path()), "the dropped path is kept as given");
        assert!(found[0].ends_with("clip.mp4"));
    }

    #[test]
    fn a_drop_with_nothing_to_do_asks_for_nothing() {
        let tree = TempTree::new("photos", &["a.jpg", "b.png"]);
        assert!(frame_candidates(&[tree.path()]).is_empty(), "a photo drop does no extra work");
        assert!(frame_candidates(&[]).is_empty());
        // A path that is not there at all is skipped rather than failing the drop.
        assert!(frame_candidates(&["C:\\nowhere-at-all\\clip.mp4".to_string()]).is_empty());
    }

    #[test]
    fn a_duration_is_converted_from_the_shell_unit_to_the_one_drive_stores() {
        // The shell counts 100-nanosecond units and Drive stores seconds. Ten million of
        // the former make one of the latter, and getting that factor wrong is the 1000x
        // error this project has already paid for once.
        assert_eq!(duration_seconds(10_000_000), Some(1.0));
        assert_eq!(duration_seconds(75_000_000), Some(7.5));
        assert_eq!(duration_seconds(600_000_000), Some(60.0));
        // A two hour film, which must not come back as anything like two.
        assert_eq!(duration_seconds(72_000_000_000), Some(7200.0));

        // Sub-second clips survive rather than rounding away to nothing.
        assert_eq!(duration_seconds(5_000_000), Some(0.5));
        assert_eq!(duration_seconds(10_000), Some(0.001));

        // Rounded to the millisecond, which is all anything displays: the tail below a
        // thousandth of a second goes, and the seconds themselves never move.
        assert_eq!(duration_seconds(75_500_000), Some(7.55));
        assert_eq!(duration_seconds(75_004_999), Some(7.5));
        assert_eq!(duration_seconds(1_234_567), Some(0.123));
        // Half a millisecond goes up, never down to a shorter clip.
        assert_eq!(duration_seconds(75_005_000), Some(7.501));
    }

    #[test]
    fn a_file_the_shell_cannot_describe_reports_nothing_rather_than_zero() {
        // The honest answer for a machine with no decoder. A zero would read downstream
        // as a real measurement: a video claiming to be no time long.
        assert_eq!(duration_seconds(0), None);

        let empty = MediaInfo::default();
        assert!(empty.is_empty(), "nothing known means nothing sent");
        assert!(empty.duration_sec.is_none());

        let described = MediaInfo {
            width: Some(1920),
            height: Some(1080),
            duration_sec: None,
        };
        // A still has no duration and is still worth sending.
        assert!(!described.is_empty());
    }

    #[test]
    fn a_staged_frame_lands_in_its_own_folder_under_a_name_of_its_own() {
        // Never `pfp-view`: that folder is the one the webview can read.
        assert!(frame_dir().ends_with(FRAME_DIR));
        assert_ne!(FRAME_DIR, "pfp-view");

        let one = frame_name();
        assert!(one.starts_with("frame-") && one.ends_with(".jpg"));
        assert_ne!(one, frame_name(), "two frames would overwrite each other");
    }
}
