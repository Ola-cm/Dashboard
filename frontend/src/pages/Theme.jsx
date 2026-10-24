import { useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import { useTheme } from '../hooks/useTheme';
import bronzePhoto from '../assets/dashboard-background.jpg';
import spiderPhoto from '../assets/spider-theme.jpg';
import cherryPhoto from '../assets/cherry-theme.jpg';

// Swatches are fixed per theme (copied from index.css) rather than read from CSS variables:
// those variables only ever hold the *active* theme's values, and every card has to preview its
// own theme regardless of which one is currently applied.
const THEME_OPTIONS = [
  {
    id: 'light',
    label: 'Light',
    description: 'Warm cream and bronze',
    photo: bronzePhoto,
    swatches: ['rgb(245 239 230)', 'rgb(232 220 200)', 'rgb(107 68 35)'],
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Coffee and copper',
    photo: bronzePhoto,
    swatches: ['rgb(23 17 11)', 'rgb(42 32 22)', 'rgb(216 168 104)'],
  },
  {
    id: 'spider',
    label: 'Spider',
    description: 'Black web on crimson',
    photo: spiderPhoto,
    swatches: ['rgb(16 9 10)', 'rgb(36 14 17)', 'rgb(214 58 58)'],
  },
  {
    id: 'cherry',
    label: 'Cherry',
    description: 'Blush pink and cherry red',
    photo: cherryPhoto,
    swatches: ['rgb(253 240 242)', 'rgb(246 210 216)', 'rgb(150 30 55)'],
  },
];

// Uploaded photos are downscaled and re-encoded before being stored: a raw phone photo is often
// 5-10 MB, which alone would blow through the ~5 MB localStorage quota.
const MAX_WALLPAPER_SIDE = 1920;
const WALLPAPER_QUALITY = 0.82;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

async function toWallpaperDataUrl(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_WALLPAPER_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', WALLPAPER_QUALITY);
}

function ThemeCard({ option, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={active}
      className={`glass group overflow-hidden rounded-2xl text-left shadow-lg shadow-brown-900/10 transition-[transform,box-shadow] duration-150 ease-[var(--ease-out)] hover:-translate-y-0.5 active:scale-[0.98] ${
        active ? 'ring-2 ring-brown-600 ring-offset-2 ring-offset-transparent' : ''
      }`}
    >
      <div
        className="relative h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${option.photo})` }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: option.swatches[0], opacity: 0.35 }}
        />
        {active && (
          <span className="absolute right-2 top-2 rounded-full bg-brown-600 px-2 py-0.5 text-[11px] font-medium text-cream shadow">
            Active
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="font-medium text-brown-800">{option.label}</p>
          <p className="truncate text-xs text-brown-400">{option.description}</p>
        </div>
        <div className="flex shrink-0 -space-x-1.5">
          {option.swatches.map((color) => (
            <span
              key={color}
              className="h-5 w-5 rounded-full border border-white/70 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

function WallpaperPicker() {
  const { wallpaper, setWallpaper, clearWallpaper } = useTheme();
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please pick an image file (JPG, PNG, WebP...).');
      return;
    }
    setBusy(true);
    try {
      setWallpaper(await toWallpaperDataUrl(file));
    } catch (err) {
      setError(
        err.message === 'decode'
          ? "This image couldn't be read — try another file."
          : "Your browser couldn't store this image — try a smaller one.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass rounded-2xl p-6 shadow-xl shadow-brown-900/10">
      <h2 className="font-display text-lg font-semibold text-brown-800">Custom wallpaper</h2>
      <p className="mt-1 text-sm text-brown-400">
        Use your own photo as the background. The theme you pick above still sets the colors on top
        of it. Saved in this browser only.
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-brown-300 bg-cover bg-center sm:w-40"
          style={wallpaper ? { backgroundImage: `url("${wallpaper}")` } : undefined}
        >
          {!wallpaper && <span className="text-xs text-brown-400">No wallpaper</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-brown-600 px-3.5 py-1.5 text-sm font-medium text-cream shadow shadow-brown-900/20 transition-[background-color,transform] duration-150 hover:bg-brown-500 active:scale-[0.97] disabled:opacity-50"
          >
            {busy ? 'Processing...' : wallpaper ? 'Replace image' : 'Upload an image'}
          </button>
          {wallpaper && (
            <button
              type="button"
              onClick={clearWallpaper}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-terracotta hover:bg-terracotta-pale/60"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-terracotta">
          {error}
        </p>
      )}
    </section>
  );
}

export default function Theme() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell title="Theme">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Glass card around the heading too: with a busy custom wallpaper behind it, bare text
            straight on the background can become unreadable. */}
        <section className="glass rounded-2xl p-6 shadow-xl shadow-brown-900/10">
          <h2 className="mb-4 font-display text-lg font-semibold text-brown-800">Color theme</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {THEME_OPTIONS.map((option) => (
              <ThemeCard
                key={option.id}
                option={option}
                active={theme === option.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </section>
        <WallpaperPicker />
      </div>
    </AppShell>
  );
}
