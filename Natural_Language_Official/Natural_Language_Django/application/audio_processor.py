import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for Django
import matplotlib.pyplot as plt
from scipy.io import wavfile
from scipy import signal
import json
import io
import base64
import tempfile
import time
import gc  # Add garbage collection
from django.core.files.base import ContentFile
from django.conf import settings
from matplotlib.collections import LineCollection
from matplotlib.colors import ListedColormap, BoundaryNorm


class AudioProcessor:
    def __init__(self):
        self.techy_colors = {
            "Black": "#000000",
            "Vibrant Green": "#00FF00",
            "Electric Cyan": "#00FFFF",
            "Neon Magenta": "#FF00FF",
            "Laser Lemon": "#FFFF66",
            "Screamin' Green": "#66FF66",
            "Hot Pink": "#FF69B4",
            "Electric Blue": "#0000FF",
            "Vivid Red": "#FF0000",
            "Fluorescent Pink": "#FF1493",
            "Deep Sky Blue": "#00BFFF",
            "Vivid Violet": "#9F00FF",
            "Electric Lime": "#CCFF00",
            "Neon Orange": "#FF4500",
            "Bright Yellow": "#FFFF00",
            "Neon Green": "#39FF14",
            "Electric Indigo": "#6F00FF",
            "Vivid Turquoise": "#00CED1",
            "Electric Teal": "#00FFEF",
            "Ultra Violet": "#7F00FF",
            "Radical Red": "#FF355E",
            "Fluorescent Magenta": "#FF00FF",
        }
    
    def generate_custom_wave(self, wave_type='sine', freq=440, spw=100, periods=10):
        """Generate custom waveform based on parameters"""
        total_samples = spw * periods
        sample_rate = int(freq * spw)
        duration = periods / freq
        t = np.linspace(0, duration, total_samples, endpoint=False)
        
        if wave_type == "square":
            wave = np.sign(np.sin(2 * np.pi * freq * t))
        elif wave_type == "triangle":
            wave = signal.sawtooth(2 * np.pi * freq * t, 0.5)
        elif wave_type == "sawtooth":
            wave = signal.sawtooth(2 * np.pi * freq * t)
        else:  # sine
            wave = np.sin(2 * np.pi * freq * t)
        
        # Normalize
        wave /= np.max(np.abs(wave))
        
        return wave, sample_rate
    
    def load_audio_file(self, file_path):
        """Load audio file and normalize"""
        sample_rate, data = wavfile.read(file_path)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        audio_data = data.astype(float) / np.max(np.abs(data))
        return audio_data, sample_rate
    
    def apply_envelope(self, audio_data, envelope_pos, envelope_neg):
        """Apply envelope modifications to audio data"""
        adjusted = np.copy(audio_data)
        for i in range(len(adjusted)):
            if adjusted[i] > 0:
                adjusted[i] = envelope_pos[i] if i < len(envelope_pos) else adjusted[i]
            elif adjusted[i] < 0:
                adjusted[i] = envelope_neg[i] if i < len(envelope_neg) else adjusted[i]
        return adjusted
    
    def strict_sign_subdivision(self, x, y):
        """Create strict sign-based subdivision for coloring"""
        new_x = []
        new_y = []
        color_val = []
        
        n = len(x)
        if n == 0:
            return np.array([]), np.array([]), np.array([])
        
        def sign_color(val):
            return 0 if val < 0 else 1
        
        for i in range(n - 1):
            xi, yi = x[i], y[i]
            xip1, yip1 = x[i + 1], y[i + 1]
            
            new_x.append(xi)
            new_y.append(yi)
            color_val.append(sign_color(yi))
            
            if (yi < 0 and yip1 >= 0) or (yi >= 0 and yip1 < 0):
                dy = yip1 - yi
                t = (0 - yi) / dy if abs(dy) > 1e-12 else 0.5
                x_cross = xi + t * (xip1 - xi)
                crossing_color = 1 if (yi < 0 and yip1 >= 0) else 0
                new_x.append(x_cross)
                new_y.append(0.0)
                color_val.append(crossing_color)
        
        new_x.append(x[-1])
        new_y.append(y[-1])
        color_val.append(sign_color(y[-1]))
        
        return np.array(new_x), np.array(new_y), np.array(color_val)
    
    def plot_strict_sign_colored_line(self, ax, xdata, ydata, neg_color, pos_color, linewidth=2):
        """Plot line with strict sign-based coloring"""
        sx, sy, cvals = self.strict_sign_subdivision(xdata, ydata)
        points = np.array([sx, sy]).T.reshape(-1, 1, 2)
        segments = np.concatenate([points[:-1], points[1:]], axis=1)
        cmap = ListedColormap([neg_color, pos_color])
        norm = BoundaryNorm([-0.5, 0.5, 1.5], cmap.N)
        lc = LineCollection(segments, cmap=cmap, norm=norm)
        lc.set_array(cvals[:-1])
        lc.set_linewidth(linewidth)
        ax.add_collection(lc)
        return lc
    
    def create_visualization(self, audio_data, sample_rate, bg_color, pos_color, neg_color, 
                           viz_type='final', modified_data=None, envelope_pos=None, envelope_neg=None):
        """Create different types of visualizations"""
        
        # Create figure with proper cleanup
        fig = None
        try:
            fig, ax = plt.subplots(1, 1, figsize=(16, 3), facecolor=bg_color)
            fig.subplots_adjust(left=0.06, right=0.98, top=0.95, bottom=0.05)
            ax.set_facecolor(bg_color)
            
            num_points = len(audio_data)
            max_amp = np.max(np.abs(audio_data))
            margin = 0.1 * max_amp
            
            if viz_type == 'final':
                # Show original faint and envelope drawing
                ax.plot(audio_data, color=pos_color, alpha=0.15, lw=1)
                if envelope_pos is not None and envelope_neg is not None:
                    ax.plot(np.arange(num_points), envelope_pos, color=pos_color, lw=2, label="Positive")
                    ax.plot(np.arange(num_points), envelope_neg, color=neg_color, lw=2, label="Negative")
            
            elif viz_type == 'natural':
                # Show modified wave with strict sign coloring
                if modified_data is not None:
                    xdata = np.arange(len(modified_data))
                    self.plot_strict_sign_colored_line(ax, xdata, modified_data, neg_color, pos_color, linewidth=2)
            
            elif viz_type == 'comparison':
                # Show original vs modified
                ax.plot(audio_data, lw=2, color=neg_color, alpha=0.6, label="Original Wave")
                if modified_data is not None:
                    ax.plot(modified_data, lw=2, color=pos_color, alpha=0.8, label="Modified Wave")
            
            ax.set_xlim(0, num_points)
            ax.set_ylim(-max_amp - margin, max_amp + margin)
            ax.tick_params(axis="both", colors="gray")
            for spine in ax.spines.values():
                spine.set_color("gray")
            
            if viz_type in ['final', 'comparison']:
                ax.legend(loc="upper right").get_frame().set_alpha(0.5)
            
            ax.set_aspect("auto")
            
            # Save to bytes with proper buffer handling
            png_buffer = io.BytesIO()
            svg_buffer = io.BytesIO()
            
            try:
                # Save PNG
                fig.savefig(png_buffer, format='png', facecolor=bg_color, dpi=100, bbox_inches='tight')
                png_buffer.seek(0)
                png_data = png_buffer.getvalue()
                
                # Save SVG version
                ax.set_axis_off()
                fig.savefig(svg_buffer, format="svg", transparent=True, bbox_inches="tight", pad_inches=0)
                svg_buffer.seek(0)
                svg_data = svg_buffer.getvalue()
                
                return png_data, svg_data
                
            finally:
                png_buffer.close()
                svg_buffer.close()
                
        except Exception as e:
            raise Exception(f"Error creating visualization: {str(e)}")
        finally:
            # Ensure matplotlib figure is properly closed
            if fig is not None:
                plt.close(fig)
    
    def save_audio_file(self, audio_data, sample_rate):
        """Save audio data to WAV format in memory"""
        import tempfile
        import time
        import gc
        
        # Create a temporary file path for wavfile.write
        temp_file_path = None
        temp_fd = None
        try:
            # Create temporary file with proper cleanup
            temp_fd, temp_file_path = tempfile.mkstemp(suffix='.wav')
            
            # Close the file descriptor immediately to avoid locking issues
            os.close(temp_fd)
            temp_fd = None
            
            # Ensure audio data is properly scaled and typed
            audio_int16 = (np.clip(audio_data, -1.0, 1.0) * 32767).astype(np.int16)
            
            # Write audio data to the temporary file
            wavfile.write(temp_file_path, sample_rate, audio_int16)
            
            # Force garbage collection to ensure file handles are freed
            gc.collect()
            
            # Small delay to ensure Windows releases file handles
            time.sleep(0.05)
            
            # Read the file back into memory
            buffer = io.BytesIO()
            max_read_attempts = 3
            
            for attempt in range(max_read_attempts):
                try:
                    with open(temp_file_path, 'rb') as f:
                        buffer.write(f.read())
                    break
                except PermissionError:
                    if attempt < max_read_attempts - 1:
                        time.sleep(0.1)
                        gc.collect()
                    else:
                        raise
            
            buffer.seek(0)
            return buffer.getvalue()
                
        except Exception as e:
            raise Exception(f"Error saving audio file: {str(e)}")
        finally:
            # Ensure file descriptor is closed if still open
            if temp_fd is not None:
                try:
                    os.close(temp_fd)
                except:
                    pass
                    
            # Clean up temp file with retry logic for Windows
            if temp_file_path and os.path.exists(temp_file_path):
                max_retries = 10
                for attempt in range(max_retries):
                    try:
                        # Force garbage collection before deletion attempt
                        gc.collect()
                        time.sleep(0.02 * (attempt + 1))  # Progressive delay
                        os.unlink(temp_file_path)
                        break
                    except (PermissionError, OSError):
                        if attempt < max_retries - 1:
                            continue
                        else:
                            # If we can't delete after all retries, log it but don't fail
                            print(f"Warning: Could not delete temporary file {temp_file_path}")
                            pass
    
    def process_audio_project(self, project, envelope_data=None):
        """Process complete audio project similar to original script"""
        try:
            project.is_processing = True
            project.processing_error = ""
            project.save()
            
            # Load or generate audio
            if project.wave_type == 'uploaded' and project.original_file:
                audio_data, sample_rate = self.load_audio_file(project.original_file.path)
            else:
                # Generate custom wave
                params = project.wave_parameters
                audio_data, sample_rate = self.generate_custom_wave(
                    wave_type=project.wave_type,
                    freq=params.get('freq', 440),
                    spw=params.get('spw', 100),
                    periods=params.get('periods', 10)
                )
            
            # Apply envelope if provided
            modified_data = audio_data.copy()
            envelope_pos = np.zeros(len(audio_data))
            envelope_neg = np.zeros(len(audio_data))
            
            if envelope_data:
                envelope_pos_list = envelope_data.get('positive', [])
                envelope_neg_list = envelope_data.get('negative', [])
                
                # Ensure envelope arrays match audio data length
                if envelope_pos_list:
                    envelope_pos = np.array(envelope_pos_list[:len(audio_data)])
                    if len(envelope_pos) < len(audio_data):
                        envelope_pos = np.pad(envelope_pos, (0, len(audio_data) - len(envelope_pos)), 'constant')
                
                if envelope_neg_list:
                    envelope_neg = np.array(envelope_neg_list[:len(audio_data)])
                    if len(envelope_neg) < len(audio_data):
                        envelope_neg = np.pad(envelope_neg, (0, len(audio_data) - len(envelope_neg)), 'constant')
                
                modified_data = self.apply_envelope(audio_data, envelope_pos, envelope_neg)
            
            # Save modified audio
            audio_bytes = self.save_audio_file(modified_data, sample_rate)
            project.modified_file.save(
                f'modified_{project.name}_{project.id}.wav',
                ContentFile(audio_bytes),
                save=False
            )
            
            # Create visualizations
            colors = (project.background_color, project.positive_color, project.negative_color)
            
            # Final drawing
            final_png, final_svg = self.create_visualization(
                audio_data, sample_rate, *colors, 'final', modified_data, envelope_pos, envelope_neg
            )
            project.final_drawing.save(
                f'final_{project.name}_{project.id}.png', 
                ContentFile(final_png), 
                save=False
            )
            project.final_drawing_svg.save(
                f'final_{project.name}_{project.id}.svg', 
                ContentFile(final_svg), 
                save=False
            )
            
            # Natural language visualization
            natural_png, natural_svg = self.create_visualization(
                audio_data, sample_rate, *colors, 'natural', modified_data
            )
            project.natural_lang.save(
                f'natural_{project.name}_{project.id}.png', 
                ContentFile(natural_png), 
                save=False
            )
            project.natural_lang_svg.save(
                f'natural_{project.name}_{project.id}.svg', 
                ContentFile(natural_svg), 
                save=False
            )
            
            # Wave comparison
            comp_png, comp_svg = self.create_visualization(
                audio_data, sample_rate, *colors, 'comparison', modified_data
            )
            project.wave_comparison.save(
                f'comparison_{project.name}_{project.id}.png', 
                ContentFile(comp_png), 
                save=False
            )
            project.wave_comparison_svg.save(
                f'comparison_{project.name}_{project.id}.svg', 
                ContentFile(comp_svg), 
                save=False
            )
            
            # Save envelope data
            project.envelope_data = {
                'positive': envelope_pos.tolist(),
                'negative': envelope_neg.tolist()
            }
            
            project.is_processing = False
            project.processing_error = ""
            project.save()
            
            # Force garbage collection to help with file cleanup
            gc.collect()
            
            return True, "Processing completed successfully"
            
        except Exception as e:
            import traceback
            error_message = f"Processing error: {str(e)}\n{traceback.format_exc()}"
            print(error_message)  # Log to console for debugging
            
            project.is_processing = False
            project.processing_error = str(e)
            project.save()
            
            # Force garbage collection even on error
            gc.collect()
            
            return False, str(e)