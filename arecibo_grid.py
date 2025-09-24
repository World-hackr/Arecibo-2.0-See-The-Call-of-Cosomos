"""
arecibo_viewer.py

- Decodes an FSK WAV (8kHz=0, 12kHz=1, 10kHz=gap) using Goertzel
- Arranges bits into the canonical Arecibo layout (73 rows x 23 cols)
- Displays the message in a Pygame window (with rotate/save keys)
"""

import os
import numpy as np
from scipy.io import wavfile
import pygame
import math
import datetime

# -----------------------
# CONFIG (change if needed)
# -----------------------
BIT_DURATION = 0.001        # seconds per bit (must match generator)
FREQ_0 = 8000              # Hz for bit 0
FREQ_1 = 12000             # Hz for bit 1
FREQ_GAP = 10000           # Hz for start/end gap
ROWS, COLS = 73, 23        # Correct Arecibo layout (tall)
DEFAULT_CELL = 12          # preferred cell size in px (will auto-scale)
MARGIN = 2                 # margin between cells in px
MAX_WINDOW_WIDTH = 1200
MAX_WINDOW_HEIGHT = 1000

# -----------------------
# Goertzel implementation
# -----------------------
def goertzel_power(samples, sample_rate, target_freq):
    """
    Returns the power at target_freq for the given samples using the Goertzel algorithm.
    """
    n = len(samples)
    if n == 0:
        return 0.0
    k = int(0.5 + (n * target_freq) / sample_rate)
    omega = (2.0 * math.pi * k) / n
    sine = math.sin(omega)
    cosine = math.cos(omega)
    coeff = 2.0 * cosine
    q0 = q1 = q2 = 0.0
    for s in samples:
        q0 = coeff * q1 - q2 + s
        q2 = q1
        q1 = q0
    power = q1*q1 + q2*q2 - q1*q2*coeff
    return float(power)

# -----------------------
# Decode WAV -> bits (two-pass robust approach)
# -----------------------
def decode_wav_goertzel(wav_path, bit_duration=BIT_DURATION, freqs=(FREQ_0, FREQ_1, FREQ_GAP)):
    if not os.path.exists(wav_path):
        raise FileNotFoundError(f"{wav_path} not found.")

    fs, data = wavfile.read(wav_path)
    # If stereo/two-channel, use first channel
    if data.ndim > 1:
        data = data[:, 0]

    # convert to float and normalize (avoid division by zero)
    data = data.astype(float)
    max_abs = np.max(np.abs(data))
    if max_abs > 0:
        data = data / max_abs

    samples_per_bit = int(round(bit_duration * fs))
    if samples_per_bit <= 0:
        raise ValueError("bit_duration or sampling rate produces zero samples/bit.")

    num_bits = len(data) // samples_per_bit
    if num_bits == 0:
        raise ValueError("Audio too short for the given bit duration.")

    # First pass: compute powers for each segment
    p_list = []
    for i in range(num_bits):
        seg = data[i*samples_per_bit : (i+1)*samples_per_bit]
        # small silence detection
        if np.max(np.abs(seg)) < 1e-5:
            p_list.append((0.0, 0.0, 0.0))
            continue
        p0 = goertzel_power(seg, fs, freqs[0])
        p1 = goertzel_power(seg, fs, freqs[1])
        pg = goertzel_power(seg, fs, freqs[2])
        p_list.append((p0, p1, pg))

    # determine threshold dynamically
    global_max = max(max(trio) for trio in p_list) if p_list else 0.0
    # if signal is very small, set a small floor
    if global_max <= 0:
        raise ValueError("No detectable tone energy found in audio.")
    threshold = max(global_max * 0.03, 1e-6)  # 3% of max or small floor

    # Second pass: classify
    decoded = []
    for (p0, p1, pg) in p_list:
        m = max(p0, p1, pg)
        if m < threshold:
            decoded.append('G')   # gap / unknown / silence
        else:
            if m == p0:
                decoded.append('0')
            elif m == p1:
                decoded.append('1')
            else:
                decoded.append('G')

    # trim leading/trailing gaps
    while decoded and decoded[0] == 'G':
        decoded.pop(0)
    while decoded and decoded[-1] == 'G':
        decoded.pop()

    bit_string = "".join([b for b in decoded if b in ('0','1')])
    return bit_string, fs, samples_per_bit

# -----------------------
# Pygame visualization
# -----------------------
def show_pygame_grid(bit_string, rows=ROWS, cols=COLS, cell_guess=DEFAULT_CELL, margin=MARGIN):
    total_needed = rows * cols
    bit_len = len(bit_string)

    # trim or pad (pad with 0) so we can always render something
    if bit_len < total_needed:
        print(f"⚠️  Decoded bits = {bit_len} (< {total_needed}). Padding with zeros to display.")
        bit_string = bit_string.ljust(total_needed, '0')
    elif bit_len > total_needed:
        print(f"⚠️  Decoded bits = {bit_len} (> {total_needed}). Trimming to {total_needed}.")
        bit_string = bit_string[:total_needed]

    arr = np.array([int(x) for x in bit_string], dtype=np.uint8).reshape((rows, cols))

    # auto-scale cell size to fit screen
    # available size = MAX_WINDOW_WIDTH / HEIGHT
    max_cell_by_height = max(1, (MAX_WINDOW_HEIGHT - (rows + 1) * margin) // rows)
    max_cell_by_width = max(1, (MAX_WINDOW_WIDTH - (cols + 1) * margin) // cols)
    cell = min(cell_guess, max_cell_by_height, max_cell_by_width)
    window_w = cols * (cell + margin) + margin
    window_h = rows * (cell + margin) + margin

    pygame.init()
    screen = pygame.display.set_mode((window_w, window_h))
    pygame.display.set_caption("Arecibo Message Viewer (R=rotate, S=save, ESC=quit)")

    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    BG = (30, 30, 30)

    current = arr.copy()
    rotated = False

    def draw_grid(grid):
        screen.fill(BG)
        r, c = grid.shape
        for ry in range(r):
            for cx in range(c):
                val = grid[ry, cx]
                color = WHITE if val == 1 else BLACK
                x = cx * (cell + margin) + margin
                y = ry * (cell + margin) + margin
                pygame.draw.rect(screen, color, (x, y, cell, cell))
        pygame.display.flip()

    draw_grid(current)
    print("Controls: R = rotate 90° cw, S = save PNG, ESC or window close = exit.")

    running = True
    while running:
        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                running = False
            elif ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    running = False
                elif ev.key == pygame.K_r:
                    # rotate 90 degrees clockwise
                    current = np.rot90(current, k=-1)  # -1 clockwise
                    draw_grid(current)
                    rotated = not rotated
                elif ev.key == pygame.K_s:
                    # save screenshot
                    fname = f"arecibo_grid_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                    pygame.image.save(screen, fname)
                    print(f"Saved view to {fname}")

    pygame.quit()

# -----------------------
# Main
# -----------------------
def main():
    wav_path = input("Enter WAV file path (e.g. arecibo_complete.wav): ").strip()
    if not wav_path:
        print("No file given. Exiting.")
        return

    print("Decoding... (this may take a moment)")
    try:
        bits, fs, spp = decode_wav_goertzel(wav_path)
    except Exception as e:
        print("Error decoding WAV:", e)
        return

    print(f"Decoded bits: {len(bits)}")
    # minor check
    if len(bits) >= 1679:
        print("It looks like we decoded >=1679 bits. Will use the first 1679 bits for the Arecibo grid.")
    else:
        print("Decoded fewer than 1679 bits — the viewer will pad/trim to show something.")

    show_pygame_grid(bits, rows=ROWS, cols=COLS)

if __name__ == "__main__":
    main()
